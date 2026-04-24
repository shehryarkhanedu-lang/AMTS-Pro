import { Router, type IRouter } from "express";
import {
  GetDashboardSummaryQueryParams,
  GetDashboardSummaryResponse,
} from "@workspace/api-zod";
import { fetchTicker } from "../lib/binance";
import {
  buildCategoryBreakdown,
  buildConflict,
  getSnapshot,
  rankSignals,
  snapshotToSignals,
} from "../lib/signal-engine";

const router: IRouter = Router();

router.get("/dashboard/summary", async (req, res): Promise<void> => {
  const parsed = GetDashboardSummaryQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
    const [snapshot, ticker] = await Promise.all([
      getSnapshot(parsed.data.pair, parsed.data.timeframe),
      fetchTicker(parsed.data.pair),
    ]);
    const ranked = rankSignals(snapshot);
    const top = ranked.top
      ? snapshotToSignals({ generatedAt: snapshot.generatedAt, signals: [ranked.top] })[0]
      : null;
    const distribution = {
      buy: snapshot.signals.filter((s) => s.signal === "BUY").length,
      sell: snapshot.signals.filter((s) => s.signal === "SELL").length,
      wait: snapshot.signals.filter((s) => s.signal === "WAIT").length,
    };
    const conflict = buildConflict(snapshot);
    const categoryBreakdown = buildCategoryBreakdown(snapshot);
    res.json(
      GetDashboardSummaryResponse.parse({
        pair: parsed.data.pair,
        timeframe: parsed.data.timeframe,
        ticker,
        top,
        distribution,
        categoryBreakdown,
        conflict,
        lastUpdated: new Date(snapshot.generatedAt).toISOString(),
        strategiesActive: snapshot.signals.length,
      }),
    );
  } catch (err) {
    req.log.error({ err }, "dashboard summary failed");
    res.status(502).json({ error: "Failed to compute dashboard" });
  }
});

export default router;
