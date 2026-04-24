export const SUPPORTED_PAIRS = [
  { symbol: "BTCUSDT", label: "Bitcoin / USDT" },
  { symbol: "ETHUSDT", label: "Ethereum / USDT" },
  { symbol: "SOLUSDT", label: "Solana / USDT" },
  { symbol: "BNBUSDT", label: "BNB / USDT" },
  { symbol: "XRPUSDT", label: "XRP / USDT" },
] as const;

export const SUPPORTED_TIMEFRAMES = [
  { value: "1m", label: "1 minute", description: "Scalping" },
  { value: "5m", label: "5 minutes", description: "Scalping" },
  { value: "15m", label: "15 minutes", description: "Intraday" },
  { value: "1h", label: "1 hour", description: "Day trading" },
  { value: "4h", label: "4 hours", description: "Swing" },
] as const;

export type Pair = (typeof SUPPORTED_PAIRS)[number]["symbol"];
export type Timeframe = (typeof SUPPORTED_TIMEFRAMES)[number]["value"];

export function isSupportedPair(p: string): p is Pair {
  return SUPPORTED_PAIRS.some((x) => x.symbol === p);
}

export function isSupportedTimeframe(t: string): t is Timeframe {
  return SUPPORTED_TIMEFRAMES.some((x) => x.value === t);
}
