import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Secret Key token
const SECRET_KEY = process.env.JWT_SECRET || "super-secret-key-for-intern-test"

// ขยายรูปแบบ Req ของ Express ให้รองรับ User ที่มากับ Token
export interface AuthRequest extends Request {
    user?: {
        sub: string;
        role: string;
        tenant: string;
    };
}

// Middleware check JWT Token from Header
export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // ดึงเฉพาะตัวรหัส Token หลัง Bearer

    if (!token) {
        return res.status(401).json({ detail: "No token provided, access denied"});
    }

    // ตรวจสอบความถูกต้อง Token
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ detail: "Invalid or expired token"})
        }
        //ถ้าผ่าน ให้ใส่ใน Request เพื่อให้ -> Controller
        req.user = user as AuthRequest['user'];
        next();
    })
}