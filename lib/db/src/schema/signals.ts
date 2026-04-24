import {
  pgTable,
  uuid,
  text,
  doublePrecision,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

export const signalsTable = pgTable(
  "signals",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    strategyKey: text("strategy_key").notNull(),
    strategyName: text("strategy_name").notNull(),
    category: text("category").notNull(),
    signal: text("signal").notNull(),
    confidence: doublePrecision("confidence").notNull(),
    entry: doublePrecision("entry").notNull(),
    stopLoss: doublePrecision("stop_loss").notNull(),
    takeProfit: doublePrecision("take_profit").notNull(),
    pair: text("pair").notNull(),
    timeframe: text("timeframe").notNull(),
    rationale: text("rationale").notNull(),
    riskLevel: text("risk_level").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("signals_pair_tf_idx").on(table.pair, table.timeframe, table.createdAt),
    index("signals_strategy_idx").on(table.strategyKey, table.createdAt),
  ],
);

export type Signal = typeof signalsTable.$inferSelect;
export type InsertSignal = typeof signalsTable.$inferInsert;
