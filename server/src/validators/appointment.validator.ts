import { z } from 'zod';

export const bookAppointmentSchema = z.object({
    appointmentId: z.string().min(1, 'Appointment ID is required'),
});

export const cancelAppointmentSchema = z.object({
    appointmentId: z.string().min(1, 'Appointment ID is required'),
});

export type BookAppointmentInput = z.infer<typeof bookAppointmentSchema>;
export type CancelAppointmentInput = z.infer<typeof cancelAppointmentSchema>;
