import type { Candle } from "./binance";
import {
  ema,
  sma,
  rsi,
  macd,
  bollinger,
  atr,
  recentSwingHigh,
  recentSwingLow,
  clamp,
} from "./indicators";

export type SignalType = "BUY" | "SELL" | "WAIT";
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";
export type Mode = "BEGINNER" | "PRO";
export type Category =
  | "TREND"
  | "RANGE"
  | "MOMENTUM"
  | "BREAKOUT"
  | "SCALPING"
  | "SWING"
  | "PRICE_ACTION"
  | "SMART_MONEY"
  | "SUPPLY_DEMAND"
  | "INDICATOR"
  | "QUANT"
  | "CRYPTO"
  | "HIGH_RISK";

export type StrategyMeta = {
  key: string;
  name: string;
  category: Category;
  mode: Mode;
  riskLevel: RiskLevel;
  description: string;
  logic: string;
};

export type StrategyOutput = {
  signal: SignalType;
  confidence: number;
  entry: number;
  stopLoss: number;
  takeProfit: number;
  rationale: string;
};

export type StrategyDefinition = StrategyMeta & {
  run: (candles: Candle[]) => StrategyOutput | null;
};

function lastDefined(vals: number[]): number {
  for (let i = vals.length - 1; i >= 0; i--) {
    if (Number.isFinite(vals[i]!)) return vals[i]!;
  }
  return NaN;
}

function makeOutput(
  signal: SignalType,
  confidence: number,
  entry: number,
  stop: number,
  take: number,
  rationale: string,
): StrategyOutput {
  return {
    signal,
    confidence: clamp(Math.round(confidence)),
    entry: round(entry),
    stopLoss: round(stop),
    takeProfit: round(take),
    rationale,
  };
}

function round(n: number): number {
  if (!Number.isFinite(n)) return 0;
  if (n >= 1000) return Math.round(n * 100) / 100;
  if (n >= 1) return Math.round(n * 10000) / 10000;
  return Math.round(n * 1_000_000) / 1_000_000;
}

// ---- Strategy implementations ----

const emaCrossover: StrategyDefinition = {
  key: "ema_crossover",
  name: "EMA 50 / 200 Crossover",
  category: "TREND",
  mode: "BEGINNER",
  riskLevel: "MEDIUM",
  description:
    "Classic moving-average crossover. Trades in the direction of the longer-term trend.",
  logic:
    "BUY when EMA50 crosses above EMA200 (golden cross). SELL on death cross. Confidence scales with EMA spread relative to price.",
  run: (c) => {
    if (c.length < 210) return null;
    const closes = c.map((x) => x.close);
    const e50 = ema(closes, 50);
    const e200 = ema(closes, 200);
    const last = closes[closes.length - 1]!;
    const a = e50[e50.length - 1]!;
    const b = e200[e200.length - 1]!;
    const aPrev = e50[e50.length - 2]!;
    const bPrev = e200[e200.length - 2]!;
    const spread = (a - b) / b;
    const atrVal = lastDefined(atr(c, 14)) || last * 0.01;
    let signal: SignalType = "WAIT";
    let conf = 40;
    let rationale = "EMA50 and EMA200 are tightly coiled — no clear trend.";
    if (a > b && aPrev <= bPrev) {
      signal = "BUY";
      conf = 75 + Math.min(15, spread * 1000);
      rationale = "Golden cross: EMA50 just crossed above EMA200.";
    } else if (a < b && aPrev >= bPrev) {
      signal = "SELL";
      conf = 75 + Math.min(15, -spread * 1000);
      rationale = "Death cross: EMA50 just crossed below EMA200.";
    } else if (a > b) {
      signal = "BUY";
      conf = 55 + Math.min(25, spread * 800);
      rationale = `Uptrend: EMA50 ${(spread * 100).toFixed(2)}% above EMA200.`;
    } else if (a < b) {
      signal = "SELL";
      conf = 55 + Math.min(25, -spread * 800);
      rationale = `Downtrend: EMA50 ${(-spread * 100).toFixed(2)}% below EMA200.`;
    }
    const stop = signal === "BUY" ? last - atrVal * 2 : last + atrVal * 2;
    const take = signal === "BUY" ? last + atrVal * 4 : last - atrVal * 4;
    return makeOutput(signal, conf, last, stop, take, rationale);
  },
};

const movingAverageTrend: StrategyDefinition = {
  key: "ma_trend",
  name: "Moving Average Trend",
  category: "TREND",
  mode: "BEGINNER",
  riskLevel: "LOW",
  description: "Tracks price relative to a long-term SMA to confirm trend bias.",
  logic: "BUY if price > SMA100 by more than 1%. SELL if below by more than 1%.",
  run: (c) => {
    if (c.length < 110) return null;
    const closes = c.map((x) => x.close);
    const m = sma(closes, 100);
    const last = closes[closes.length - 1]!;
    const ma = lastDefined(m);
    const dev = (last - ma) / ma;
    const atrVal = lastDefined(atr(c, 14)) || last * 0.01;
    let signal: SignalType = "WAIT";
    let conf = 35;
    let rationale = `Price within 1% of SMA100 (${(dev * 100).toFixed(2)}%) — trend unclear.`;
    if (dev > 0.01) {
      signal = "BUY";
      conf = 50 + Math.min(35, dev * 600);
      rationale = `Price ${(dev * 100).toFixed(2)}% above SMA100 — uptrend confirmed.`;
    } else if (dev < -0.01) {
      signal = "SELL";
      conf = 50 + Math.min(35, -dev * 600);
      rationale = `Price ${(-dev * 100).toFixed(2)}% below SMA100 — downtrend confirmed.`;
    }
    const stop = signal === "BUY" ? last - atrVal * 1.8 : last + atrVal * 1.8;
    const take = signal === "BUY" ? last + atrVal * 3.5 : last - atrVal * 3.5;
    return makeOutput(signal, conf, last, stop, take, rationale);
  },
};

const supportResistance: StrategyDefinition = {
  key: "support_resistance",
  name: "Support & Resistance",
  category: "RANGE",
  mode: "BEGINNER",
  riskLevel: "MEDIUM",
  description: "Buy near recent support, sell near recent resistance.",
  logic:
    "Identifies recent 30-bar swing high and low. BUY within 1% of support, SELL within 1% of resistance.",
  run: (c) => {
    if (c.length < 40) return null;
    const last = c[c.length - 1]!.close;
    const high = recentSwingHigh(c, 30);
    const low = recentSwingLow(c, 30);
    const range = high - low;
    if (range <= 0) return null;
    const distLow = (last - low) / range;
    const distHigh = (high - last) / range;
    const atrVal = lastDefined(atr(c, 14)) || last * 0.01;
    let signal: SignalType = "WAIT";
    let conf = 40;
    let rationale = "Price mid-range — neither at support nor resistance.";
    if (distLow < 0.15) {
      signal = "BUY";
      conf = 60 + (1 - distLow / 0.15) * 30;
      rationale = `Near support at ${round(low)} — bounce setup.`;
    } else if (distHigh < 0.15) {
      signal = "SELL";
      conf = 60 + (1 - distHigh / 0.15) * 30;
      rationale = `Near resistance at ${round(high)} — rejection setup.`;
    }
    const stop = signal === "BUY" ? low - atrVal : high + atrVal;
    const take = signal === "BUY" ? high : low;
    return makeOutput(signal, conf, last, stop, take, rationale);
  },
};

const horizontalRange: StrategyDefinition = {
  key: "horizontal_range",
  name: "Horizontal Range Trade",
  category: "RANGE",
  mode: "PRO",
  riskLevel: "MEDIUM",
  description: "Trades within tight horizontal channels using bollinger walls.",
  logic: "BUY when price tags lower band; SELL when price tags upper band; only when bands are narrow.",
  run: (c) => {
    if (c.length < 30) return null;
    const closes = c.map((x) => x.close);
    const bb = bollinger(closes, 20, 2);
    const last = closes[closes.length - 1]!;
    const u = lastDefined(bb.upper);
    const l = lastDefined(bb.lower);
    const m = lastDefined(bb.middle);
    const width = (u - l) / m;
    const atrVal = lastDefined(atr(c, 14)) || last * 0.01;
    let signal: SignalType = "WAIT";
    let conf = 35;
    let rationale = "Outside ideal range conditions.";
    if (width < 0.05) {
      if (last <= l * 1.005) {
        signal = "BUY";
        conf = 70;
        rationale = `Price hit lower Bollinger band in tight range (${(width * 100).toFixed(2)}% width).`;
      } else if (last >= u * 0.995) {
        signal = "SELL";
        conf = 70;
        rationale = `Price hit upper Bollinger band in tight range (${(width * 100).toFixed(2)}% width).`;
      } else {
        rationale = "Tight range but price mid-band — wait for edge.";
        conf = 45;
      }
    } else {
      rationale = `Range too wide (${(width * 100).toFixed(2)}%) — not range-bound.`;
    }
    const stop = signal === "BUY" ? l - atrVal : u + atrVal;
    const take = signal === "BUY" ? m : m;
    return makeOutput(signal, conf, last, stop, take, rationale);
  },
};

const rsiOverbought: StrategyDefinition = {
  key: "rsi",
  name: "RSI Overbought / Oversold",
  category: "MOMENTUM",
  mode: "BEGINNER",
  riskLevel: "MEDIUM",
  description: "Mean-reversion signal from the Relative Strength Index.",
  logic: "BUY when RSI < 30 (oversold), SELL when RSI > 70 (overbought).",
  run: (c) => {
    if (c.length < 20) return null;
    const closes = c.map((x) => x.close);
    const r = rsi(closes, 14);
    const last = closes[closes.length - 1]!;
    const v = lastDefined(r);
    const atrVal = lastDefined(atr(c, 14)) || last * 0.01;
    let signal: SignalType = "WAIT";
    let conf = 30;
    let rationale = `RSI at ${v.toFixed(1)} — neutral momentum.`;
    if (v < 30) {
      signal = "BUY";
      conf = 70 + (30 - v) * 1.2;
      rationale = `RSI at ${v.toFixed(1)} — oversold, mean-reversion BUY.`;
    } else if (v > 70) {
      signal = "SELL";
      conf = 70 + (v - 70) * 1.2;
      rationale = `RSI at ${v.toFixed(1)} — overbought, mean-reversion SELL.`;
    } else if (v < 40) {
      signal = "BUY";
      conf = 50;
      rationale = `RSI at ${v.toFixed(1)} — leaning oversold.`;
    } else if (v > 60) {
      signal = "SELL";
      conf = 50;
      rationale = `RSI at ${v.toFixed(1)} — leaning overbought.`;
    }
    const stop = signal === "BUY" ? last - atrVal * 1.5 : last + atrVal * 1.5;
    const take = signal === "BUY" ? last + atrVal * 2.5 : last - atrVal * 2.5;
    return makeOutput(signal, conf, last, stop, take, rationale);
  },
};

const breakout: StrategyDefinition = {
  key: "breakout",
  name: "Resistance Breakout",
  category: "BREAKOUT",
  mode: "PRO",
  riskLevel: "HIGH",
  description: "Trades breaks of recent swing highs and lows on volume.",
  logic:
    "BUY when close breaks 30-bar high with above-average volume. SELL on break below 30-bar low.",
  run: (c) => {
    if (c.length < 35) return null;
    const last = c[c.length - 1]!;
    const prevHigh = recentSwingHigh(c.slice(0, -1), 30);
    const prevLow = recentSwingLow(c.slice(0, -1), 30);
    const recentVols = c.slice(-30).map((x) => x.volume);
    const avgVol = recentVols.reduce((a, b) => a + b, 0) / recentVols.length;
    const volRatio = last.volume / (avgVol || 1);
    const atrVal = lastDefined(atr(c, 14)) || last.close * 0.01;
    let signal: SignalType = "WAIT";
    let conf = 30;
    let rationale = "No breakout — price within recent range.";
    if (last.close > prevHigh) {
      signal = "BUY";
      conf = 65 + Math.min(25, (volRatio - 1) * 20);
      rationale = `Broke above ${round(prevHigh)} on ${volRatio.toFixed(2)}x volume.`;
    } else if (last.close < prevLow) {
      signal = "SELL";
      conf = 65 + Math.min(25, (volRatio - 1) * 20);
      rationale = `Broke below ${round(prevLow)} on ${volRatio.toFixed(2)}x volume.`;
    }
    const stop = signal === "BUY" ? prevHigh - atrVal : prevLow + atrVal;
    const take =
      signal === "BUY"
        ? last.close + (last.close - prevHigh + atrVal) * 2
        : last.close - (prevLow - last.close + atrVal) * 2;
    return makeOutput(signal, conf, last.close, stop, take, rationale);
  },
};

const breakHold: StrategyDefinition = {
  key: "break_hold",
  name: "Break and Hold",
  category: "BREAKOUT",
  mode: "PRO",
  riskLevel: "MEDIUM",
  description: "Confirms a breakout has held above the broken level for several bars.",
  logic: "Waits for 3 closes above prior 20-bar high (BUY) or below prior 20-bar low (SELL).",
  run: (c) => {
    if (c.length < 25) return null;
    const last = c[c.length - 1]!;
    const slice = c.slice(-23, -3);
    const high = Math.max(...slice.map((x) => x.high));
    const low = Math.min(...slice.map((x) => x.low));
    const last3 = c.slice(-3);
    const heldAbove = last3.every((x) => x.close > high);
    const heldBelow = last3.every((x) => x.close < low);
    const atrVal = lastDefined(atr(c, 14)) || last.close * 0.01;
    let signal: SignalType = "WAIT";
    let conf = 35;
    let rationale = "No confirmed break-and-hold structure.";
    if (heldAbove) {
      signal = "BUY";
      conf = 78;
      rationale = `Held above ${round(high)} for 3 bars — breakout confirmed.`;
    } else if (heldBelow) {
      signal = "SELL";
      conf = 78;
      rationale = `Held below ${round(low)} for 3 bars — breakdown confirmed.`;
    }
    const stop = signal === "BUY" ? high - atrVal : low + atrVal;
    const take = signal === "BUY" ? last.close + atrVal * 3 : last.close - atrVal * 3;
    return makeOutput(signal, conf, last.close, stop, take, rationale);
  },
};

const scalping: StrategyDefinition = {
  key: "scalp_micro",
  name: "Micro-Trend Scalp",
  category: "SCALPING",
  mode: "PRO",
  riskLevel: "HIGH",
  description: "Fast EMA9/EMA21 crossover for short timeframes.",
  logic: "BUY when EMA9 > EMA21 with bullish momentum on last bar; opposite for SELL.",
  run: (c) => {
    if (c.length < 30) return null;
    const closes = c.map((x) => x.close);
    const e9 = ema(closes, 9);
    const e21 = ema(closes, 21);
    const last = closes[closes.length - 1]!;
    const a = e9[e9.length - 1]!;
    const b = e21[e21.length - 1]!;
    const lastCandle = c[c.length - 1]!;
    const bullish = lastCandle.close > lastCandle.open;
    const atrVal = lastDefined(atr(c, 14)) || last * 0.005;
    let signal: SignalType = "WAIT";
    let conf = 35;
    let rationale = "EMA9/21 not aligned for scalping.";
    if (a > b && bullish) {
      signal = "BUY";
      conf = 60 + Math.min(20, ((a - b) / b) * 1000);
      rationale = "EMA9 above EMA21 + bullish bar — fast long entry.";
    } else if (a < b && !bullish) {
      signal = "SELL";
      conf = 60 + Math.min(20, ((b - a) / b) * 1000);
      rationale = "EMA9 below EMA21 + bearish bar — fast short entry.";
    }
    const stop = signal === "BUY" ? last - atrVal * 1.2 : last + atrVal * 1.2;
    const take = signal === "BUY" ? last + atrVal * 1.8 : last - atrVal * 1.8;
    return makeOutput(signal, conf, last, stop, take, rationale);
  },
};

const swingFib: StrategyDefinition = {
  key: "swing_fib",
  name: "Fibonacci Retracement Swing",
  category: "SWING",
  mode: "PRO",
  riskLevel: "MEDIUM",
  description: "Looks for pullbacks to 0.5 / 0.618 fib levels in a trending market.",
  logic: "In an uptrend, BUY when price retraces to the 0.5–0.618 zone of the recent swing.",
  run: (c) => {
    if (c.length < 60) return null;
    const last = c[c.length - 1]!.close;
    const high = recentSwingHigh(c, 50);
    const low = recentSwingLow(c, 50);
    const range = high - low;
    if (range <= 0) return null;
    const closes = c.map((x) => x.close);
    const e50 = ema(closes, 50);
    const trendUp = last > e50[e50.length - 1]!;
    const fib50Up = high - range * 0.5;
    const fib618Up = high - range * 0.618;
    const fib50Down = low + range * 0.5;
    const fib618Down = low + range * 0.618;
    const atrVal = lastDefined(atr(c, 14)) || last * 0.01;
    let signal: SignalType = "WAIT";
    let conf = 35;
    let rationale = "Price not at fib retracement zone.";
    if (trendUp && last <= fib50Up && last >= fib618Up) {
      signal = "BUY";
      conf = 72;
      rationale = `Pullback to 0.5–0.618 fib (${round(fib618Up)}–${round(fib50Up)}) in uptrend.`;
    } else if (!trendUp && last >= fib50Down && last <= fib618Down) {
      signal = "SELL";
      conf = 72;
      rationale = `Bounce into 0.5–0.618 fib (${round(fib50Down)}–${round(fib618Down)}) in downtrend.`;
    }
    const stop = signal === "BUY" ? low : high;
    const take = signal === "BUY" ? high : low;
    return makeOutput(signal, conf, last, stop, take, rationale);
  },
};

const macdStrategy: StrategyDefinition = {
  key: "macd",
  name: "MACD Momentum",
  category: "INDICATOR",
  mode: "PRO",
  riskLevel: "MEDIUM",
  description: "MACD line crossover with the signal line indicates momentum shift.",
  logic: "BUY on bullish MACD crossover with positive histogram; SELL on bearish crossover.",
  run: (c) => {
    if (c.length < 50) return null;
    const closes = c.map((x) => x.close);
    const m = macd(closes);
    const last = closes[closes.length - 1]!;
    const a = m.macd[m.macd.length - 1]!;
    const b = m.signal[m.signal.length - 1]!;
    const aPrev = m.macd[m.macd.length - 2]!;
    const bPrev = m.signal[m.signal.length - 2]!;
    const hist = m.histogram[m.histogram.length - 1]!;
    const atrVal = lastDefined(atr(c, 14)) || last * 0.01;
    let signal: SignalType = "WAIT";
    let conf = 35;
    let rationale = `MACD ${a.toFixed(4)} vs signal ${b.toFixed(4)} — no crossover.`;
    if (a > b && aPrev <= bPrev && hist > 0) {
      signal = "BUY";
      conf = 75;
      rationale = "Bullish MACD crossover with rising histogram.";
    } else if (a < b && aPrev >= bPrev && hist < 0) {
      signal = "SELL";
      conf = 75;
      rationale = "Bearish MACD crossover with falling histogram.";
    } else if (a > b && hist > 0) {
      signal = "BUY";
      conf = 55;
      rationale = "MACD above signal — bullish momentum continuing.";
    } else if (a < b && hist < 0) {
      signal = "SELL";
      conf = 55;
      rationale = "MACD below signal — bearish momentum continuing.";
    }
    const stop = signal === "BUY" ? last - atrVal * 2 : last + atrVal * 2;
    const take = signal === "BUY" ? last + atrVal * 3.5 : last - atrVal * 3.5;
    return makeOutput(signal, conf, last, stop, take, rationale);
  },
};

const bollingerSqueeze: StrategyDefinition = {
  key: "bollinger",
  name: "Bollinger Bands",
  category: "INDICATOR",
  mode: "PRO",
  riskLevel: "MEDIUM",
  description: "Trades price interactions with the Bollinger Bands envelope.",
  logic: "BUY on touches of lower band, SELL on touches of upper band, in non-trending markets.",
  run: (c) => {
    if (c.length < 25) return null;
    const closes = c.map((x) => x.close);
    const bb = bollinger(closes, 20, 2);
    const last = closes[closes.length - 1]!;
    const u = lastDefined(bb.upper);
    const l = lastDefined(bb.lower);
    const m = lastDefined(bb.middle);
    const atrVal = lastDefined(atr(c, 14)) || last * 0.01;
    let signal: SignalType = "WAIT";
    let conf = 35;
    let rationale = `Price near Bollinger middle ${round(m)}.`;
    if (last <= l) {
      signal = "BUY";
      conf = 68;
      rationale = `Closed at/below lower band ${round(l)}.`;
    } else if (last >= u) {
      signal = "SELL";
      conf = 68;
      rationale = `Closed at/above upper band ${round(u)}.`;
    } else if (last < l * 1.005) {
      signal = "BUY";
      conf = 55;
      rationale = `Approaching lower band ${round(l)}.`;
    } else if (last > u * 0.995) {
      signal = "SELL";
      conf = 55;
      rationale = `Approaching upper band ${round(u)}.`;
    }
    const stop = signal === "BUY" ? l - atrVal : u + atrVal;
    const take = signal === "BUY" ? m : m;
    return makeOutput(signal, conf, last, stop, take, rationale);
  },
};

const volumeSurge: StrategyDefinition = {
  key: "volume_surge",
  name: "Volume Surge",
  category: "INDICATOR",
  mode: "PRO",
  riskLevel: "HIGH",
  description: "Detects price moves backed by abnormal volume.",
  logic: "Volume > 2x 20-bar average + bullish/bearish bar = directional signal.",
  run: (c) => {
    if (c.length < 25) return null;
    const last = c[c.length - 1]!;
    const recent = c.slice(-21, -1);
    const avg = recent.reduce((a, b) => a + b.volume, 0) / recent.length;
    const ratio = last.volume / (avg || 1);
    const bullish = last.close > last.open;
    const atrVal = lastDefined(atr(c, 14)) || last.close * 0.01;
    let signal: SignalType = "WAIT";
    let conf = 30;
    let rationale = `Volume normal (${ratio.toFixed(2)}x average).`;
    if (ratio > 2 && bullish) {
      signal = "BUY";
      conf = 65 + Math.min(20, (ratio - 2) * 8);
      rationale = `Volume ${ratio.toFixed(2)}x average + bullish bar.`;
    } else if (ratio > 2 && !bullish) {
      signal = "SELL";
      conf = 65 + Math.min(20, (ratio - 2) * 8);
      rationale = `Volume ${ratio.toFixed(2)}x average + bearish bar.`;
    }
    const stop = signal === "BUY" ? last.low - atrVal : last.high + atrVal;
    const take = signal === "BUY" ? last.close + atrVal * 3 : last.close - atrVal * 3;
    return makeOutput(signal, conf, last.close, stop, take, rationale);
  },
};

const liquidityZone: StrategyDefinition = {
  key: "smc_liquidity",
  name: "SMC Liquidity Zones",
  category: "SMART_MONEY",
  mode: "PRO",
  riskLevel: "HIGH",
  description: "Smart-money concept — trades stop-hunts at recent liquidity pools.",
  logic:
    "BUY when price wicks below recent swing low and reclaims it (stop-hunt). SELL on opposite.",
  run: (c) => {
    if (c.length < 30) return null;
    const last = c[c.length - 1]!;
    const prevSlice = c.slice(-30, -1);
    const swingLow = Math.min(...prevSlice.map((x) => x.low));
    const swingHigh = Math.max(...prevSlice.map((x) => x.high));
    const atrVal = lastDefined(atr(c, 14)) || last.close * 0.01;
    let signal: SignalType = "WAIT";
    let conf = 35;
    let rationale = "No liquidity sweep detected.";
    if (last.low < swingLow && last.close > swingLow) {
      signal = "BUY";
      conf = 78;
      rationale = `Wick below ${round(swingLow)} and reclaim — stop-hunt long.`;
    } else if (last.high > swingHigh && last.close < swingHigh) {
      signal = "SELL";
      conf = 78;
      rationale = `Wick above ${round(swingHigh)} and rejection — stop-hunt short.`;
    }
    const stop = signal === "BUY" ? last.low - atrVal * 0.5 : last.high + atrVal * 0.5;
    const take = signal === "BUY" ? last.close + atrVal * 4 : last.close - atrVal * 4;
    return makeOutput(signal, conf, last.close, stop, take, rationale);
  },
};

const orderBlock: StrategyDefinition = {
  key: "smc_order_block",
  name: "SMC Order Block",
  category: "SMART_MONEY",
  mode: "PRO",
  riskLevel: "HIGH",
  description: "Identifies the last opposing candle before a strong impulse move.",
  logic: "Marks the order block; BUY when price returns to a bullish OB, SELL to a bearish OB.",
  run: (c) => {
    if (c.length < 25) return null;
    const recent = c.slice(-20);
    let bullishOB: { low: number; high: number } | null = null;
    let bearishOB: { low: number; high: number } | null = null;
    for (let i = 1; i < recent.length - 1; i++) {
      const prev = recent[i - 1]!;
      const cur = recent[i]!;
      const next = recent[i + 1]!;
      const impulseUp = next.close - cur.close > Math.abs(cur.close - prev.close) * 1.5;
      const impulseDown = cur.close - next.close > Math.abs(cur.close - prev.close) * 1.5;
      if (impulseUp && cur.close < cur.open) bullishOB = { low: cur.low, high: cur.high };
      if (impulseDown && cur.close > cur.open) bearishOB = { low: cur.low, high: cur.high };
    }
    const last = c[c.length - 1]!;
    const atrVal = lastDefined(atr(c, 14)) || last.close * 0.01;
    let signal: SignalType = "WAIT";
    let conf = 35;
    let rationale = "No active order block in proximity.";
    if (bullishOB && last.close >= bullishOB.low && last.close <= bullishOB.high) {
      signal = "BUY";
      conf = 70;
      rationale = `Price tagged bullish OB ${round(bullishOB.low)}–${round(bullishOB.high)}.`;
    } else if (bearishOB && last.close >= bearishOB.low && last.close <= bearishOB.high) {
      signal = "SELL";
      conf = 70;
      rationale = `Price tagged bearish OB ${round(bearishOB.low)}–${round(bearishOB.high)}.`;
    }
    const stop = signal === "BUY" ? (bullishOB?.low ?? last.low) - atrVal : (bearishOB?.high ?? last.high) + atrVal;
    const take = signal === "BUY" ? last.close + atrVal * 3.5 : last.close - atrVal * 3.5;
    return makeOutput(signal, conf, last.close, stop, take, rationale);
  },
};

const supplyDemand: StrategyDefinition = {
  key: "supply_demand",
  name: "Supply & Demand Zones",
  category: "SUPPLY_DEMAND",
  mode: "PRO",
  riskLevel: "MEDIUM",
  description: "Zone-based entries from clusters of price congestion.",
  logic: "Identifies the densest 5% price band over 50 bars; trades reversion into that zone.",
  run: (c) => {
    if (c.length < 60) return null;
    const slice = c.slice(-50);
    const high = Math.max(...slice.map((x) => x.high));
    const low = Math.min(...slice.map((x) => x.low));
    const buckets = 20;
    const step = (high - low) / buckets;
    if (step <= 0) return null;
    const counts = new Array<number>(buckets).fill(0);
    for (const candle of slice) {
      const idx = Math.min(buckets - 1, Math.floor((candle.close - low) / step));
      counts[idx] = (counts[idx] ?? 0) + 1;
    }
    const maxIdx = counts.indexOf(Math.max(...counts));
    const zoneLow = low + step * maxIdx;
    const zoneHigh = zoneLow + step;
    const last = c[c.length - 1]!.close;
    const atrVal = lastDefined(atr(c, 14)) || last * 0.01;
    let signal: SignalType = "WAIT";
    let conf = 35;
    let rationale = "Price away from major demand/supply cluster.";
    if (last < zoneLow) {
      signal = "BUY";
      conf = 60;
      rationale = `Below demand cluster ${round(zoneLow)}–${round(zoneHigh)} — reversion long.`;
    } else if (last > zoneHigh) {
      signal = "SELL";
      conf = 60;
      rationale = `Above supply cluster ${round(zoneLow)}–${round(zoneHigh)} — reversion short.`;
    }
    const stop = signal === "BUY" ? last - atrVal * 1.5 : last + atrVal * 1.5;
    const take = signal === "BUY" ? zoneHigh : zoneLow;
    return makeOutput(signal, conf, last, stop, take, rationale);
  },
};

const candlestickPattern: StrategyDefinition = {
  key: "candle_pattern",
  name: "Candlestick Patterns",
  category: "PRICE_ACTION",
  mode: "PRO",
  riskLevel: "MEDIUM",
  description: "Recognizes hammer, shooting star, and engulfing patterns.",
  logic: "Bullish patterns → BUY, bearish patterns → SELL.",
  run: (c) => {
    if (c.length < 5) return null;
    const last = c[c.length - 1]!;
    const prev = c[c.length - 2]!;
    const body = Math.abs(last.close - last.open);
    const upperWick = last.high - Math.max(last.close, last.open);
    const lowerWick = Math.min(last.close, last.open) - last.low;
    const range = last.high - last.low || 0.0001;
    const atrVal = lastDefined(atr(c, 14)) || last.close * 0.01;
    let signal: SignalType = "WAIT";
    let conf = 35;
    let rationale = "No notable candlestick pattern.";

    const bullishEngulf =
      last.close > last.open &&
      prev.close < prev.open &&
      last.close > prev.open &&
      last.open < prev.close;
    const bearishEngulf =
      last.close < last.open &&
      prev.close > prev.open &&
      last.close < prev.open &&
      last.open > prev.close;
    const hammer = lowerWick > body * 2 && upperWick < body * 0.5 && body / range < 0.4;
    const shootingStar = upperWick > body * 2 && lowerWick < body * 0.5 && body / range < 0.4;

    if (bullishEngulf) {
      signal = "BUY";
      conf = 75;
      rationale = "Bullish engulfing candle.";
    } else if (bearishEngulf) {
      signal = "SELL";
      conf = 75;
      rationale = "Bearish engulfing candle.";
    } else if (hammer && last.close > last.open) {
      signal = "BUY";
      conf = 65;
      rationale = "Hammer candle — buyers stepped in below.";
    } else if (shootingStar && last.close < last.open) {
      signal = "SELL";
      conf = 65;
      rationale = "Shooting star — sellers rejected above.";
    }
    const stop = signal === "BUY" ? last.low - atrVal * 0.5 : last.high + atrVal * 0.5;
    const take = signal === "BUY" ? last.close + atrVal * 3 : last.close - atrVal * 3;
    return makeOutput(signal, conf, last.close, stop, take, rationale);
  },
};

const meanReversion: StrategyDefinition = {
  key: "mean_reversion",
  name: "Statistical Mean Reversion",
  category: "QUANT",
  mode: "PRO",
  riskLevel: "MEDIUM",
  description: "Z-score reversion to a 50-bar mean.",
  logic: "Z-score below -2 → BUY; above +2 → SELL.",
  run: (c) => {
    if (c.length < 60) return null;
    const closes = c.map((x) => x.close);
    const slice = closes.slice(-50);
    const mean = slice.reduce((a, b) => a + b, 0) / slice.length;
    const variance = slice.reduce((acc, v) => acc + (v - mean) ** 2, 0) / slice.length;
    const sd = Math.sqrt(variance);
    const last = closes[closes.length - 1]!;
    const z = (last - mean) / (sd || 1);
    const atrVal = lastDefined(atr(c, 14)) || last * 0.01;
    let signal: SignalType = "WAIT";
    let conf = 35;
    let rationale = `Z-score ${z.toFixed(2)} — within normal range.`;
    if (z < -2) {
      signal = "BUY";
      conf = 70 + Math.min(20, (-z - 2) * 10);
      rationale = `Z-score ${z.toFixed(2)} — statistically oversold.`;
    } else if (z > 2) {
      signal = "SELL";
      conf = 70 + Math.min(20, (z - 2) * 10);
      rationale = `Z-score ${z.toFixed(2)} — statistically overbought.`;
    }
    const stop = signal === "BUY" ? last - atrVal * 1.5 : last + atrVal * 1.5;
    const take = signal === "BUY" ? mean : mean;
    return makeOutput(signal, conf, last, stop, take, rationale);
  },
};

const gridTrading: StrategyDefinition = {
  key: "grid",
  name: "Crypto Grid",
  category: "CRYPTO",
  mode: "PRO",
  riskLevel: "MEDIUM",
  description: "Symmetric grid logic — bias toward buys at bottom of grid, sells at top.",
  logic: "Splits 20-bar range into 5 zones; BUY in lowest zone, SELL in highest zone.",
  run: (c) => {
    if (c.length < 25) return null;
    const slice = c.slice(-20);
    const high = Math.max(...slice.map((x) => x.high));
    const low = Math.min(...slice.map((x) => x.low));
    const last = c[c.length - 1]!.close;
    const range = high - low;
    if (range <= 0) return null;
    const pct = (last - low) / range;
    const atrVal = lastDefined(atr(c, 14)) || last * 0.01;
    let signal: SignalType = "WAIT";
    let conf = 40;
    let rationale = `In middle grid zone (${(pct * 100).toFixed(0)}% of range).`;
    if (pct < 0.2) {
      signal = "BUY";
      conf = 65;
      rationale = `Lowest grid zone (${(pct * 100).toFixed(0)}%) — accumulate.`;
    } else if (pct > 0.8) {
      signal = "SELL";
      conf = 65;
      rationale = `Highest grid zone (${(pct * 100).toFixed(0)}%) — distribute.`;
    }
    const stop = signal === "BUY" ? low - atrVal : high + atrVal;
    const take = signal === "BUY" ? high : low;
    return makeOutput(signal, conf, last, stop, take, rationale);
  },
};

const martingale: StrategyDefinition = {
  key: "martingale",
  name: "Martingale (HIGH RISK)",
  category: "HIGH_RISK",
  mode: "PRO",
  riskLevel: "HIGH",
  description:
    "HIGH RISK strategy that doubles down after losses. Suggested only for educational purposes.",
  logic:
    "Always issues a counter-trend signal vs the last 5-bar move. Confidence intentionally capped at 45.",
  run: (c) => {
    if (c.length < 6) return null;
    const last = c[c.length - 1]!.close;
    const five = c[c.length - 6]!.close;
    const drift = (last - five) / five;
    const atrVal = lastDefined(atr(c, 14)) || last * 0.01;
    let signal: SignalType = "WAIT";
    let conf = 30;
    let rationale = "Drift too small to fade.";
    if (drift > 0.005) {
      signal = "SELL";
      conf = 35 + Math.min(10, drift * 200);
      rationale = `Last 5 bars rose ${(drift * 100).toFixed(2)}% — fade the move.`;
    } else if (drift < -0.005) {
      signal = "BUY";
      conf = 35 + Math.min(10, -drift * 200);
      rationale = `Last 5 bars fell ${(-drift * 100).toFixed(2)}% — fade the move.`;
    }
    const stop = signal === "BUY" ? last - atrVal * 3 : last + atrVal * 3;
    const take = signal === "BUY" ? last + atrVal * 1.5 : last - atrVal * 1.5;
    return makeOutput(signal, Math.min(45, conf), last, stop, take, rationale);
  },
};

export const ALL_STRATEGIES: StrategyDefinition[] = [
  emaCrossover,
  movingAverageTrend,
  supportResistance,
  horizontalRange,
  rsiOverbought,
  breakout,
  breakHold,
  scalping,
  swingFib,
  macdStrategy,
  bollingerSqueeze,
  volumeSurge,
  liquidityZone,
  orderBlock,
  supplyDemand,
  candlestickPattern,
  meanReversion,
  gridTrading,
  martingale,
];

export const STRATEGY_BY_KEY: Record<string, StrategyDefinition> = Object.fromEntries(
  ALL_STRATEGIES.map((s) => [s.key, s]),
);
