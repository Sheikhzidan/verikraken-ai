# VeriKraken AI

Trust-aware AI trading agent using Kraken-style execution flow + ERC-8004-style validation artifacts.

## What it does
- Runs autonomous trading loop (MVP mock market feed)
- Applies risk guardrails:
- position cap
- cooldown
- drawdown-aware safety behavior
- Generates validation artifacts for each decision/trade
- Logs transparent checkpoints and execution trail

## Core Components
- `src/strategy.ts` → signal logic (RSI + EMA + volatility conditions)
- `src/riskGuard.ts` → guardrails and cooldown logic
- `src/krakenExec.ts` → execution adapter (mock now, Kraken CLI-ready)
- `src/erc8004.ts` → validation artifact generation
- `src/loop.ts` → autonomous cycle engine

## Proof (from runtime logs)
- Trade event observed: `ENTER_LONG`
- Risk guard trigger observed: `COOLDOWN ACTIVE`
- Validation artifacts generated in `artifacts/validation.ndjson`
- Runtime trail recorded in `logs/agent.ndjson`

## Run locally
```bash
npm install
npm run dev:agent
