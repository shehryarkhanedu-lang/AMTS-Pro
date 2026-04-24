# AMTS Pro – Multi-Strategy Trading Intelligence Platform

## Overview

AMTS Pro is a full-stack SaaS web app that produces BUY/SELL/WAIT trading signals across 19 strategies grouped into categories (Trend, Range, Momentum, Breakout, Scalping, Swing, Indicators, Smart Money, Supply/Demand, Price Action, Quant, Crypto). Each strategy runs independently on cached OHLC data and outputs a confidence-scored signal; the engine ranks them, surfaces a top pick with supporting/conflicting signals, computes per-category consensus, and persists a history for backtesting.

The platform is read-only intelligence — no auto-trading, no payments, no auth. User preferences live in `localStorage`.

## Architecture

pnpm monorepo. Three artifacts:

- `artifacts/amts-pro` (web, `/`) — React + Vite + wouter + TanStack Query, dark theme with amber accent. Pages: Dashboard, Signals, Strategies, History, Settings.
- `artifacts/api-server` (api, `/api`) — Express 5, Drizzle ORM, Pino. Serves 11 REST endpoints. A background loop refreshes signals for every (pair, timeframe) pair every ~60s and persists to Postgres.
- `artifacts/mockup-sandbox` (design) — Vite preview server for canvas component prototyping.

Shared code lives in `lib/`:
- `lib/api-spec/openapi.yaml` — single source of truth, drives Orval codegen for typed React Query hooks (`@workspace/api-react-query`) and zod request/response validators (`@workspace/api-zod`).
- `lib/db` — Drizzle schema (`signalsTable` indexed on pair+timeframe and strategyKey).

### API server modules
- `lib/meta.ts` — supported pairs (BTC, ETH, BNB, SOL, XRP) and timeframes (1m, 5m, 15m, 1h, 4h).
- `lib/binance.ts` — fetches OHLC + ticker from Binance.US (Binance.com is geo-blocked from Replit). Cached per (pair, timeframe).
- `lib/indicators.ts` — EMA, SMA, RSI, MACD, Bollinger Bands, ATR.
- `lib/strategies.ts` — 19 strategy implementations (`ema_crossover`, `ma_trend`, `support_resistance`, `horizontal_range`, `rsi`, `breakout`, `break_hold`, `scalp_micro`, `swing_fib`, `macd`, `bollinger`, `volume_surge`, `smc_liquidity`, `smc_order_block`, `supply_demand`, `candle_pattern`, `mean_reversion`, `grid`, `martingale`).
- `lib/signal-engine.ts` — snapshot cache, ranking (top + supporting + conflicting), category consensus, history persistence, performance stats, background refresh loop.

## Data source

Binance.US public REST API (`https://api.binance.us`). Same contract as Binance.com but available from Replit infrastructure.

## Database

Replit Postgres via `DATABASE_URL`. Schema pushed with `pnpm --filter @workspace/db run push`.

## Conventions

- Add a route file under `artifacts/api-server/src/routes/`, register it in `routes/index.ts`.
- Every handler validates query params with the generated zod schema (`safeParse`), returns `res.status(400).json({ error })` on failure.
- Every response is parsed through the generated `*Response` zod schema before sending.
- Frontend never calls fetch directly — always use generated TanStack Query hooks from `@workspace/api-react-query`.
- See skills (`.local/skills/*`) for artifact, workflow, deployment, and integration conventions.
