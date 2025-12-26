import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "sonner";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    },
    withCredentials: true, // Required if using Laravel Sanctum
});

// Request Interceptor: Automatically attach the token
api.interceptors.request.use((config) => {
    const token = Cookies.get("auth_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response Interceptor: Global Error Handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Session expired: Clear local data and redirect
            Cookies.remove("auth_token");
            window.location.href = "/login";
        } else {
            const message = error.response?.data?.message || error.message || "An unexpected error occurred";
            toast.error(message);
        }
        return Promise.reject(error);
    }
);

export default api;