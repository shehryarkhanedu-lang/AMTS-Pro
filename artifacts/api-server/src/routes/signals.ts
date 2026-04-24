import { Router, type IRouter } from "express";
import {
  GetAllSignalsQueryParams,
  GetAllSignalsResponse,
  GetConflictsQueryParams,
  GetConflictsResponse,
  GetSignalHistoryQueryParams,
  GetSignalHistoryResponse,
  GetTopSignalQueryParams,
  GetTopSignalResponse,
} from "@workspace/api-zod";
import {
  buildConflict,
  getHistory,
  getSnapshot,
  rankSignals,
  snapshotToSignals,
} from "../lib/signal-engine";

const router: IRouter = Router();

router.get("/signals/top", async (req, res): Promise<void> => {
  const parsed = GetTopSignalQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
    const snapshot = await getSnapshot(parsed.data.pair, parsed.data.timeframe);
    const ranked = rankSignals(snapshot);
    const wrapWithId = (s: ReturnType<typeof rankSignals>["top"]) =>
      s
        ? snapshotToSignals({ generatedAt: snapshot.generatedAt, signals: [s] })[0]!
        : null;
    const top = wrapWithId(ranked.top);
    const supporting = snapshotToSignals({
      generatedAt: snapshot.generatedAt,
      signals: ranked.supporting,
    });
    const conflicting = snapshotToSignals({
      generatedAt: snapshot.generatedAt,
      signals: ranked.conflicting,
    });
    res.json(
      GetTopSignalResponse.parse({
        top,
        supporting,
        conflicting,
        totalStrategies: ranked.totalStrategies,
      }),
    );
  } catch (err) {
    req.log.error({ err }, "top signal failed");
    res.status(502).json({ error: "Failed to compute top signal" });
  }
});

router.get("/signals/all", async (req, res): Promise<void> => {
  const parsed = GetAllSignalsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
    const snapshot = await getSnapshot(parsed.data.pair, parsed.data.timeframe);
    const all = snapshotToSignals(snapshot).sort((a, b) => b.confidence - a.confidence);
    res.json(GetAllSignalsResponse.parse(all));
  } catch (err) {
    req.log.error({ err }, "all signals failed");
    res.status(502).json({ error: "Failed to compute signals" });
  }
});

router.get("/signals/conflicts", async (req, res): Promise<void> => {
  const parsed = GetConflictsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
    const snapshot = await getSnapshot(parsed.data.pair, parsed.data.timeframe);
    res.json(GetConflictsResponse.parse(buildConflict(snapshot)));
  } catch (err) {
    req.log.error({ err }, "conflicts failed");
    res.status(502).json({ error: "Failed to compute conflicts" });
  }
});

router.get("/signals/history", async (req, res): Promise<void> => {
  const parsed = GetSignalHistoryQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
    const data = await getHistory(
      parsed.data.pair,
      parsed.data.timeframe,
      parsed.data.limit ?? 100,
      parsed.data.strategyKey,
    );
    res.json(GetSignalHistoryResponse.parse(data));
  } catch (err) {
    req.log.error({ err }, "history failed");
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

export default router;
