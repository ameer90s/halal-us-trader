# Islamic Alpha Desk v4 — isolated deployment
This directory is a separate IEX monitoring backend. Existing Halal Trader root files remain untouched.

## Security & data
- `ALPACA_KEY_ID`, `ALPACA_SECRET_KEY` are server-only Railway secrets; never add to GitHub or APK.
- Data feed is Alpaca IEX, NOT consolidated US market.
- The service displays **NO LIVE RECOMMENDATIONS** until a verifiable Sharia approved symbol list is configured, and sufficient live bars are collected.
- `EXECUTE_LIVE_ORDERS=false` is mandatory in this edition.
- Preview/demo and live information must never be confused.

## Railway settings
Root directory: `/alpha-desk-api`; Dockerfile: `Dockerfile`; health check: `/health`; port read from Railway `PORT`.
Required for real market data: `ALPACA_KEY_ID` and `ALPACA_SECRET_KEY`.
Optional compliance: `SHARIA_APPROVED` only after verification and periodic review; never assume a symbol is compliant.

## Android
The workflow `.github/workflows/islamic-alpha-apk.yml` builds a **debug APK** using an isolated WebView shell. Initially it asks for the Railway HTTPS URL. Do not put broker keys in Android.

Existing app preserved. Debug APK is for personal testing, not Play Store distribution.
