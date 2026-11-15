import os, json, asyncio, datetime, math, logging
from collections import defaultdict, deque
from zoneinfo import ZoneInfo
from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from contextlib import asynccontextmanager
import websockets

log=logging.getLogger("alpha")
NY=ZoneInfo("America/New_York")
DXB=ZoneInfo("Asia/Dubai")
SYMBOLS=[s.strip().upper() for s in os.getenv("MONITOR_SYMBOLS","AAPL,AMD,INTC,SOFI,PLTR,NVDA").split(",") if s.strip()][:12]
APPROVED={s.strip().upper() for s in os.getenv("SHARIA_APPROVED","").split(",") if s.strip()}
DATA=defaultdict(lambda:deque(maxlen=180))
signals={}
state={"connected":False,"last_bar":None,"message":"Awaiting Alpaca IEX credentials","bars_received":0}
task=None

def clocks():
    now=datetime.datetime.now(datetime.timezone.utc)
    ny=now.astimezone(NY); dub=now.astimezone(DXB)
    session=ny.weekday()<5 and (ny.hour,ny.minute)>=(9,30) and (ny.hour,ny.minute)<(16,0)
    # Holiday/half-day certainty requires broker calendar. Never claim confirmed market-open on schedule alone.
    return {"new_york":ny.isoformat(),"dubai":dub.isoformat(),"weekday_regular_hours":session,"market_status":"unverified_calendar"}

def indicators(bars):
    if len(bars)<45:return None
    close=[b["c"] for b in bars]
    vol=[b["v"] for b in bars]
    last=close[-1]; prev=close[-2]
    if not all(math.isfinite(x) and x>0 for x in close):return None
    alpha=2/21
    ema=close[0]
    for p in close[1:]:ema=alpha*p+(1-alpha)*ema
    total_vol=sum(vol)
    vwap=sum(b["c"]*b["v"] for b in bars)/total_vol if total_vol else 0
    avg_vol=sum(vol[-21:-1])/20
    rv=vol[-1]/avg_vol if avg_vol else 0
    resistance=max(b["h"] for b in bars[-21:-1])
    tr=[max(b["h"]-b["l"],abs(b["h"]-close[i-1]),abs(b["l"]-close[i-1])) for i,b in enumerate(bars) if i>0]
    atr=sum(tr[-14:])/14 if len(tr)>=14 else 0
    if not (0<last<200 and atr>0 and rv>=1.2 and last>ema and last>vwap and last>resistance and last>=prev):return None
    stop=max(0,last-1.25*atr)
    risk=last-stop
    target=last+1.75*risk
    if risk<=0:return None
    return {"symbol":bars[-1]["symbol"],"entry":round(last,4),"stop":round(stop,4),"target":round(target,4),"atr":round(atr,4),"vwap":round(vwap,4),"relative_volume":round(rv,2),"strategy":"IEX breakout / EMA20 / VWAP","time":bars[-1]["t"],"mode":"watch_only","source":"Alpaca IEX (partial market feed)","status":"not_trade_instruction"}

def onbar(msg):
    sym=msg.get("S","").upper()
    if sym not in SYMBOLS:return
    try:
        b={"symbol":sym,"t":msg["t"],"o":float(msg["o"]),"h":float(msg["h"]),"l":float(msg["l"]),"c":float(msg["c"]),"v":float(msg["v"])}
        if b["l"]<=0 or b["h"]<b["l"] or b["c"]>b["h"] or b["c"]<b["l"]:return
    except (KeyError,ValueError,TypeError):return
    bars=DATA[sym]
    if bars and bars[-1]["t"]==b["t"]:bars[-1]=b
    else:bars.append(b)
    state["last_bar"]=b["t"]; state["bars_received"]+=1
    if sym not in APPROVED:
        signals.pop(sym,None)
        return
    # Deny stale bars: 90 seconds. Check as of evaluated bar, not local polling.
    try:
        t=datetime.datetime.fromisoformat(b["t"].replace("Z","+00:00"))
        if abs((datetime.datetime.now(datetime.timezone.utc)-t).total_seconds())>90:
            signals.pop(sym,None);return
    except (TypeError,ValueError):return
    candidate=indicators(list(bars))
    if candidate:signals[sym]=candidate
    else:signals.pop(sym,None)

async def stream():
    key=os.getenv("ALPACA_KEY_ID","");secret=os.getenv("ALPACA_SECRET_KEY","")
    if not key or not secret:
        state["message"]="Missing ALPACA_KEY_ID or ALPACA_SECRET_KEY; no live market data"
        return
    while True:
        try:
            async with websockets.connect("wss://stream.data.alpaca.markets/v2/iex",ping_interval=20,ping_timeout=20) as ws:
                await ws.recv()
                await ws.send(json.dumps({"action":"auth","key":key,"secret":secret}))
                reply=json.loads(await ws.recv())
                if not any(x.get("T")=="success" for x in reply):
                    raise RuntimeError("Alpaca IEX authentication not accepted")
                await ws.send(json.dumps({"action":"subscribe","bars":SYMBOLS}))
                state["connected"]=True;state["message"]="IEX stream connected"
                async for text in ws:
                    for x in json.loads(text):
                        if x.get("T")=="b":onbar(x)
        except asyncio.CancelledError:raise
        except Exception as exc:
            state["connected"]=False
            state["message"]=f"IEX connection unavailable: {type(exc).__name__}"
            log.warning("stream disconnected %s",type(exc).__name__)
            await asyncio.sleep(15)

@asynccontextmanager
async def lifespan(app):
    global task
    task=asyncio.create_task(stream())
    yield
    task.cancel()
    try:await task
    except asyncio.CancelledError:pass

app=FastAPI(title="Islamic Alpha Desk IEX Read-only",lifespan=lifespan)

@app.get("/health")
def health():
    return {"ok":True,"stream_connected":state["connected"],"mode":"research_only","order_execution":False}

@app.get("/api/status")
def status():
    return {"clock":clocks(),"state":state,"feed":"Alpaca IEX","approved_symbols":sorted(APPROVED & set(SYMBOLS)),"monitoring":SYMBOLS,"bars_ready":{s:len(DATA[s]) for s in SYMBOLS},"min_bars":45,"live_trade_execution":False,"warning":"Compliance not certified; IEX is partial exchange data; no guaranteed profits."}

@app.get("/api/signals")
def get_signals():
    # Signals expire even when the websocket drops; report only fresh observations.
    now=datetime.datetime.now(datetime.timezone.utc)
    fresh=[]
    for s,v in list(signals.items()):
        try:
            age=(now-datetime.datetime.fromisoformat(v["time"].replace("Z","+00:00"))).total_seconds()
            if age<=90 and s in APPROVED and state["connected"]:fresh.append(v)
        except (ValueError,TypeError):continue
    return {"signals":fresh,"count":len(fresh),"mode":"watch_only","feed":"IEX","disclaimer":"Research signals, not verified halal investments or orders."}

@app.get("/",response_class=HTMLResponse)
def home():
    return """<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta http-equiv="refresh" content="30"><title>Islamic Alpha Desk</title><style>body{font-family:system-ui;background:#071a22;color:#d9f8ed;padding:22px;max-width:850px;margin:auto}h1{color:#83f1c1}.box{background:#10313b;border:1px solid #23635b;padding:18px;border-radius:18px;margin:14px 0}small{color:#9cb7b2}</style><h1>◉ Islamic Alpha Desk</h1><div class="box">مراقبة IEX فقط — التداول الحقيقي معطّل. لا تظهر الإشارات إلا بعد فحص شرعي مستقل وتكوين 45 شمعة حقيقية.<p id="status">...</p></div><div class="box"><h3>إشارات المراقبة</h3><div id="sig">جار الفحص...</div></div><small>البيانات الجزئية لا تعادل كامل السوق الأمريكي. لا ضمان للأرباح. تحديث تلقائي كل 30 ثانية.</small><script>Promise.all([fetch('/api/status').then(x=>x.json()),fetch('/api/signals').then(x=>x.json())]).then(([s,r])=>{document.getElementById('status').textContent='اتصال البث: '+(s.state.stream_connected?'متصل':'غير متصل')+' | '+s.state.message+' | الأسهم المعتمدة: '+s.approved_symbols.length;document.getElementById('sig').textContent=r.signals.length?JSON.stringify(r.signals,null,2):'لا توجد توصيات مؤهلة حالياً';});</script></html>"""
