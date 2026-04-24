import type { Candle } from "./binance";

export function ema(values: number[], period: number): number[] {
  if (values.length === 0) return [];
  const k = 2 / (period + 1);
  const out: number[] = [];
  let prev = values[0]!;
  out.push(prev);
  for (let i = 1; i < values.length; i++) {
    const v = values[i]!;
    prev = v * k + prev * (1 - k);
    out.push(prev);
  }
  return out;
}

export function sma(values: number[], period: number): number[] {
  const out: number[] = [];
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i]!;
    if (i >= period) sum -= values[i - period]!;
    out.push(i >= period - 1 ? sum / period : NaN);
  }
  return out;
}

export function rsi(values: number[], period = 14): number[] {
  const out: number[] = new Array(values.length).fill(NaN);
  if (values.length < period + 1) return out;
  let gainSum = 0;
  let lossSum = 0;
  for (let i = 1; i <= period; i++) {
    const diff = values[i]! - values[i - 1]!;
    if (diff >= 0) gainSum += diff;
    else lossSum -= diff;
  }
  let avgGain = gainSum / period;
  let avgLoss = lossSum / period;
  out[period] = 100 - 100 / (1 + (avgLoss === 0 ? Infinity : avgGain / avgLoss));
  for (let i = period + 1; i < values.length; i++) {
    const diff = values[i]! - values[i - 1]!;
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    out[i] = 100 - 100 / (1 + (avgLoss === 0 ? Infinity : avgGain / avgLoss));
  }
  return out;
}

export type MACDResult = {
  macd: number[];
  signal: number[];
  histogram: number[];
};

export function macd(
  values: number[],
  fast = 12,
  slow = 26,
  signalPeriod = 9,
): MACDResult {
  const emaFast = ema(values, fast);
  const emaSlow = ema(values, slow);
  const macdLine = values.map((_, i) => emaFast[i]! - emaSlow[i]!);
  const signal = ema(macdLine, signalPeriod);
  const histogram = macdLine.map((v, i) => v - signal[i]!);
  return { macd: macdLine, signal, histogram };
}

export type BBands = { upper: number[]; middle: number[]; lower: number[] };

export function bollinger(values: number[], period = 20, stdDev = 2): BBands {
  const middle = sma(values, period);
  const upper: number[] = [];
  const lower: number[] = [];
  for (let i = 0; i < values.length; i++) {
    if (i < period - 1) {
      upper.push(NaN);
      lower.push(NaN);
      continue;
    }
    const slice = values.slice(i - period + 1, i + 1);
    const mean = middle[i]!;
    const variance =
      slice.reduce((acc, v) => acc + (v - mean) ** 2, 0) / period;
    const sd = Math.sqrt(variance);
    upper.push(mean + stdDev * sd);
    lower.push(mean - stdDev * sd);
  }
  return { upper, middle, lower };
}

export function atr(candles: Candle[], period = 14): number[] {
  const trs: number[] = [];
  for (let i = 0; i < candles.length; i++) {
    const c = candles[i]!;
    if (i === 0) {
      trs.push(c.high - c.low);
      continue;
    }
    const prevClose = candles[i - 1]!.close;
    trs.push(
      Math.max(
        c.high - c.low,
        Math.abs(c.high - prevClose),
        Math.abs(c.low - prevClose),
      ),
    );
  }
  return sma(trs, period);
}

export function recentSwingHigh(candles: Candle[], lookback = 30): number {
  const slice = candles.slice(-lookback);
  return Math.max(...slice.map((c) => c.high));
}

export function recentSwingLow(candles: Candle[], lookback = 30): number {
  const slice = candles.slice(-lookback);
  return Math.min(...slice.map((c) => c.low));
}

export function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, n));
}
