import { logger } from "./logger";
import { getInstrument } from "./instruments";

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

const BASE = "https://query1.finance.yahoo.com/v8/finance/chart";
const UA = "Mozilla/5.0 (compatible; AMTS-Pro/1.0)";

type CacheEntry<T> = { value: T; expiresAt: number };
const candleCache = new Map<string, CacheEntry<Candle[]>>();
const tickerCache = new Map<string, CacheEntry<Ticker>>();

const TF_MAP: Record<string, { interval: string; range: string; ttlMs: number }> = {
  "1m":  { interval: "1m",  range: "1d",  ttlMs: 30_000 },
  "5m":  { interval: "5m",  range: "5d",  ttlMs: 30_000 },
  "15m": { interval: "15m", range: "10d", ttlMs: 30_000 },
  "1h":  { interval: "60m", range: "30d", ttlMs: 60_000 },
  "1d":  { interval: "1d",  range: "1y",  ttlMs: 5 * 60_000 },
};

function key(pair: string, tf: string, limit: number) {
  return `${pair}|${tf}|${limit}`;
}

type YahooChartResponse = {
  chart: {
    result?: Array<{
      meta: {
        regularMarketPrice?: number;
        chartPreviousClose?: number;
        previousClose?: number;
        regularMarketDayHigh?: number;
        regularMarketDayLow?: number;
        regularMarketVolume?: number;
      };
      timestamp?: number[];
      indicators: {
        quote: Array<{
          open?: Array<number | null>;
          high?: Array<number | null>;
          low?: Array<number | null>;
          close?: Array<number | null>;
          volume?: Array<number | null>;
        }>;
      };
    }>;
    error?: { code: string; description: string } | null;
  };
};

async function fetchYahoo(symbol: string, interval: string, range: string): Promise<YahooChartResponse> {
  const url = `${BASE}/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}&includePrePost=false&events=div%2Csplit`;
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" } });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    logger.error({ status: res.status, symbol, text: text.slice(0, 200) }, "Yahoo chart fetch failed");
    throw new Error(`Yahoo chart failed (${res.status}) for ${symbol}`);
  }
  return (await res.json()) as YahooChartResponse;
}

export async function fetchCandles(
  pair: string,
  timeframe: string,
  limit = 250,
): Promise<Candle[]> {
  const cacheK = key(pair, timeframe, limit);
  const cached = candleCache.get(cacheK);
  const now = Date.now();
  if (cached && cached.expiresAt > now) return cached.value;

  const tfCfg = TF_MAP[timeframe];
  if (!tfCfg) throw new Error(`Unsupported timeframe: ${timeframe}`);

  const inst = getInstrument(pair);
  if (!inst) throw new Error(`Unknown instrument: ${pair}`);

  const data = await fetchYahoo(inst.yahooSymbol, tfCfg.interval, tfCfg.range);
  const result = data.chart.result?.[0];
  if (!result || !result.timestamp || !result.indicators?.quote?.[0]) {
    if (cached) return cached.value;
    throw new Error(`No data returned for ${pair}`);
  }
  const ts = result.timestamp;
  const q = result.indicators.quote[0];
  const all: Candle[] = [];
  for (let i = 0; i < ts.length; i += 1) {
    const o = q.open?.[i];
    const h = q.high?.[i];
    const l = q.low?.[i];
    const c = q.close?.[i];
    if (o == null || h == null || l == null || c == null) continue;
    all.push({
      openTime: ts[i]! * 1000,
      open: Number(o),
      high: Number(h),
      low: Number(l),
      close: Number(c),
      volume: Number(q.volume?.[i] ?? 0),
    });
  }
  const candles = all.slice(-limit);
  candleCache.set(cacheK, { value: candles, expiresAt: now + tfCfg.ttlMs });
  return candles;
}

export async function fetchTicker(pair: string): Promise<Ticker> {
  const cached = tickerCache.get(pair);
  const now = Date.now();
  if (cached && cached.expiresAt > now) return cached.value;

  const inst = getInstrument(pair);
  if (!inst) throw new Error(`Unknown instrument: ${pair}`);

  // Use 1d/5m chart — gives current price + previous close + day high/low.
  const data = await fetchYahoo(inst.yahooSymbol, "5m", "1d");
  const result = data.chart.result?.[0];
  if (!result) {
    if (cached) return cached.value;
    throw new Error(`No ticker data for ${pair}`);
  }
  const meta = result.meta;
  const last = Number(meta.regularMarketPrice ?? 0);
  const prev = Number(meta.chartPreviousClose ?? meta.previousClose ?? last);
  const change = last - prev;
  const pct = prev !== 0 ? (change / prev) * 100 : 0;
  const ticker: Ticker = {
    pair,
    lastPrice: last,
    change24h: change,
    changePercent24h: pct,
    high24h: Number(meta.regularMarketDayHigh ?? last),
    low24h: Number(meta.regularMarketDayLow ?? last),
    volume24h: Number(meta.regularMarketVolume ?? 0),
    updatedAt: new Date().toISOString(),
  };
  tickerCache.set(pair, { value: ticker, expiresAt: now + 30_000 });
  return ticker;
}
