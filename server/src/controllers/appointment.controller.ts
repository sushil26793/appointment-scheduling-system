import { Response, NextFunction } from 'express';
import { appointmentService } from '../services/appointment.service';
import { successResponse, errorResponse } from '../utils/response.util';
import { AuthRequest } from '../types';

export class AppointmentController {
    async getAvailableSlots(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const slots = await appointmentService.getAvailableSlots();
            return successResponse(res, 'Available slots retrieved successfully', slots);
        } catch (error: any) {
            console.error('Error in getAvailableSlots controller:', error);
            return errorResponse(res, error.message || 'Failed to retrieve available slots', 500);
        }
    }

    async bookAppointment(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { appointmentId } = req.body;
            const userId = req.user!.userId;

            const appointment = await appointmentService.bookAppointment(appointmentId, userId);
            return successResponse(res, 'Appointment booked successfully', appointment, 201);
        } catch (error: any) {
            if (
                error.message.includes('already booked') ||
                error.message.includes('already have an appointment') ||
                error.message.includes('not found') ||
                error.message.includes('in the past')
            ) {
                return errorResponse(res, error.message, 400);
            }
            next(error);
        }
    }

    async getUserAppointments(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const appointments = await appointmentService.getUserAppointments(userId);
            return successResponse(res, 'User appointments retrieved successfully', appointments);
        } catch (error: any) {
            next(error);
        }
    }

    async cancelAppointment(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const userId = req.user!.userId;

            const appointment = await appointmentService.cancelAppointment(id, userId);
            return successResponse(res, 'Appointment cancelled successfully', appointment);
        } catch (error: any) {
            if (
                error.message.includes('not found') ||
                error.message.includes('only cancel your own') ||
                error.message.includes('not booked') ||
                error.message.includes('less than 24 hours')
            ) {
                return errorResponse(res, error.message, 400);
            }
            next(error);
        }
    }
}

export const appointmentController = new AppointmentController();
