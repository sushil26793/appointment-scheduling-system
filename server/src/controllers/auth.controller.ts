import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { successResponse, errorResponse } from '../utils/response.util';

export class AuthController {
    async register(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await authService.register(req.body);
            return successResponse(res, 'User registered successfully', result, 201);
        } catch (error: any) {
            if (error.message === 'Email already registered') {
                return errorResponse(res, error.message, 400);
            }
            next(error);
        }
    }

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await authService.login(req.body);
            return successResponse(res, 'Login successful', result);
        } catch (error: any) {
            if (error.message === 'Invalid credentials') {
                return errorResponse(res, error.message, 401);
            }
            next(error);
        }
    }
}

export const authController = new AuthController();
