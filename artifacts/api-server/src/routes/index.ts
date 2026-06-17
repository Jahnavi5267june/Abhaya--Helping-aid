import { Router, type IRouter } from "express";
import healthRouter from "./health";
import organizationsRouter from "./organizations";
import donationsRouter from "./donations";
import helpRequestsRouter from "./help_requests";
import documentsRouter from "./documents";
import disasterReliefRouter from "./disaster_relief";
import communityAlertsRouter from "./community_alerts";
import statsRouter from "./stats";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/organizations", organizationsRouter);
router.use("/donations", donationsRouter);
router.use("/help-requests", helpRequestsRouter);
router.use("/documents", documentsRouter);
router.use("/disaster-relief", disasterReliefRouter);
router.use("/community-alerts", communityAlertsRouter);
router.use("/stats", statsRouter);
router.use("/admin", adminRouter);

export default router;
