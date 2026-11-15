# Islamic Alpha Desk — GitHub Actions + Vercel Hobby research PWA

## What has been committed
- Mobile installable PWA: `alpha-desk-pwa/index.html`, manifest and service worker.
- Best-effort unattended market jobs: `.github/workflows/islamic-alpha-session.yml`.
- IEX short WebSocket collection, fail-closed sharia validation, simulated paper exits and daily/Saturday review: `alpha-desk-pwa/engine.py`.
- Last published non-sensitive report: `alpha-desk-pwa/reports/latest.json`.

## One-time setup, required to make it live
1. Connect Vercel and import existing GitHub repository `ameer90s/halal-us-trader`; set project Root Directory `alpha-desk-pwa`, Framework: Other. No custom server or Vercel cron required. The installable PWA is served over HTTPS.
2. In GitHub repository Settings → Secrets and variables → Actions, provide `ALPACA_KEY_ID` and `ALPACA_SECRET_KEY` (Alpaca Basic IEX feed).
3. Provide a vetted Sharia universe as `SHARIA_APPROVED` (comma-separated verified symbols) and `SHARIA_VERIFIED_AT` (YYYY-MM-DD, max 30 days old). **Never substitute a manually guessed stock list for approved Islamic compliance results.**
4. For lock-screen alerts, configure private Telegram Bot token `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` with the bot chat started on your phone (preferred), or install ntfy and set `NTFY_TOPIC` to a random 24+ character topic. Public ntfy topics are readable by anyone who knows the topic, so do not share private portfolio data through them.
5. Enable Actions on the repository (if disabled), confirm scheduled run success, and check a test notification before relying on the system. Scheduled workflow runs can be delayed or dropped.

## What runs and when
- NYSE calendar and daylight saving are evaluated inside the scanner. Monitor 9:30–15:00 New York, shortened for early closing sessions by using exchange-calendar closing time minus one hour.
- GitHub scheduler starts approximately each 5 minutes in the wider UTC window. Each runner opens an IEX WebSocket for up to 3m40s. Observations persist between workflow runs on a best-effort Actions cache, but this is **not a continuous server**.
- On each minute bar, a signal must pass sharia review freshness, under-$200 price, sufficient consecutive real bars, volume strength, EMA, VWAP and breakout logic. Strict freshness and gaps cause the scanner to *reject* rather than manufacture alerts.
- A signal is at most once per symbol per NY trading date. All monitoring alerts are research-only; no brokerage account actions are supported.
- After-session review collects virtual strategy exits (with stop-first when ambiguous), weekly starting capital $1,000, 1% risk sizing, R multiples and paper return. $1,000 is restored when a new ISO week begins.
- Saturday report selects a best **candidate for further review**, only with at least 30 historical virtual outcomes and positive holdout performance; otherwise no recommended setup is declared. The system never silently self-modifies its trading logic.

## Free-tier reality
This is a personal **research / paper-trading experiment**, not a full real-time trading service. GitHub Actions may delay or skip jobs and its cache may expire. Even with secrets, near-live push is not guaranteed. Free Alpaca IEX covers only one exchange and cannot represent the full consolidated US market. This setup has no guaranteed notifications while your phone is locked.

Vercel Hobby is contractually limited to non-commercial personal use. It should not be used for a deployment whose purpose falls under their definition of financial gain. This design disables live order execution.

## Files in the existing repository
All files live under `alpha-desk-pwa/` plus the dedicated workflow. The existing root PWA and prior Android/Railway files have not been deleted or overwritten.
