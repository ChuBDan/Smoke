import {
  authApi,
  usersApi,
  adminApi,
  coachesApi,
  appointmentsApi,
  doctorsApi,
} from "@/services/api";
import { uploadApi } from "@/config/api";

/**
 * API Manager - High-level API interface
 * Provides convenient methods for common operations
 */
class ApiManager {
  constructor() {
    this.auth = authApi;
    this.users = usersApi;
    this.admin = adminApi;
    this.coaches = coachesApi;
    this.appointments = appointmentsApi;
    this.doctors = doctorsApi;
  }

  /**
   * Authentication Methods
   */
  async login(email, password) {
    try {
      const response = await this.auth.login({ email, password });

      // Store tokens if login successful
      if (response.accessToken) {
        localStorage.setItem("accessToken", response.accessToken);
        localStorage.setItem("refreshToken", response.refreshToken);
        localStorage.setItem("user", JSON.stringify(response.user));
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  async logout() {
    try {
      await this.auth.logout();
    } catch (error) {
      console.warn("Logout API call failed:", error);
    } finally {
      // Clear local storage regardless of API response
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    }
  }

  async register(userData) {
    return this.auth.register(userData);
  }

  /**
   * User Management Methods
   */
  async getCurrentUser() {
    try {
      const cachedUser = localStorage.getItem("user");
      if (cachedUser) {
        return JSON.parse(cachedUser);
      }

      const response = await this.users.getProfile();
      localStorage.setItem("user", JSON.stringify(response.user));
      return response.user;
    } catch (error) {
      throw error;
    }
  }

  async updateCurrentUser(userData) {
    try {
      const response = await this.users.updateProfile(userData);

      // Update cached user data
      if (response.user) {
        localStorage.setItem("user", JSON.stringify(response.user));
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Admin Methods
   */
  async getAdminDashboard() {
    return this.admin.getDashboardStats();
  }

  async getUsersList(role = "all", params = {}) {
    switch (role) {
      case "members":
        return this.users.getMembers(params);
      case "coaches":
        return this.users.getCoaches(params);
      case "admins":
        return this.users.getAdmins(params);
      default:
        // Get all users
        const [members, coaches, admins] = await Promise.all([
          this.users.getMembers(params),
          this.users.getCoaches(params),
          this.users.getAdmins(params),
        ]);
        return {
          members: members.data || members,
          coaches: coaches.data || coaches,
          admins: admins.data || admins,
        };
    }
  }

  /**
   * Coach Methods
   */
  async getCoachDashboard() {
    return this.coaches.getDashboardStats();
  }

  async getCoachClients(coachId, params = {}) {
    return this.coaches.getClients({ coachId, ...params });
  }

  /**
   * Appointments Methods
   */
  async getMyAppointments(params = {}) {
    return this.appointments.getAppointments(params);
  }

  async bookNewAppointment(doctorId, dateTime, notes = "") {
    return this.appointments.bookAppointment({
      doctorId,
      dateTime,
      notes,
    });
  }

  /**
   * Doctors Methods
   */
  async getAllDoctors(params = {}) {
    return this.doctors.getDoctors(params);
  }

  async getDoctorsBySpecialty(specialty) {
    return this.doctors.getDoctorsBySpecialty(specialty);
  }

  /**
   * File Upload Methods
   */
  async uploadAvatar(file) {
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await uploadApi.post("/upload/avatar", formData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async uploadDocument(file, type = "general") {
    try {
      const formData = new FormData();
      formData.append("document", file);
      formData.append("type", type);

      const response = await uploadApi.post("/upload/documents", formData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Utility Methods
   */
  isAuthenticated() {
    return !!localStorage.getItem("accessToken");
  }

  getCurrentUserRole() {
    try {
      const user = localStorage.getItem("user");
      if (user) {
        return JSON.parse(user).role;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Error Handling Utility
   */
  handleApiError(error, defaultMessage = "An error occurred") {
    if (error.message) {
      return error.message;
    }

    if (error.status === 401) {
      return "Unauthorized. Please login again.";
    }

    if (error.status === 403) {
      return "Access denied. You do not have permission for this action.";
    }

    if (error.status === 404) {
      return "Resource not found.";
    }

    if (error.status >= 500) {
      return "Server error. Please try again later.";
    }

    return defaultMessage;
  }

  /**
   * Cache Management
   */
  clearCache() {
    // Clear specific cached data (not auth tokens)
    const keysToKeep = ["accessToken", "refreshToken"];
    const allKeys = Object.keys(localStorage);

    allKeys.forEach((key) => {
      if (!keysToKeep.includes(key)) {
        localStorage.removeItem(key);
      }
    });
  }

  /**
   * Batch Operations
   */
  async batchOperation(operations) {
    try {
      const results = await Promise.allSettled(operations);

      const successful = results
        .filter((result) => result.status === "fulfilled")
        .map((result) => result.value);

      const failed = results
        .filter((result) => result.status === "rejected")
        .map((result) => result.reason);

      return {
        successful,
        failed,
        totalCount: operations.length,
        successCount: successful.length,
        failureCount: failed.length,
      };
    } catch (error) {
      throw error;
    }
  }
}

// Create and export singleton instance
const apiManager = new ApiManager();

export default apiManager;

// Also export individual services for direct access if needed
export { authApi, usersApi, adminApi, coachesApi, appointmentsApi, doctorsApi };
