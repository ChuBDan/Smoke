import axios from "axios";

// API configuration using .env variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const ENABLE_API_LOGGING = import.meta.env.VITE_ENABLE_API_LOGGING === "true";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log requests in development
    if (ENABLE_API_LOGGING) {
      console.log("API Request:", config.method?.toUpperCase(), config.url);
    }

    return config;
  },
  (error) => {
    console.error("Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    if (ENABLE_API_LOGGING) {
      console.log("API Response:", response.status, response.config.url);
    }
    return response;
  },
  (error) => {
    const { response, message, config } = error;

    // 👉 BỎ QUA log nếu là 403 get‑daily‑progress (hoặc mọi 403 nếu bạn muốn)
    if (response?.status === 403 && config?.url?.includes("/get-daily-progress/")) {
      return Promise.reject(error);      // Không log gì thêm
    }

    /* ───── Phần còn lại giữ nguyên ───── */
    if (!response) {
      console.error("Network Error:", message);
    } else if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      window.location.href = "/login";
    } else if (response.status >= 500) {
      console.error("Server Error:", response.data || message);
    } else if (response.status >= 400) {
      console.error("Client Error:", response.data || message);
    }
    return Promise.reject(error);
  }
);


// HTTP Methods object for easy API calls
export const httpMethods = {
  get: (endpoint, config = {}) => api.get(endpoint, config),
  post: (endpoint, data = {}, config = {}) => api.post(endpoint, data, config),
  put: (endpoint, data = {}, config = {}) => api.put(endpoint, data, config),
  patch: (endpoint, data = {}, config = {}) =>
    api.patch(endpoint, data, config),
  delete: (endpoint, config = {}) => api.delete(endpoint, config),
};

// API Endpoints configuration (add your endpoints here when backend is ready)
export const apiEndpoints = {
  // Example: auth: { login: '/auth/login', register: '/auth/register' },
  // Add your actual endpoints here when you have a backend
};

export default api;
