import { Router, type IRouter } from "express";
import healthRouter from "./health";
import organizationsRouter from "./organizations";
import donationsRouter from "./donations";
import helpRequestsRouter from "./help_requests";
import documentsRouter from "./documents";
import disasterReliefRouter from "./disaster_relief";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/organizations", organizationsRouter);
router.use("/donations", donationsRouter);
router.use("/help-requests", helpRequestsRouter);
router.use("/documents", documentsRouter);
router.use("/disaster-relief", disasterReliefRouter);
router.use("/stats", statsRouter);

export default router;
