import mongoose, { Schema, Document } from 'mongoose';
import { IAppointment } from '../types';

export interface IAppointmentDocument extends Omit<IAppointment, '_id'>, Document { }

const appointmentSchema = new Schema<IAppointmentDocument>(
    {
        date: {
            type: String,
            required: [true, 'Date is required'],
        },
        startTime: {
            type: String,
            required: [true, 'Start time is required'],
        },
        endTime: {
            type: String,
            required: [true, 'End time is required'],
        },
        userId: {
            type: String,
            default: null,
        },
        status: {
            type: String,
            enum: ['available', 'booked'],
            default: 'available',
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for uniqueness of date + startTime
appointmentSchema.index({ date: 1, startTime: 1 }, { unique: true });

// Index for efficient queries
appointmentSchema.index({ userId: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ date: 1, status: 1 });

export const Appointment = mongoose.model<IAppointmentDocument>('Appointment', appointmentSchema);
