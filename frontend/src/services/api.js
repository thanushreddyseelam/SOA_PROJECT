import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('urbanglide_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Format error messages & handle 401/403
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      // Auto-logout on 401 Unauthorized (unless logging in / registering)
      if (status === 401 && !error.config.url?.includes('/auth/login') && !error.config.url?.includes('/auth/register')) {
        localStorage.removeItem('urbanglide_token');
        localStorage.removeItem('urbanglide_user');
        window.dispatchEvent(new CustomEvent('urbanglide:session_expired'));
      }

      const message = data?.message || data?.error || (typeof data === 'string' ? data : 'An unexpected error occurred.');
      return Promise.reject(new Error(message));
    } else if (error.request) {
      return Promise.reject(
        new Error('API Gateway is unreachable at http://localhost:8080. Please ensure the backend services are running.')
      );
    }
    return Promise.reject(error);
  }
);

export default api;
export { API_BASE_URL };
