#!/usr/bin/env python3
"""Free-tier, fail-closed IEX research scheduler. Never submits orders."""
import os, json, sys, time, datetime as dt, statistics, math, urllib.request, urllib.parse
from zoneinfo import ZoneInfo
from pathlib import Path

NY = ZoneInfo("America/New_York")
UTC = dt.timezone.utc
STATE = Path(os.environ.get("STATE_FILE", ".alpha_state.json"))
REPORT = Path("alpha-desk-pwa/reports/latest.json")
WATCH = [s.strip().upper() for s in os.getenv("MONITOR_SYMBOLS","AAPL,AMD,INTC,SOFI,PLTR,NVDA").split(",") if s.strip()][:12]
APPROVED = {s.strip().upper() for s in os.getenv("SHARIA_APPROVED","").split(",") if s.strip()}
def now(): return dt.datetime.now(UTC)
def get_json(p, default):
    try: return json.loads(Path(p).read_text())
    except (FileNotFoundError, json.JSONDecodeError): return default
def save(p,x):
    p.parent.mkdir(parents=True,exist_ok=True)
    p.write_text(json.dumps(x,ensure_ascii=False,indent=2))
def empty():
    return {"bars":{},"seen":[],"trades":[],"alerts":[],"last_scan":None,"reviews":[]}
def approved_valid():
    try:
        d=dt.date.fromisoformat(os.environ.get("SHARIA_VERIFIED_AT",""))
        return 0 <= (now().date()-d).days <= 30 and len(APPROVED)>0
    except ValueError: return False
def exchange_window():
    # exchange_calendars captures US holidays, early closes and DST changes.
    import exchange_calendars as ec
    cal=ec.get_calendar("XNYS")
    moment=now()
    session=moment.astimezone(NY).date()
    try:
        op=cal.session_open(session).to_pydatetime()
        close=cal.session_close(session).to_pydatetime()
    except (ValueError,KeyError,TypeError): return False
    return op <= moment < close-dt.timedelta(hours=1)
def bars_fresh(b):
    if len(b)<45:return False
    try:
        stamps=[dt.datetime.fromisoformat(x["t"].replace("Z","+00:00")) for x in b]
    except (ValueError,TypeError,KeyError):return False
    if (now()-stamps[-1]).total_seconds()>125:return False
    if (stamps[-1]-stamps[0]).total_seconds()>65*60:return False
    if any(not (0<(y-x).total_seconds()<=125) for x,y in zip(stamps,stamps[1:])):return False
    return True

def compute(sym,b):
    if not bars_fresh(b) or sym not in APPROVED or not approved_valid():return None
    close=[float(x["c"]) for x in b]; vol=[float(x["v"]) for x in b]
    if not all(0<x<200 for x in close[-1:]) or not all(math.isfinite(x) for x in close+vol):return None
    ema=close[0]
    for c in close[1:]: ema=c*2/21+ema*19/21
    total=sum(vol)
    if total<=0:return None
    vwap=sum(float(x["c"])*float(x["v"]) for x in b)/total
    avg=sum(vol[-21:-1])/20
    rv=vol[-1]/avg if avg else 0
    prevhi=max(float(x["h"]) for x in b[-21:-1])
    tr=[max(float(x["h"])-float(x["l"]),abs(float(x["h"])-close[i-1]),abs(float(x["l"])-close[i-1])) for i,x in enumerate(b) if i>0]
    atr=sum(tr[-14:])/14
    price=close[-1]
    if atr<=0 or not (price>ema and price>vwap and price>prevhi and rv>=1.5):return None
    stop=price-1.15*atr
    risk=price-stop
    if stop<=0 or risk<=0:return None
    return {"symbol":sym,"entry":round(price,4),"stop":round(stop,4),"target":round(price+1.6*risk,4),"risk_reward":1.6,"strength":round(min(100,50+min(rv,5)*9),1),"strategy":"IEX ORB / EMA20 / VWAP","source":"Alpaca IEX only","bar_time":b[-1]["t"],"status":"RESEARCH_ONLY","sharia_verified_at":os.getenv("SHARIA_VERIFIED_AT","")}

def notify(msg):
    # Telegram messages are private to the configured chat, unlike public ntfy topics.
    token=os.getenv("TELEGRAM_BOT_TOKEN",""); chat=os.getenv("TELEGRAM_CHAT_ID","")
    if token and chat:
        data=urllib.parse.urlencode({"chat_id":chat,"text":msg,"disable_web_page_preview":"true"}).encode()
        req=urllib.request.Request("https://api.telegram.org/bot"+token+"/sendMessage",data=data)
    elif os.getenv("NTFY_TOPIC",""):
        topic=os.environ["NTFY_TOPIC"]
        if not topic.replace("-","").replace("_","").isalnum() or len(topic)<24:
            return False
        req=urllib.request.Request("https://ntfy.sh/"+topic,data=msg.encode(),headers={"Title":"Islamic Alpha Desk","Priority":"high"})
    else:return False
    try:
        with urllib.request.urlopen(req,timeout=12) as response:
            return 200<=response.status<300
    except Exception as exc:
        print("Notification delivery failed:",type(exc).__name__)
        return False

def read_frames(payload, state):
    for msg in payload:
        if msg.get("T")!="b":continue
        s=msg.get("S","").upper()
        if s not in WATCH:continue
        try:
            b={"t":msg["t"],"o":float(msg["o"]),"h":float(msg["h"]),"l":float(msg["l"]),"c":float(msg["c"]),"v":int(msg["v"])}
        except (KeyError,TypeError,ValueError):continue
        if b["l"]<=0 or b["h"]<b["l"] or not b["l"]<=b["c"]<=b["h"]:continue
        hist=state["bars"].setdefault(s,[])
        if hist and hist[-1]["t"]==b["t"]:hist[-1]=b
        elif not hist or b["t"]>hist[-1]["t"]:hist.append(b)
        state["bars"][s]=hist[-70:]
        signal=compute(s,state["bars"][s])
        if signal:
            k=s+"@"+b["t"]
            if k not in state["seen"]:
                state["seen"].append(k)
                state["alerts"].append(signal)
                state["alerts"]=state["alerts"][-100:]
                message=("🔔 Islamic Alpha Desk — إشارة بحثية فقط\n"+
                    s+" | دخول "+str(signal["entry"])+" | وقف "+str(signal["stop"])+" | هدف "+str(signal["target"])+
                    "\nIEX جزئية؛ لا أوامر تداول، ولا ضمان للنتائج")
                signal["notification_delivered"]=notify(message)
        state["seen"]=state["seen"][-300:]

def live_scan(state):
    key=os.getenv("ALPACA_KEY_ID","");secret=os.getenv("ALPACA_SECRET_KEY","")
    if not key or not secret:
        print("Alpaca credentials missing: NO LIVE ALERTS")
        return
    if not approved_valid():
        print("Vetted Sharia symbols and SHARIA_VERIFIED_AT missing/stale: NO LIVE ALERTS")
        return
    if not exchange_window():
        print("Outside verified NYSE session window: NO LIVE ALERTS")
        return
    import websocket
    sock=websocket.create_connection("wss://stream.data.alpaca.markets/v2/iex",timeout=15)
    sock.settimeout(10)
    try:
        sock.recv()
        sock.send(json.dumps({"action":"auth","key":key,"secret":secret}))
        reply=json.loads(sock.recv())
        if not any(x.get("T")=="success" for x in reply):
            print("Auth failure, no alerts");return
        sock.send(json.dumps({"action":"subscribe","bars":WATCH}))
        # 3m40s window per 5min GitHub scheduler; gaps can occur.
        deadline=time.monotonic()+220
        while time.monotonic()<deadline:
            if not exchange_window():break
            try: read_frames(json.loads(sock.recv()),state)
            except websocket.WebSocketTimeoutException:continue
    finally: sock.close()

def score_trades(trades):
    realized=[t for t in trades if t.get("closed") and t.get("r") is not None]
    by={}
    for t in realized:
        x=by.setdefault(t.get("strategy","unknown"),[])
        x.append(float(t["r"]))
    summary=[]
    for name,rs in by.items():
        summary.append({"strategy":name,"sample":len(rs),"win_rate":round(100*sum(x>0 for x in rs)/len(rs),1),"expectancy_R":round(statistics.mean(rs),3),"eligible_for_review":len(rs)>=30})
    return sorted(summary,key=lambda x:x["expectancy_R"],reverse=True)

def review(state,weekly=False):
    results=score_trades(state.get("trades",[]))
    eligible=[x for x in results if x["eligible_for_review"]]
    notes=[]
    if not results:notes.append("لا توجد صفقات ورقية مغلقة كافية؛ لا يجوز إعلان أفضل استراتيجية")
    elif not eligible:notes.append("العينة أقل من 30 نتيجة لكل استراتيجية؛ التحسينات للمتابعة فقط")
    else:notes.append("مرشح للمراجعة الإحصائية فقط؛ يتطلب اختباراً خارج العينة قبل الاعتماد")
    detail={"generated":now().isoformat(),"mode":"observation_only","strategies":results,"notes":notes,"signals_seen":len(state.get("alerts",[])),"confirmed_trades":len([x for x in state.get("trades",[]) if x.get("closed")]),"weekly_start_usd":1000,"target_week_pct":2,"profit_claimed":False}
    report=get_json(REPORT,{})
    report["last_run"]=now().isoformat();report["mode"]="github_scheduled_best_effort"
    report["weekly_summary" if weekly else "daily_review"]=detail
    save(REPORT,report)
    if weekly and os.getenv("NOTIFY_REPORT","false").lower()=="true":
        notify("📊 تقرير السبت: "+("لا توجد عينة كافية لاعتماد استراتيجية" if not eligible else "نتائج تحليل الأسبوع متاحة، لا تطبيق تلقائي"))
    state["reviews"].append(detail);state["reviews"]=state["reviews"][-14:]

def main():
    command=sys.argv[1] if len(sys.argv)>1 else "scan"
    state=get_json(STATE,empty())
    if command=="scan":
        try:live_scan(state)
        except Exception as exc:print("Scan safely stopped:",type(exc).__name__)
        state["last_scan"]=now().isoformat()
    else:review(state,weekly=command=="weekly")
    save(STATE,state)
    print("Mode:",command,"symbols:",len(state.get("bars",{})),"alerts:",len(state.get("alerts",[])))

if __name__=="__main__":main()
