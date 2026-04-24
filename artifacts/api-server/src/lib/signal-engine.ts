import { db, signalsTable } from "@workspace/db";
import { and, desc, eq, gt, sql } from "drizzle-orm";
import { fetchCandles } from "./binance";
import { ALL_STRATEGIES, type StrategyDefinition } from "./strategies";
import { SUPPORTED_PAIRS, SUPPORTED_TIMEFRAMES } from "./meta";
import { logger } from "./logger";

type Snapshot = {
  generatedAt: number;
  signals: Array<{
    strategyKey: string;
    strategyName: string;
    category: string;
    signal: "BUY" | "SELL" | "WAIT";
    confidence: number;
    entry: number;
    stopLoss: number;
    takeProfit: number;
    pair: string;
    timeframe: string;
    rationale: string;
    riskLevel: string;
    createdAt: string;
  }>;
};

const snapshotCache = new Map<string, Snapshot>();

function key(pair: string, tf: string) {
  return `${pair}|${tf}`;
}

export async function generateSignals(
  pair: string,
  timeframe: string,
  options: { persist?: boolean } = {},
): Promise<Snapshot> {
  const candles = await fetchCandles(pair, timeframe, 250);
  const now = new Date();
  const items: Snapshot["signals"] = [];
  for (const strat of ALL_STRATEGIES) {
    let out;
    try {
      out = strat.run(candles);
    } catch (err) {
      logger.warn({ err, strategyKey: strat.key }, "Strategy crashed");
      continue;
    }
    if (!out) continue;
    items.push({
      strategyKey: strat.key,
      strategyName: strat.name,
      category: strat.category,
      signal: out.signal,
      confidence: out.confidence,
      entry: out.entry,
      stopLoss: out.stopLoss,
      takeProfit: out.takeProfit,
      pair,
      timeframe,
      rationale: out.rationale,
      riskLevel: strat.riskLevel,
      createdAt: now.toISOString(),
    });
  }
  const snapshot: Snapshot = { generatedAt: Date.now(), signals: items };
  snapshotCache.set(key(pair, timeframe), snapshot);

  if (options.persist && items.length > 0) {
    try {
      await db.insert(signalsTable).values(
        items.map((s) => ({
          strategyKey: s.strategyKey,
          strategyName: s.strategyName,
          category: s.category,
          signal: s.signal,
          confidence: s.confidence,
          entry: s.entry,
          stopLoss: s.stopLoss,
          takeProfit: s.takeProfit,
          pair: s.pair,
          timeframe: s.timeframe,
          rationale: s.rationale,
          riskLevel: s.riskLevel,
          createdAt: now,
        })),
      );
    } catch (err) {
      logger.error({ err }, "Failed to persist signals");
    }
  }
  return snapshot;
}

export async function getSnapshot(pair: string, timeframe: string): Promise<Snapshot> {
  const cached = snapshotCache.get(key(pair, timeframe));
  // Refresh if older than 60s
  if (cached && Date.now() - cached.generatedAt < 60_000) return cached;
  return generateSignals(pair, timeframe, { persist: false });
}

export function rankSignals(snapshot: Snapshot) {
  const sorted = [...snapshot.signals].sort((a, b) => b.confidence - a.confidence);
  const actionable = sorted.filter((s) => s.signal !== "WAIT");
  const top = actionable[0] ?? null;
  if (!top) {
    return {
      top: null,
      supporting: [],
      conflicting: [],
      totalStrategies: snapshot.signals.length,
    };
  }
  const supporting = sorted.filter(
    (s) => s.signal === top.signal && s.strategyKey !== top.strategyKey,
  );
  const conflicting = sorted.filter(
    (s) =>
      s.signal !== "WAIT" &&
      s.signal !== top.signal &&
      s.strategyKey !== top.strategyKey,
  );
  return {
    top,
    supporting,
    conflicting,
    totalStrategies: snapshot.signals.length,
  };
}

export function buildConflict(snapshot: Snapshot) {
  const buy = snapshot.signals.filter((s) => s.signal === "BUY").length;
  const sell = snapshot.signals.filter((s) => s.signal === "SELL").length;
  const wait = snapshot.signals.filter((s) => s.signal === "WAIT").length;
  const total = buy + sell;
  let dominant: "BUY" | "SELL" | "WAIT" = "WAIT";
  if (buy > sell) dominant = "BUY";
  else if (sell > buy) dominant = "SELL";
  const hasConflict =
    total >= 2 && buy > 0 && sell > 0 && Math.min(buy, sell) / Math.max(buy, sell) >= 0.4;
  let message = "Strategies are aligned.";
  if (total === 0) message = "All strategies are WAITING — no clear opportunity.";
  else if (hasConflict)
    message = `${buy} BUY vs ${sell} SELL — conflicting signals, proceed with caution.`;
  else if (buy > sell)
    message = `${buy} BUY signals dominate (${sell} SELL).`;
  else if (sell > buy)
    message = `${sell} SELL signals dominate (${buy} BUY).`;
  return {
    hasConflict,
    buyCount: buy,
    sellCount: sell,
    waitCount: wait,
    dominant,
    message,
  };
}

export function buildCategoryBreakdown(snapshot: Snapshot) {
  const map = new Map<
    string,
    { signals: typeof snapshot.signals }
  >();
  for (const s of snapshot.signals) {
    const ent = map.get(s.category) ?? { signals: [] };
    ent.signals.push(s);
    map.set(s.category, ent);
  }
  return Array.from(map.entries()).map(([category, ent]) => {
    const buy = ent.signals.filter((s) => s.signal === "BUY");
    const sell = ent.signals.filter((s) => s.signal === "SELL");
    const wait = ent.signals.filter((s) => s.signal === "WAIT");
    let signal: "BUY" | "SELL" | "WAIT" = "WAIT";
    let dominantArr = wait;
    if (buy.length > sell.length && buy.length >= wait.length) {
      signal = "BUY";
      dominantArr = buy;
    } else if (sell.length > buy.length && sell.length >= wait.length) {
      signal = "SELL";
      dominantArr = sell;
    }
    const avgConf =
      dominantArr.reduce((a, b) => a + b.confidence, 0) /
      Math.max(1, dominantArr.length);
    return {
      category,
      signal,
      avgConfidence: Math.round(avgConf),
      count: ent.signals.length,
    };
  });
}

let backgroundLoopStarted = false;

export function startBackgroundSignalLoop() {
  if (backgroundLoopStarted) return;
  backgroundLoopStarted = true;
  const tick = async () => {
    for (const p of SUPPORTED_PAIRS) {
      for (const tf of SUPPORTED_TIMEFRAMES) {
        try {
          await generateSignals(p.symbol, tf.value, { persist: true });
        } catch (err) {
          logger.warn(
            { err, pair: p.symbol, timeframe: tf.value },
            "Background snapshot failed",
          );
        }
      }
    }
  };
  // Run once immediately, then every 60s
  void tick().catch((err) => logger.error({ err }, "Initial snapshot failed"));
  setInterval(() => {
    void tick().catch((err) => logger.error({ err }, "Background snapshot failed"));
  }, 60_000);
  logger.info("Background signal loop started");
}

export async function getStrategyPerformance(pair: string, timeframe: string) {
  const rows = await db
    .select({
      strategyKey: signalsTable.strategyKey,
      strategyName: signalsTable.strategyName,
      total: sql<number>`count(*)::int`,
      buy: sql<number>`count(*) filter (where ${signalsTable.signal} = 'BUY')::int`,
      sell: sql<number>`count(*) filter (where ${signalsTable.signal} = 'SELL')::int`,
      wait: sql<number>`count(*) filter (where ${signalsTable.signal} = 'WAIT')::int`,
      avgConf: sql<number>`avg(${signalsTable.confidence})::float`,
    })
    .from(signalsTable)
    .where(
      and(
        eq(signalsTable.pair, pair),
        eq(signalsTable.timeframe, timeframe),
      ),
    )
    .groupBy(signalsTable.strategyKey, signalsTable.strategyName);
  return rows.map((r) => ({
    strategyKey: r.strategyKey,
    strategyName: r.strategyName,
    totalSignals: Number(r.total),
    buyCount: Number(r.buy),
    sellCount: Number(r.sell),
    waitCount: Number(r.wait),
    avgConfidence: Math.round(Number(r.avgConf) || 0),
  }));
}

export async function getHistory(
  pair: string,
  timeframe: string,
  limit: number,
  strategyKey?: string,
) {
  const conditions = [
    eq(signalsTable.pair, pair),
    eq(signalsTable.timeframe, timeframe),
  ];
  if (strategyKey) conditions.push(eq(signalsTable.strategyKey, strategyKey));
  const rows = await db
    .select()
    .from(signalsTable)
    .where(and(...conditions))
    .orderBy(desc(signalsTable.createdAt))
    .limit(limit);
  return rows.map((r) => ({
    id: r.id,
    strategyKey: r.strategyKey,
    strategyName: r.strategyName,
    category: r.category as never,
    signal: r.signal as never,
    confidence: r.confidence,
    entry: r.entry,
    stopLoss: r.stopLoss,
    takeProfit: r.takeProfit,
    pair: r.pair,
    timeframe: r.timeframe,
    rationale: r.rationale,
    riskLevel: r.riskLevel as never,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function lastUpdatedAt(pair: string, timeframe: string): Promise<string> {
  const cached = snapshotCache.get(key(pair, timeframe));
  return new Date(cached?.generatedAt ?? Date.now()).toISOString();
}

export function snapshotToSignals(snapshot: Snapshot) {
  return snapshot.signals.map((s, i) => ({
    id: `${s.strategyKey}-${snapshot.generatedAt}-${i}`,
    strategyKey: s.strategyKey,
    strategyName: s.strategyName,
    category: s.category as never,
    signal: s.signal,
    confidence: s.confidence,
    entry: s.entry,
    stopLoss: s.stopLoss,
    takeProfit: s.takeProfit,
    pair: s.pair,
    timeframe: s.timeframe,
    rationale: s.rationale,
    riskLevel: s.riskLevel as never,
    createdAt: s.createdAt,
  }));
}

export type { StrategyDefinition };
