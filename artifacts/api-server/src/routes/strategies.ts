import { Router, type IRouter } from "express";
import {
  GetStrategyPerformanceQueryParams,
  GetStrategyPerformanceResponse,
  ListStrategiesResponse,
} from "@workspace/api-zod";
import { ALL_STRATEGIES } from "../lib/strategies";
import { getStrategyPerformance } from "../lib/signal-engine";

const router: IRouter = Router();

router.get("/strategies", async (_req, res): Promise<void> => {
  const items = ALL_STRATEGIES.map((s) => ({
    key: s.key,
    name: s.name,
    category: s.category,
    mode: s.mode,
    riskLevel: s.riskLevel,
    description: s.description,
    logic: s.logic,
  }));
  res.json(ListStrategiesResponse.parse(items));
});

router.get("/strategies/performance", async (req, res): Promise<void> => {
  const parsed = GetStrategyPerformanceQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const data = await getStrategyPerformance(parsed.data.pair, parsed.data.timeframe);
  res.json(GetStrategyPerformanceResponse.parse(data));
});

export default router;
