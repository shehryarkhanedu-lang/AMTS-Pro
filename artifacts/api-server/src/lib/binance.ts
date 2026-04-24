import { logger } from "./logger";

export type Candle = {
  openTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type Ticker = {
  pair: string;
  lastPrice: number;
  change24h: number;
  changePercent24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  updatedAt: string;
};

const BASE = "https://api.binance.us";

type CacheEntry<T> = { value: T; expiresAt: number };
const candleCache = new Map<string, CacheEntry<Candle[]>>();
const tickerCache = new Map<string, CacheEntry<Ticker>>();

function cacheKey(pair: string, tf: string, limit: number) {
  return `${pair}|${tf}|${limit}`;
}

export async function fetchCandles(
  pair: string,
  timeframe: string,
  limit = 200,
): Promise<Candle[]> {
  const key = cacheKey(pair, timeframe, limit);
  const cached = candleCache.get(key);
  const now = Date.now();
  if (cached && cached.expiresAt > now) return cached.value;

  const url = `${BASE}/api/v3/klines?symbol=${encodeURIComponent(pair)}&interval=${encodeURIComponent(timeframe)}&limit=${limit}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "AMTS-Pro/1.0" },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    logger.error({ status: res.status, text }, "Binance klines fetch failed");
    if (cached) return cached.value;
    throw new Error(`Binance klines failed: ${res.status}`);
  }
  const raw = (await res.json()) as unknown[];
  const candles: Candle[] = raw.map((row) => {
    const r = row as (string | number)[];
    return {
      openTime: Number(r[0]),
      open: Number(r[1]),
      high: Number(r[2]),
      low: Number(r[3]),
      close: Number(r[4]),
      volume: Number(r[5]),
    };
  });

  // Cache for ~30s — slightly less than refresh interval
  candleCache.set(key, { value: candles, expiresAt: now + 30_000 });
  return candles;
}

export async function fetchTicker(pair: string): Promise<Ticker> {
  const cached = tickerCache.get(pair);
  const now = Date.now();
  if (cached && cached.expiresAt > now) return cached.value;

  const url = `${BASE}/api/v3/ticker/24hr?symbol=${encodeURIComponent(pair)}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "AMTS-Pro/1.0" },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    logger.error({ status: res.status, text }, "Binance ticker fetch failed");
    if (cached) return cached.value;
    throw new Error(`Binance ticker failed: ${res.status}`);
  }
  const data = (await res.json()) as Record<string, string>;
  const ticker: Ticker = {
    pair,
    lastPrice: Number(data.lastPrice),
    change24h: Number(data.priceChange),
    changePercent24h: Number(data.priceChangePercent),
    high24h: Number(data.highPrice),
    low24h: Number(data.lowPrice),
    volume24h: Number(data.volume),
    updatedAt: new Date().toISOString(),
  };
  tickerCache.set(pair, { value: ticker, expiresAt: now + 15_000 });
  return ticker;
}
