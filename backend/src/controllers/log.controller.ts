import { Request, Response } from 'express';
import { indexLogService, searchLogsService, getDashboardStatsService, investigateEntityService } from '../services/log.service.js';
import { getAlertsService } from '../services/alert.service.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || "super-secret-key-for-intern-test";

// จำลองฐานข้อมูลผู้ใช้งานในระบบ (RBAC)
const USERS_DB: Record<string, { password: string; role: string; tenant: string }> = {
    "admin": { password: "adminpassword", role: "admin", tenant: "all" },
    "viewer_demoa": { password: "viewer123", role: "viewer", tenant: "demoA" },
    "viewer_demob": { password: "viewer123", role: "viewer", tenant: "demoB" }
};

// 1. Controller สำหรับเข้าสู่ระบบเพื่อรับ JWT Token
export const loginController = (req: Request, res: Response) => {
    const { username, password } = req.body;
    const user = USERS_DB[username];

    if (!user || user.password !== password) {
        return res.status(401).json({ detail: "Incorrect username or password" });
    }

    // สร้าง Token มีอายุการใช้งาน 1 ชั่วโมง
    const token = jwt.sign(
        { sub: username, role: user.role, tenant: user.tenant },
        SECRET_KEY,
        { expiresIn: '1h' }
    );
    res.json({ access_token: token, token_type: "bearer" });
};

// 2. Controller สำหรับรับ Log ข้อมูลเข้ามาเก็บ
export const ingestLogController = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ detail: "Unauthorized" });
        const result = await indexLogService(req.body, req.user);
        res.json({ status: "success", ...result });
    } catch (error: any) {
        console.error("Ingest Error:", error);
        res.status(500).json({ detail: error.message });
    }
};

// 3. Controller สำหรับดึงข้อมูล Log ออกมาดู
export const searchLogsController = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ detail: "Unauthorized" });
        const timeRange = req.query.timeRange as string || '15m';
        const startTime = req.query.startTime as string | undefined;
        const endTime = req.query.endTime as string | undefined;
        const logs = await searchLogsService(req.user, req.query.q as string, timeRange, startTime, endTime);
        res.json({ status: "success", tenant_access: req.user.tenant, data: logs });
    } catch (error: any) {
        console.error("Search Error:", error);
        res.status(500).json({ detail: error.message });
    }
};

// 4. Controller สำหรับดึงข้อมูล Dashboard
export const getDashboardStatsController = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ detail: "Unauthorized" });
        const stats = await getDashboardStatsService(req.user, req.query);
        res.json({ status: "success", tenant_access: req.user.tenant, data: stats });
    } catch (error: any) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({ detail: error.message });
    }
};

// 5. Controller สำหรับดึงข้อมูล Alerts
export const getAlertsController = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ detail: "Unauthorized" });
        const alerts = await getAlertsService(req.user);
        res.json({ status: "success", data: alerts });
    } catch (error: any) {
        console.error("Get Alerts Error:", error);
        res.status(500).json({ detail: error.message });
    }
};

// 6. Controller สำหรับ Investigate
export const investigateController = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ detail: "Unauthorized" });
        const entity = req.query.entity as string || "";
        const profile = await investigateEntityService(req.user, entity);
        res.json({ status: "success", data: profile });
    } catch (error: any) {
        console.error("Investigate Error:", error);
        res.status(500).json({ detail: error.message });
    }
};
