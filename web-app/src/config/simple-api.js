import axios from "axios";

// Simple API configuration
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
const IS_DEVELOPMENT = import.meta.env.VITE_ENVIRONMENT === "development";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log requests in development
    if (IS_DEVELOPMENT) {
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
    if (IS_DEVELOPMENT) {
      console.log("API Response:", response.status, response.config.url);
    }
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem("authToken");
      window.location.href = "/login";
    }

    console.error("Response Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
