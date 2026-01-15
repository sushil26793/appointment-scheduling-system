import { Request } from 'express';

export interface IUser {
    _id: string;
    email: string;
    password: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IAppointment {
    _id: string;
    date: string;
    startTime: string;
    endTime: string;
    userId?: string;
    status: 'available' | 'booked';
    createdAt: Date;
    updatedAt: Date;
}

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        email: string;
    };
}

export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}
