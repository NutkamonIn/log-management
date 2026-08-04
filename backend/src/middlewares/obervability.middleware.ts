import { Request, Response, NextFunction } from "express";

export const observabilityMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now(); // start time (Big O)

    // hook Server Send Back
    res.on('finish', () => {
        const duration = Date.now() - start; // Calcuration time to use(ms)
        const status = res.statusCode;

        // API Perform > 500ms (O(n) หรือแย่กว่า) ให้ Alert
        if (duration > 500) {
            console.warn(`[TRACE-SLOW] ${req.method} ${req.originalUrl} - ${status} ${duration}ms`);
        } else {
            console.info(`[TRACE] ${req.method} ${req.originalUrl} - ${status} ${duration}ms`)
        }
    });

    next();

};