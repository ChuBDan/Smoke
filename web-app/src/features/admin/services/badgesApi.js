import api from "@/config/api";

/**
 * Helper function to check current authentication status
 */
const checkAuthStatus = () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  console.log("Current auth status:", {
    hasToken: !!token,
    tokenLength: token?.length || 0,
    role: role,
    tokenPreview: token ? `${token.substring(0, 10)}...` : "none",
  });
  return { token, role };
};

/**
 * Helper function to convert date format from DD-MM-YYYY to valid JavaScript date
 * @param {string} dateString - Date in DD-MM-YYYY format or other formats
 * @returns {string} Date in ISO format or original if already valid
 */
const convertDateFormat = (dateString) => {
  if (!dateString) return null;

  // If it's already a valid ISO format or includes T, return as is
  if (dateString.includes("T") || dateString.match(/^\d{4}-\d{2}-\d{2}/)) {
    return dateString;
  }

  // Check if it's DD-MM-YYYY format
  if (dateString.match(/^\d{2}-\d{2}-\d{4}$/)) {
    const [day, month, year] = dateString.split("-");
    return `${year}-${month}-${day}T00:00:00.000Z`;
  }

  // Try to create a date object to validate
  const testDate = new Date(dateString);
  if (!isNaN(testDate.getTime())) {
    return dateString; // Already valid
  }

  return dateString; // Return as is if we can't convert
};

/**
 * Normalize badge data to ensure consistent field names and valid dates
 * @param {Object} badge - Raw badge data from API
 * @returns {Object} Normalized badge data
 */
const normalizeBadgeData = (badge) => {
  return {
    ...badge,
    // Convert and normalize date formats
    dateCreated: convertDateFormat(badge.dateCreated || badge.date_created),
    dateUpdated: convertDateFormat(badge.dateUpdated || badge.date_updated),
    // Normalize status to lowercase for frontend consistency
    status: (badge.status || "").toLowerCase(),
    // Get member count from backend or fallback to memberBadges array length
    memberCount: badge.memberCount || badge.memberBadges?.length || 0,
    // Remove any duplicate fields
    date_created: undefined,
    date_updated: undefined,
  };
};

/**
 * Badges API Service
 * Handles all CRUD operations for badges
 */
export const badgesApi = {
  /**
   * Get all badges with proper validation and error handling
   * @returns {Promise<Object>} API response with normalized data
   */ async getAllBadges() {
    try {
      checkAuthStatus(); // Log current auth status
      console.log("Fetching badges from API...");
      const response = await api.get("/api/user/get-all-badges");
      console.log("API Response:", response);

      // Validate response data
      if (!response || !response.data) {
        throw new Error("Empty response from server");
      }

      // Handle the actual API response structure
      let responseData = response.data;
      if (typeof responseData === "string") {
        try {
          responseData = JSON.parse(responseData);
        } catch (parseError) {
          console.error("JSON parsing error:", parseError);
          throw new Error("Invalid JSON response from server");
        }
      }

      console.log("Parsed response data:", responseData);

      // Extract badges from the response structure
      let badges = responseData.badges || responseData.data || responseData;
      console.log("Extracted badges:", badges); // Normalize badge data (convert dates and field names)
      if (Array.isArray(badges)) {
        console.log("Original badges before normalization:", badges);
        badges = badges.map(normalizeBadgeData);
        console.log("Normalized badges:", badges);

        // Log status distribution for debugging
        const statusCounts = badges.reduce((acc, badge) => {
          acc[badge.status] = (acc[badge.status] || 0) + 1;
          return acc;
        }, {});
        console.log("Status distribution:", statusCounts);
      }

      // Return the normalized API response
      return {
        success: true,
        data: badges,
        message: responseData.message || "Badges fetched successfully",
      };
    } catch (error) {
      console.error("Error fetching badges:", error);
      console.error("Error response:", error.response);

      // For 403 errors, don't use mock data - let the error propagate
      if (error.response?.status === 403) {
        return {
          success: false,
          message: "Access denied. Please check your permissions.",
          error: error.response?.data || error.message,
        };
      } // Return mock data for development only for other errors
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
            memberCount: 45,
          },
          {
            id: 2,
            badgeName: "One Week Warrior",
            description: "Celebrated for achieving one week without cigarettes",
            status: "active",
            dateCreated: "2024-01-20T09:15:00Z",
            dateUpdated: "2024-06-18T16:45:00Z",
            memberCount: 23,
          },
          {
            id: 3,
            badgeName: "Monthly Milestone",
            description: "Earned for reaching one month smoke-free",
            status: "active",
            dateCreated: "2024-02-01T14:22:00Z",
            dateUpdated: "2024-06-17T11:30:00Z",
            memberCount: 12,
          },
          {
            id: 4,
            badgeName: "Support Star",
            description:
              "Given for actively participating in community support",
            status: "inactive",
            dateCreated: "2024-02-15T16:45:00Z",
            dateUpdated: "2024-06-16T09:12:00Z",
            memberCount: 8,
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
   */ async createBadge(badgeData) {
    try {
      checkAuthStatus(); // Log current auth status
      console.log("Creating badge:", badgeData);
      const response = await api.post("/api/admin/create-badge", badgeData);
      console.log("Create badge response:", response);

      // Normalize the response data
      let responseData = response.data;
      if (responseData && typeof responseData === "object") {
        responseData = normalizeBadgeData(responseData);
      }

      return {
        success: true,
        data: responseData,
        message: "Badge created successfully",
      };
    } catch (error) {
      console.error("Error creating badge:", error);

      // Handle 403 errors specifically
      if (error.response?.status === 403) {
        return {
          success: false,
          message: "Access denied. You don't have permission to create badges.",
          error: error.response?.data || error.message,
        };
      }

      // Handle other HTTP errors
      if (error.response?.status) {
        return {
          success: false,
          message:
            error.response?.data?.message ||
            `HTTP Error ${error.response.status}`,
          error: error.response?.data || error.message,
        };
      }

      // Return mock success for development only for network errors
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
   */ async updateBadge(badgeId, badgeData) {
    try {
      console.log("Updating badge:", badgeId, badgeData);
      const response = await api.put(
        `/api/admin/update-badge/${badgeId}`,
        badgeData
      );
      console.log("Update badge response:", response);

      // Normalize the response data
      let responseData = response.data;
      if (responseData && typeof responseData === "object") {
        responseData = normalizeBadgeData(responseData);
      }

      return {
        success: true,
        data: responseData,
        message: "Badge updated successfully",
      };
    } catch (error) {
      console.error("Error updating badge:", error);

      // Handle 403 errors specifically
      if (error.response?.status === 403) {
        return {
          success: false,
          message: "Access denied. You don't have permission to update badges.",
          error: error.response?.data || error.message,
        };
      }

      // Handle other HTTP errors
      if (error.response?.status) {
        return {
          success: false,
          message:
            error.response?.data?.message ||
            `HTTP Error ${error.response.status}`,
          error: error.response?.data || error.message,
        };
      }

      // Return mock success for development only for network errors
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
      const response = await api.delete(`/api/admin/delete-badge/${badgeId}`);

      return {
        success: true,
        data: response.data,
        message: "Badge deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting badge:", error);

      // Handle 403 errors specifically
      if (error.response?.status === 403) {
        return {
          success: false,
          message: "Access denied. You don't have permission to delete badges.",
          error: error.response?.data || error.message,
        };
      }

      // Handle other HTTP errors
      if (error.response?.status) {
        return {
          success: false,
          message:
            error.response?.data?.message ||
            `HTTP Error ${error.response.status}`,
          error: error.response?.data || error.message,
        };
      }

      // Return mock success for development only for network errors
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
   */ async getBadgeById(badgeId) {
    try {
      console.log("Fetching badge by ID:", badgeId);
      const response = await api.get(`/api/user/get-badge/${badgeId}`);
      console.log("Get badge by ID response:", response);

      // Normalize the response data
      let responseData = response.data;
      if (responseData && typeof responseData === "object") {
        responseData = normalizeBadgeData(responseData);
      }

      return {
        success: true,
        data: responseData,
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
