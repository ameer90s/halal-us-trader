"""Transparent, causal 5-minute signal logic. NOT licensed Pro Scalper source code.
All inputs are completed 5-minute OHLCV bars; signals are research-only and use no future candles.
"""
from statistics import mean, pstdev
from datetime import datetime
import math

def ema(values, period):
    if len(values)<period: return None
    e=values[0]
    k=2/(period+1)
    for x in values[1:]: e+=k*(x-e)
    return e

def rsi(values, period=14):
    if len(values)<period+2: return None
    ups=[]; downs=[]
    for i in range(1,len(values)):
        d=values[i]-values[i-1]
        ups.append(max(d,0));downs.append(max(-d,0))
    gain=mean(ups[:period]);loss=mean(downs[:period])
    for u,d in zip(ups[period:],downs[period:]):
        gain=(gain*(period-1)+u)/period
        loss=(loss*(period-1)+d)/period
    if loss==0: return 100 if gain>0 else 50
    return 100-100/(1+gain/loss)

def bb(values,period=20,k=2):
    if len(values)<period:return None
    v=values[-period:]
    mid=mean(v);dev=pstdev(v)
    return mid-k*dev,mid,mid+k*dev

def atr(bars,period=14):
    if len(bars)<period+1:return None
    tr=[max(b["h"]-b["l"],abs(b["h"]-bars[i-1]["c"]),abs(b["l"]-bars[i-1]["c"])) for i,b in enumerate(bars) if i>0]
    result=tr[0]
    for x in tr[1:]:result=(result*(period-1)+x)/period
    return result

def session_vwap(bars):
    if not bars:return None
    total=sum(b["v"] for b in bars)
    return sum(((b["h"]+b["l"]+b["c"])/3)*b["v"] for b in bars)/total if total>0 else None

def evaluate(five_minute_bars, *, session_bars=None, news_verified=False, sharia_verified=False):
    """At least 55 completed bars. Return strictly non-executable research candidate.
    news_verified/sharia_verified are separate provenance gates, never inferred from price.
    """
    b=five_minute_bars
    if len(b)<55:return {"status":"INSUFFICIENT_DATA"}
    last=b[-1];prev=b[-2]
    closes=[x["c"] for x in b]; vols=[x["v"] for x in b]
    price=last["c"]
    if not 0<price<200 or any(x["v"]<0 or x["l"]<=0 or x["l"]>x["h"] for x in b[-55:]):
        return {"status":"REJECTED_PRICE_OR_BAR"}
    cur_rsi=rsi(closes);low,mid,high=bb(closes)
    priorlow,_,_=bb(closes[:-1])
    vwap=session_vwap(session_bars if session_bars is not None else b)
    e9=ema(closes,9);e20=ema(closes,20);e50=ema(closes,50)
    volbase=mean(vols[-21:-1])
    rv=last["v"]/volbase if volbase>0 else 0
    body=abs(last["c"]-last["o"])/max(1e-7,last["h"]-last["l"])
    recenthigh=max(x["h"] for x in b[-13:-1])
    a=atr(b)
    if not a or not vwap:return {"status":"INSUFFICIENT_DATA"}
    # Our documented Pro-Scalper-like confirmation = bullish candle body + EMA9>EMA20
    # and close > prior close. It is NOT a replica of a proprietary indicator.
    scalper_confirm=(price>last["o"] and price>=prev["c"] and e9>=e20 and body>=0.32)
    watch_breakout=(scalper_confirm and body>=.38 and 52<=cur_rsi<=73 and
      rv>=1.10 and price>=recenthigh*.998 and price>mid and price>vwap and e20>=e50*.997)
    breakout=(scalper_confirm and body>=.50 and 55<=cur_rsi<=77 and
      rv>=1.2 and price>recenthigh and price>high and price>vwap and e20>e50)
    watch_reversal=(price>last["o"] and price>=prev["c"] and body>=.30 and 32<cur_rsi<57 and rv>=.9 and
      (prev["l"]<=priorlow*1.004 or prev["c"]<mid) and price>low and price<=mid*1.004 and price>e9*.992)
    reversal=(scalper_confirm and 30<cur_rsi<52 and rv>=1.0 and
      prev["l"]<=priorlow and price>low and price<mid)
    kind="MOMENTUM_BREAKOUT" if breakout else "BB_REVERSION" if reversal else None
    if not kind:
        if watch_breakout or watch_reversal:
            return {"status":"WATCH_CANDIDATE","strategy":"MOMENTUM_BREAKOUT" if watch_breakout else "BB_REVERSION","rsi":round(cur_rsi,2),"rvol":round(rv,2),"notification":False}
        return {"status":"NO_SIGNAL","rsi":round(cur_rsi,2),"rvol":round(rv,2)}
    stop=min(last["l"],price-(1.15 if breakout else 1.2)*a)
    risk=price-stop
    if risk<=0 or risk>price*.035:return {"status":"RISK_VETO"}
    target=price+1.8*risk if breakout else max(mid,price+1.5*risk)
    if (target-price)/risk<1.45:return {"status":"RISK_REWARD_VETO"}
    detail={"status":"TECHNICAL_CANDIDATE","strategy":kind,"signal_close":round(price,4),
      "next_bar_entry_required":True,"indicative_stop":round(stop,4),
      "indicative_target":round(target,4),"rsi14":round(cur_rsi,2),
      "bb20_lower":round(low,4),"bb20_mid":round(mid,4),"bb20_upper":round(high,4),
      "vwap":round(vwap,4),"rvol":round(rv,2),"atr14":round(a,4),
      "scalper_confirmation":"transparent candle confirmation and EMA9/EMA20 trend filter",
      "trading_mode":"PAPER_RESEARCH_ONLY","news_verified":news_verified,"sharia_verified":sharia_verified,"ruleset_version":"dual_tier_v3","confidence":"rule_based_not_statistically_calibrated"}
    # Never send an 'approved' recommendation without vetted separate evidence.
    if sharia_verified: detail["status"]="RESEARCH_CONFIRMED" if news_verified else "TECHNICALLY_CONFIRMED_NO_CATALYST"
    return detail

def aggregate_1m_to_5m(bars):
    """Only consecutive completed minute bars; no look-ahead."""
    buckets={}
    for x in bars:
        dt=datetime.fromisoformat(x["t"].replace("Z","+00:00"))
        bucket=dt.replace(minute=(dt.minute//5)*5,second=0,microsecond=0).isoformat()
        buckets.setdefault(bucket,[]).append(x)
    out=[]
    for stamp,group in sorted(buckets.items()):
        group.sort(key=lambda z:z["t"])
        if len(group)!=5:continue
        mins=[datetime.fromisoformat(z["t"].replace("Z","+00:00")) for z in group]
        if any((mins[i+1]-mins[i]).total_seconds()!=60 for i in range(4)):continue
        out.append({"t":stamp,"o":group[0]["o"],"h":max(z["h"] for z in group),
                    "l":min(z["l"] for z in group),"c":group[-1]["c"],
                    "v":sum(z["v"] for z in group)})
    return out
