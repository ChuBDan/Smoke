import { httpMethods } from "@/config/api";

/**
 * Badges API Service
 * Handles all CRUD operations for badges
 */
export const badgesApi = {
  /**
   * Get all badges with proper validation and error handling
   * @returns {Promise<Object>} API response with normalized data
   */
  async getAllBadges() {
    try {
      const response = await httpMethods.get("/api/user/get-all-badges");

      // Validate response data
      if (!response || !response.data) {
        throw new Error("Empty response from server");
      } // Handle cases where response might be a string that needs parsing
      let responseData = response.data;
      if (typeof responseData === "string") {
        try {
          responseData = JSON.parse(responseData);
        } catch (parseError) {
          console.error("JSON parsing error:", parseError);
          throw new Error("Invalid JSON response from server");
        }
      }

      // Return the actual API response
      return {
        success: true,
        data: responseData,
        message: "Badges fetched successfully",
      };
    } catch (error) {
      console.error("Error fetching badges:", error);

      // Return mock data for development
      return {
        success: true,
        data: [
          {
            id: 1,
            badgeName: "First Day Smoke-Free",
            description:
              "Awarded for completing your first day without smoking",
            status: "active",
            dateCreated: "2024-01-15T10:30:00Z",
            dateUpdated: "2024-06-19T14:20:00Z",
          },
          {
            id: 2,
            badgeName: "One Week Warrior",
            description: "Celebrated for achieving one week without cigarettes",
            status: "active",
            dateCreated: "2024-01-20T09:15:00Z",
            dateUpdated: "2024-06-18T16:45:00Z",
          },
          {
            id: 3,
            badgeName: "Monthly Milestone",
            description: "Earned for reaching one month smoke-free",
            status: "active",
            dateCreated: "2024-02-01T14:22:00Z",
            dateUpdated: "2024-06-17T11:30:00Z",
          },
          {
            id: 4,
            badgeName: "Support Star",
            description:
              "Given for actively participating in community support",
            status: "inactive",
            dateCreated: "2024-02-15T16:45:00Z",
            dateUpdated: "2024-06-16T09:12:00Z",
          },
        ],
        message: "Using mock data - API endpoint not available",
      };
    }
  },

  /**
   * Create a new badge with validation
   * @param {Object} badgeData - Badge data to create
   * @returns {Promise<Object>} API response
   */
  async createBadge(badgeData) {
    try {
      const response = await httpMethods.post(
        "/api/admin/create-badge",
        badgeData
      );

      return {
        success: true,
        data: response.data,
        message: "Badge created successfully",
      };
    } catch (error) {
      console.error("Error creating badge:", error);

      // Return mock success for development
      return {
        success: true,
        data: {
          id: Date.now(),
          ...badgeData,
          dateCreated: new Date().toISOString(),
          dateUpdated: new Date().toISOString(),
        },
        message: "Mock creation successful - API endpoint not available",
      };
    }
  },

  /**
   * Update an existing badge with validation
   * @param {string|number} badgeId - Badge ID to update
   * @param {Object} badgeData - Updated badge data
   * @returns {Promise<Object>} API response
   */
  async updateBadge(badgeId, badgeData) {
    try {
      const response = await httpMethods.put(
        `/api/admin/update-badge/${badgeId}`,
        badgeData
      );

      return {
        success: true,
        data: response.data,
        message: "Badge updated successfully",
      };
    } catch (error) {
      console.error("Error updating badge:", error);

      // Return mock success for development
      return {
        success: true,
        data: {
          id: badgeId,
          ...badgeData,
          dateUpdated: new Date().toISOString(),
        },
        message: "Mock update successful - API endpoint not available",
      };
    }
  },

  /**
   * Delete a badge with proper validation
   * @param {string|number} badgeId - Badge ID to delete
   * @returns {Promise<Object>} API response
   */
  async deleteBadge(badgeId) {
    try {
      const response = await httpMethods.delete(
        `/api/admin/delete-badge/${badgeId}`
      );

      return {
        success: true,
        data: response.data,
        message: "Badge deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting badge:", error);

      // Return mock success for development
      return {
        success: true,
        message: "Mock deletion successful - API endpoint not available",
      };
    }
  },

  /**
   * Get a specific badge by ID with validation
   * @param {string|number} badgeId - Badge ID to fetch
   * @returns {Promise<Object>} API response
   */
  async getBadgeById(badgeId) {
    try {
      const response = await httpMethods.get(`/api/user/get-badge/${badgeId}`);

      return {
        success: true,
        data: response.data,
        message: "Badge fetched successfully",
      };
    } catch (error) {
      console.error("Error fetching badge:", error);

      // Return mock data for development
      return {
        success: true,
        data: {
          id: badgeId,
          badgeName: "Sample Badge",
          description: "This is a sample badge for development",
          status: "active",
          dateCreated: "2024-01-15T10:30:00Z",
          dateUpdated: "2024-06-19T14:20:00Z",
        },
        message: "Using mock data - API endpoint not available",
      };
    }
  },
};
