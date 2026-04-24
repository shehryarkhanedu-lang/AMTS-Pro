import { Router, type IRouter } from "express";
import {
  GetCandlesQueryParams,
  GetCandlesResponse,
  GetTickerQueryParams,
  GetTickerResponse,
} from "@workspace/api-zod";
import { fetchCandles, fetchTicker } from "../lib/binance";

const router: IRouter = Router();

router.get("/market/ticker", async (req, res): Promise<void> => {
  const parsed = GetTickerQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
    const ticker = await fetchTicker(parsed.data.pair);
    res.json(GetTickerResponse.parse(ticker));
  } catch (err) {
    req.log.error({ err }, "Failed to fetch ticker");
    res.status(502).json({ error: "Upstream market data unavailable" });
  }
});

router.get("/market/candles", async (req, res): Promise<void> => {
  const parsed = GetCandlesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
    const candles = await fetchCandles(
      parsed.data.pair,
      parsed.data.timeframe,
      parsed.data.limit ?? 200,
    );
    res.json(GetCandlesResponse.parse(candles));
  } catch (err) {
    req.log.error({ err }, "Failed to fetch candles");
    res.status(502).json({ error: "Upstream market data unavailable" });
  }
});

export default router;
