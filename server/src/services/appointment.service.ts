import mongoose from 'mongoose';
import { Appointment, IAppointmentDocument } from '../models/Appointment';

export class AppointmentService {
    async generateSlots(): Promise<void> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const thirtyDaysLater = new Date(today);
        thirtyDaysLater.setDate(today.getDate() + 30);

        const startDate = today.toISOString().split('T')[0];
        const endDate = thirtyDaysLater.toISOString().split('T')[0];

        // Fetch all existing slots for the next 30 days in one query
        const existingSlots = await Appointment.find({
            date: { $gte: startDate, $lte: endDate }
        }).select('date startTime');

        // Create a Set of existing slot unique keys (date + startTime) for O(1) lookup
        const slotMap = new Set(existingSlots.map(s => `${s.date}_${s.startTime}`));

        const slotsToInsert = [];

        // Loop through next 30 days
        for (let day = 0; day < 30; day++) {
            const currentDate = new Date(today);
            currentDate.setDate(today.getDate() + day);
            const dateString = currentDate.toISOString().split('T')[0];

            // 9 AM to 5 PM
            for (let hour = 9; hour < 17; hour++) {
                const startTime = `${hour.toString().padStart(2, '0')}:00`;
                const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;

                if (!slotMap.has(`${dateString}_${startTime}`)) {
                    slotsToInsert.push({
                        date: dateString,
                        startTime,
                        endTime,
                        status: 'available',
                    });
                }
            }
        }

        if (slotsToInsert.length > 0) {
            await Appointment.insertMany(slotsToInsert);
        }
    }

    async getAvailableSlots(): Promise<IAppointmentDocument[]> {
        await this.generateSlots();

        const now = new Date();
        const currentDate = now.toISOString().split('T')[0];
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        const slots = await Appointment.find({
            status: 'available',
            $or: [
                { date: { $gt: currentDate } },
                { date: currentDate, startTime: { $gt: currentTime } },
            ],
        }).sort({ date: 1, startTime: 1 });

        return slots;
    }

    async bookAppointment(appointmentId: string, userId: string): Promise<IAppointmentDocument> {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const appointment = await Appointment.findById(appointmentId).session(session);

            if (!appointment) {
                throw new Error('Appointment not found');
            }

            if (appointment.status === 'booked') {
                throw new Error('This slot is already booked');
            }
            const now = new Date();
            const appointmentDate = new Date(appointment.date);
            const [hours, minutes] = appointment.startTime.split(':');
            appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

            if (appointmentDate < now) {
                throw new Error('Cannot book appointments in the past');
            }

            // Check if user already has an appointment on this date
            const existingAppointment = await Appointment.findOne({
                date: appointment.date,
                userId,
                status: 'booked',
            }).session(session);

            if (existingAppointment) {
                throw new Error('You already have an appointment on this date');
            }

            // Book the appointment (atomic update)
            const updated = await Appointment.findOneAndUpdate(
                { _id: appointmentId, status: 'available' },
                { $set: { userId, status: 'booked' } },
                { new: true, session }
            );

            if (!updated) {
                throw new Error('Failed to book appointment - slot may have been taken');
            }

            await session.commitTransaction();
            return updated;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    async getUserAppointments(userId: string): Promise<IAppointmentDocument[]> {
        const appointments = await Appointment.find({
            userId,
            status: 'booked',
        }).sort({ date: 1, startTime: 1 });

        return appointments;
    }

    async cancelAppointment(appointmentId: string, userId: string): Promise<IAppointmentDocument> {
        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            throw new Error('Appointment not found');
        }

        if (appointment.userId !== userId) {
            throw new Error('You can only cancel your own appointments');
        }
        if (appointment.status === 'available') {
            throw new Error('This appointment is not booked');
        }

        const now = new Date();
        const appointmentDate = new Date(appointment.date);
        const [hours, minutes] = appointment.startTime.split(':');
        appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        const hoursDifference = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);

        if (hoursDifference < 24) {
            throw new Error('Cannot cancel appointments less than 24 hours before the start time');
        }

        appointment.userId = undefined;
        appointment.status = 'available';
        await appointment.save();

        return appointment;
    }
}

export const appointmentService = new AppointmentService();
