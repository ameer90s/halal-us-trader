#!/usr/bin/env python3
"""Reproducible 5-minute causal research backtest. No real orders, no halal claim."""
import argparse,csv,io,json,math,statistics,urllib.request,sys
from datetime import datetime
from zoneinfo import ZoneInfo
from collections import defaultdict
from pathlib import Path
from strategy_engine import evaluate
URL="https://raw.githubusercontent.com/getdata-finance/intc-5m-ohlcv-stocks-historical-data/main/INTC_5m.csv"
NY=ZoneInfo("America/New_York")
def load_csv(text):
    result=[]
    for row in csv.DictReader(io.StringIO(text)):
        try:
            z=datetime.fromisoformat(row["datetime"].replace("Z","+00:00")).astimezone(NY)
            minute=z.hour*60+z.minute
            if not (570<=minute<960):continue
            b={"t":row["datetime"],"date":z.date().isoformat(),
                "week":f"{z.isocalendar().year}-{z.isocalendar().week:02d}",
                "minute":minute,"o":float(row["open"]),"h":float(row["high"]),
                "l":float(row["low"]),"c":float(row["close"]),"v":float(row["volume"])}
            if not (b["o"]>0 and b["l"]>0 and b["l"]<=b["c"]<=b["h"] and b["l"]<=b["o"]<=b["h"] and b["v"]>=0):continue
            result.append(b)
        except (KeyError,ValueError,TypeError):continue
    result.sort(key=lambda x:x["t"])
    return result

def simulate(rows):
    days=defaultdict(list)
    for b in rows:days[b["date"]].append(b)
    history=[]; trades=[]; candidates={"MOMENTUM_BREAKOUT":0,"BB_REVERSION":0}
    balance=1000.; week=None; weekly=[]
    for day,bars in sorted(days.items()):
        if not bars:continue
        if week!=bars[0]["week"]:
            if week is not None: weekly.append({"week":week,"ending_balance":round(balance,2),"return_pct":round((balance/1000-1)*100,3)})
            week=bars[0]["week"];balance=1000.
        used=0
        active=None
        for i,b in enumerate(bars):
            if active is not None and i>=active["entry_index"]:
                out=None; why=None
                if b["l"]<=active["stop"]:
                    out=active["stop"];why="stop_first"
                elif b["h"]>=active["target"]:
                    out=active["target"];why="target"
                elif b["minute"]>=895 or i==len(bars)-1:
                    out=b["c"];why="session_exit"
                if out is not None:
                    qty=active["qty"]
                    # 0.05% adverse fill on entry/exit; $0.005/share/side cost
                    net=(out*0.9995-active["entry"]*1.0005)*qty-.01*qty
                    balance+=net
                    trades.append({"day":day,"week":week,"strategy":active["strategy"],
                         "entry":round(active["entry"],4),"exit":round(out,4),
                         "qty":qty,"net_usd":round(net,3),"r":round(net/(active["risk"]*qty),3),
                         "reason":why})
                    active=None
            history.append(b)
            if len(history)>350:history=history[-350:]
            if active or used>=2 or b["minute"]>=870 or i+1>=len(bars):continue
            if len(history)<55 or i<8:continue
            calc=evaluate(history,session_bars=bars[:i+1])
            if calc.get("status")!="TECHNICAL_CANDIDATE":continue
            strat=calc["strategy"]; candidates[strat]+=1
            # Signal computed at *closed* bar; enter following bar's open.
            entry=bars[i+1]["o"];stop=min(b["l"],float(calc["indicative_stop"]))
            risk=entry-stop
            if not (0<entry<200 and 0<risk<.035*entry):continue
            target=entry+(1.8 if strat=="MOMENTUM_BREAKOUT" else 1.5)*risk
            qty=min(int(balance/entry),int(max(0,balance)*.01/risk))
            if qty<1:continue
            active={"entry_index":i+1,"entry":entry,"stop":stop,
                    "target":target,"risk":risk,"qty":qty,"strategy":strat}
            used+=1
    if week:weekly.append({"week":week,"ending_balance":round(balance,2),"return_pct":round((balance/1000-1)*100,3)})
    all_days=sorted(days)
    cutoff=all_days[int(len(all_days)*.7)] if all_days else None
    def metrics(ts):
        out={"trades":len(ts),"wins":sum(t["net_usd"]>0 for t in ts)}
        out["win_rate_pct"]=round(out["wins"]*100/len(ts),2) if ts else None
        out["net_usd"]=round(sum(t["net_usd"] for t in ts),2)
        out["expectancy_r"]=round(statistics.mean(t["r"] for t in ts),3) if ts else None
        gains=sum(max(0,t["net_usd"]) for t in ts)
        losses=-sum(min(0,t["net_usd"]) for t in ts)
        out["profit_factor"]=round(gains/losses,3) if losses>0 else None
        return out
    stats={k:metrics([t for t in trades if t["strategy"]==k]) for k in candidates}
    for k in stats:
        stats[k]["train"]=metrics([t for t in trades if t["strategy"]==k and t["day"]<cutoff])
        stats[k]["holdout"]=metrics([t for t in trades if t["strategy"]==k and t["day"]>=cutoff])
        stats[k]["sample_sufficient"]=stats[k]["holdout"]["trades"]>=20
    return {"data_source":URL,"ticker":"INTC","timeframe":"5m",
      "period":[all_days[0],all_days[-1]] if all_days else [],
      "bars":len(rows),"sessions":len(days),"cutoff_date":cutoff,
      "mode":"TECHNICAL_RESEARCH_ONLY_NO_SHARIA_OR_NEWS",
      "source_disclaimer":"Third-party public evaluation sample, accuracy not independently audited; not Alpaca IEX.",
      "method":{"next_bar_open":True,"stop_first_if_both_hit":True,
                "slippage_each_side_pct":0.05,"fees_usd_per_share_per_side":0.005,
                "capital_reset_each_week":1000,"risk_budget_per_trade_pct":1,
                "max_entries_per_day":2,"last_entry_ny":"14:30","force_exit_ny":"14:55"},
      "counts":candidates,"by_strategy":stats,"weekly":weekly,
      "total_net_usd":round(sum(x["net_usd"] for x in trades),2),
      "trades":trades}

def main():
    a=argparse.ArgumentParser()
    a.add_argument("--csv")
    a.add_argument("--output",default="alpha-desk-pwa/reports/historical_backtest.json")
    args=a.parse_args()
    if args.csv:
        text=Path(args.csv).read_text()
    else:
        req=urllib.request.Request(URL,headers={"User-Agent":"IslamicAlphaDesk-research/1.0"})
        with urllib.request.urlopen(req,timeout=45) as resp:
            text=resp.read().decode("utf-8")
    result=simulate(load_csv(text))
    path=Path(args.output);path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text(json.dumps(result,ensure_ascii=False,indent=2))
    print(json.dumps({"period":result["period"],"bars":result["bars"],"by_strategy":result["by_strategy"],"total_net_usd":result["total_net_usd"]},indent=2))

if __name__=="__main__":main()
