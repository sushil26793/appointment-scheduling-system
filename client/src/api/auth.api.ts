import axiosInstance from './axios';

export interface RegisterData {
    email: string;
    password: string;
    name: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        token: string;
        user: {
            id: string;
            email: string;
            name: string;
        };
    };
}

export const authApi = {
    register: async (data: RegisterData) => {
        const response = await axiosInstance.post<AuthResponse>('/auth/register', data);
        return response.data;
    },

    login: async (data: LoginData) => {
        const response = await axiosInstance.post<AuthResponse>('/auth/login', data);
        return response.data;
    },
};
