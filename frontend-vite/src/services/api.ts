import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000'
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    // Only set Content-Type if not already set (for FormData)
    if (!config.headers['Content-Type']) {
        config.headers['Content-Type'] = 'application/json';
    }
    return config;
});

// Handle 401 errors - skip redirect for auth endpoints
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Don't redirect on auth endpoints - let the component handle the error
            const url = error.config?.url || '';
            const isAuthEndpoint = url.includes('/auth/login') ||
                url.includes('/auth/register') ||
                url.includes('/auth/verify-otp');

            if (!isAuthEndpoint) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
