import { Router } from "express";
import { loginController, ingestLogController, searchLogsController, getDashboardStatsController, getAlertsController } from "../controllers/log.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = Router();

// กำหนด URL ของระบบ API v1
router.post('/login', loginController);
router.post('/ingest', authenticateToken, ingestLogController as any);
router.get('/search', authenticateToken, searchLogsController as any);

// Dashboard
router.get('/dashboard/stats', authenticateToken, getDashboardStatsController as any);

// Alerts
router.get('/alerts', authenticateToken, getAlertsController as any);

export default router;