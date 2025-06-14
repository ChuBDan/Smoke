import api from "@/config/api";

/**
 * Membership Packages API Service
 * Handles all CRUD operations for membership packages
 */
export const packagesApi = {  /**
   * Get all membership packages
   * @returns {Promise} API response
   */
  async getAllPackages() {
    try {
      const response = await api.get("/api/user/get-all-membership-packages");
      return {
        success: true,
        data: response.data,
        message: "Packages fetched successfully",
      };
    } catch (error) {
      console.error("Error fetching packages:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch packages",
        error: error.response?.data || error.message,
      };
    }
  },

  /**
   * Create a new membership package
   * @param {Object} packageData - Package data to create
   * @returns {Promise} API response
   */
  async createPackage(packageData) {
    try {
      const response = await api.post(
        "/api/admin/create-membership-package",
        packageData
      );
      return {
        success: true,
        data: response.data,
        message: "Package created successfully",
      };
    } catch (error) {
      console.error("Error creating package:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to create package",
        error: error.response?.data || error.message,
      };
    }
  },

  /**
   * Update an existing membership package
   * @param {string} id - Package ID
   * @param {Object} packageData - Updated package data
   * @returns {Promise} API response
   */
  async updatePackage(id, packageData) {
    try {
      const response = await api.put(
        `/api/admin/update-membership-package/${id}`,
        packageData
      );
      return {
        success: true,
        data: response.data,
        message: "Package updated successfully",
      };
    } catch (error) {
      console.error("Error updating package:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update package",
        error: error.response?.data || error.message,
      };
    }
  },

  /**
   * Delete a membership package
   * @param {string} id - Package ID to delete
   * @returns {Promise} API response
   */
  async deletePackage(id) {
    try {
      const response = await api.delete(
        `/api/admin/delete-membership-package/${id}`
      );
      return {
        success: true,
        data: response.data,
        message: "Package deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting package:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete package",
        error: error.response?.data || error.message,
      };
    }
  },

  /**
   * Get package by ID
   * @param {string} id - Package ID
   * @returns {Promise} API response
   */
  async getPackageById(id) {
    try {
      const response = await api.get(`/api/admin/membership-package/${id}`);
      return {
        success: true,
        data: response.data,
        message: "Package fetched successfully",
      };
    } catch (error) {
      console.error("Error fetching package:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch package",
        error: error.response?.data || error.message,
      };
    }
  },

  /**
   * Test API connection
   * @returns {Promise} API response
   */
  async testConnection() {
    try {
      const response = await api.get("/api/admin/membership-packages");
      return {
        success: true,
        message: "API connection successful",
        data: response.data,
      };
    } catch (error) {
      console.error("API connection test failed:", error);
      return {
        success: false,
        message: "API connection failed",
        error: error.message,
      };
    }
  },
};
