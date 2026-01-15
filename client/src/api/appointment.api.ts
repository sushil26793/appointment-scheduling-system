import axiosInstance from './axios';

export interface Appointment {
    _id: string;
    date: string;
    startTime: string;
    endTime: string;
    userId?: string;
    status: 'available' | 'booked';
    createdAt: string;
    updatedAt: string;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export const appointmentApi = {
    getAvailableSlots: async () => {
        const response = await axiosInstance.get<ApiResponse<Appointment[]>>('/appointments/available');
        return response.data;
    },

    bookAppointment: async (appointmentId: string) => {
        const response = await axiosInstance.post<ApiResponse<Appointment>>('/appointments/book', {
            appointmentId,
        });
        return response.data;
    },

    getUserAppointments: async () => {
        const response = await axiosInstance.get<ApiResponse<Appointment[]>>('/appointments/my-appointments');
        return response.data;
    },

    cancelAppointment: async (appointmentId: string) => {
        const response = await axiosInstance.delete<ApiResponse<Appointment>>(
            `/appointments/${appointmentId}/cancel`
        );
        return response.data;
    },
};
