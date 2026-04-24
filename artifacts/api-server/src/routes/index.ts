import { Router, type IRouter } from "express";
import healthRouter from "./health";
import metaRouter from "./meta";
import strategiesRouter from "./strategies";
import marketRouter from "./market";
import signalsRouter from "./signals";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(metaRouter);
router.use(strategiesRouter);
router.use(marketRouter);
router.use(signalsRouter);
router.use(dashboardRouter);

export default router;
