import axios from 'axios';

// Create a custom axios instance
const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Helper function to support both new 'accessToken' and old 'token' keys
const getAuthToken = () => {
    return localStorage.getItem('accessToken') || localStorage.getItem('token');
};

// 1. Request Interceptor for custom 'api' instance
api.interceptors.request.use(
    (config) => {
        const token = getAuthToken();
        if (token) {
            config.headers['Authorization'] = 'Bearer ' + token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 2. Request Interceptor for global 'axios' (to support standard axios calls across your app)
axios.interceptors.request.use(
    (config) => {
        const token = getAuthToken();
        if (token) {
            config.headers['Authorization'] = 'Bearer ' + token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 3. Response Interceptor on 'api' for automatic Token Expiration & Refresh
api.interceptors.response.use(
    (res) => {
        return res;
    },
    async (err) => {
        const originalConfig = err.config;

        // Check if error is 401 Unauthorized and we haven't already retried this request
        if (err.response && err.response.status === 401 && !originalConfig._retry) {
            originalConfig._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    // No refresh token available, force logout
                    localStorage.clear();
                    window.location.href = '/login';
                    return Promise.reject(err);
                }

                // Call refresh token endpoint
                const rs = await axios.post('http://localhost:8080/api/auth/refreshtoken', {
                    refreshToken: refreshToken,
                });

                const { accessToken } = rs.data;
                
                // Save the new access token to both keys for compatibility
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('token', accessToken);

                // Retry the original failed request with the new token
                originalConfig.headers['Authorization'] = 'Bearer ' + accessToken;
                return api(originalConfig);
            } catch (_error) {
                // If refresh token is also expired or invalid, force logout user
                localStorage.clear();
                window.location.href = '/login';
                return Promise.reject(_error);
            }
        }

        return Promise.reject(err);
    }
);

export default api;