import axios from "axios";
import * as SecureStore from "expo-secure-store";

// API configuration
const API_BASE_URL = "https://deploy-smk.onrender.com";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error getting token:", error);
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
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, redirect to login
      await SecureStore.deleteItemAsync("token");
      await SecureStore.deleteItemAsync("user");
      await SecureStore.deleteItemAsync("userId");
      await SecureStore.deleteItemAsync("role");
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

export default api;
