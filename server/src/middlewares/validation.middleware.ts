import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { errorResponse } from '../utils/response.util';

export const validate = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse(req.body);
            next();
        } catch (error: any) {
            const errors = error.errors?.map((err: any) => err.message).join(', ');
            return errorResponse(res, 'Validation failed', 400, errors);
        }
    };
};
