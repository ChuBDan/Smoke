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
    // Log responses in development
    if (ENABLE_API_LOGGING) {
      console.log("API Response:", response.status, response.config.url);
    }

    // Validate JSON response
    try {
      if (response.data && typeof response.data === "string") {
        response.data = JSON.parse(response.data);
      }
    } catch (jsonError) {
      console.error("JSON Parse Error:", jsonError);
      throw new Error("Invalid JSON response from server");
    }

    return response;
  },
  (error) => {
    // Handle network errors
    if (!error.response) {
      console.error("Network Error:", error.message);
      error.message =
        "Network connection failed. Please check your internet connection.";
    }
    // Handle common errors
    else if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      window.location.href = "/login";
    }
    // Handle server errors
    else if (error.response?.status >= 500) {
      console.error("Server Error:", error.response?.data || error.message);
      error.message = "Server error occurred. Please try again later.";
    }
    // Handle client errors
    else if (error.response?.status >= 400) {
      console.error("Client Error:", error.response?.data || error.message);
    }

    console.error("Response Error:", error.response?.data || error.message);
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
