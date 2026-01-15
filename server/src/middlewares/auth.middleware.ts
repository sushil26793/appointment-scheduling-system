import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../types';
import { errorResponse } from '../utils/response.util';

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return errorResponse(res, 'No token provided', 401);
        }

        const token = authHeader.substring(7);
        const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

        const decoded = jwt.verify(token, jwtSecret) as { userId: string; email: string };

        req.user = {
            userId: decoded.userId,
            email: decoded.email,
        };

        next();
    } catch (error: any) {
        if (error.name === 'JsonWebTokenError') {
            return errorResponse(res, 'Invalid token', 401);
        }
        if (error.name === 'TokenExpiredError') {
            return errorResponse(res, 'Token expired', 401);
        }
        return errorResponse(res, 'Authentication failed', 401);
    }
};
