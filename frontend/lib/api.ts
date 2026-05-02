import axios from "axios";
import {AuthResult} from "@/types";

const api = axios.create({
    baseURL: "http://localhost:5220/api",
    headers: {
        "Content-Type": "application/json",
    }
})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const token = localStorage.getItem('refreshToken');
            if (!token) {
                window.location.href = '/auth/login';
                return Promise.reject(error);
            }

            try {
                const refreshResponse = await axios.post<AuthResult>(
                    'http://localhost:5220/api/auth/refresh-token',
                    { refreshToken: token }
                );

                const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data;
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', newRefreshToken);

                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return api(originalRequest);
            } catch {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/auth/login';
            }
        }

        return Promise.reject(error);
    }
);

export default api;