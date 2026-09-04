import { Request, Response, NextFunction } from 'express';

const limits: Record<string, { count: number; reset: number }> = {};

export const rateLimiter = (key: string, max: number, window: number) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const limitKey = `${key}:${ip}`;
    const now = Date.now();

    if (!limits[limitKey] || limits[limitKey].reset < now) {
      limits[limitKey] = { count: 0, reset: now + window * 1000 };
    }

    limits[limitKey].count++;

    if (limits[limitKey].count > max) {
      res.status(429).json({
        success: false,
        error: { code: 'RATE_LIMIT', message: 'Too many requests' }
      });
      return;
    }

    next();
  };
};