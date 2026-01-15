import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/response.util';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err);

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return errorResponse(res, `${field} already exists`, 400, 'Duplicate entry');
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors)
            .map((e: any) => e.message)
            .join(', ');
        return errorResponse(res, 'Validation failed', 400, errors);
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return errorResponse(res, 'Invalid token', 401);
    }

    if (err.name === 'TokenExpiredError') {
        return errorResponse(res, 'Token expired', 401);
    }

    // Default error
    return errorResponse(
        res,
        err.message || 'Internal server error',
        err.statusCode || 500
    );
};
