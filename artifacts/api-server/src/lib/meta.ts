import { ALL_INSTRUMENTS, ASSET_CLASS_LABELS, getInstrument } from "./instruments";

export const SUPPORTED_PAIRS = ALL_INSTRUMENTS.map((i) => ({
  symbol: i.symbol,
  label: i.displayName,
  assetClass: i.assetClass,
  assetClassLabel: ASSET_CLASS_LABELS[i.assetClass],
}));

export const SUPPORTED_TIMEFRAMES = [
  { value: "1m", label: "1 minute", description: "Scalping" },
  { value: "5m", label: "5 minutes", description: "Scalping" },
  { value: "15m", label: "15 minutes", description: "Intraday" },
  { value: "1h", label: "1 hour", description: "Day trading" },
  { value: "1d", label: "1 day", description: "Swing / Position" },
] as const;

export type Pair = string;
export type Timeframe = (typeof SUPPORTED_TIMEFRAMES)[number]["value"];

export function isSupportedPair(p: string): p is Pair {
  return getInstrument(p) !== undefined;
}

export function isSupportedTimeframe(t: string): t is Timeframe {
  return SUPPORTED_TIMEFRAMES.some((x) => x.value === t);
}

// Small "watchlist" used by the background loop so we keep the history table
// fresh for popular instruments without hammering Yahoo for all 600+.
export const BACKGROUND_WATCHLIST: Array<{ symbol: string; timeframes: string[] }> = [
  { symbol: "BTC-USD", timeframes: ["15m", "1h", "1d"] },
  { symbol: "ETH-USD", timeframes: ["15m", "1h", "1d"] },
  { symbol: "SOL-USD", timeframes: ["1h", "1d"] },
  { symbol: "EURUSD", timeframes: ["15m", "1h", "1d"] },
  { symbol: "GBPUSD", timeframes: ["1h", "1d"] },
  { symbol: "USDJPY", timeframes: ["1h", "1d"] },
  { symbol: "GOLD", timeframes: ["1h", "1d"] },
  { symbol: "WTI", timeframes: ["1h", "1d"] },
  { symbol: "SPX", timeframes: ["1h", "1d"] },
  { symbol: "NDX", timeframes: ["1h", "1d"] },
  { symbol: "SPY", timeframes: ["1h", "1d"] },
  { symbol: "QQQ", timeframes: ["1h", "1d"] },
  { symbol: "AAPL", timeframes: ["1h", "1d"] },
  { symbol: "NVDA", timeframes: ["1h", "1d"] },
  { symbol: "TSLA", timeframes: ["1h", "1d"] },
];
