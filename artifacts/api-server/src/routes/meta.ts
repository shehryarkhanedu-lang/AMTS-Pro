import { Router, type IRouter } from "express";
import { ListPairsResponse, ListTimeframesResponse } from "@workspace/api-zod";
import { SUPPORTED_PAIRS, SUPPORTED_TIMEFRAMES } from "../lib/meta";

const router: IRouter = Router();

router.get("/pairs", async (_req, res): Promise<void> => {
  res.json(ListPairsResponse.parse(SUPPORTED_PAIRS.map((p) => ({ ...p }))));
});

router.get("/timeframes", async (_req, res): Promise<void> => {
  res.json(
    ListTimeframesResponse.parse(SUPPORTED_TIMEFRAMES.map((t) => ({ ...t }))),
  );
});

export default router;
