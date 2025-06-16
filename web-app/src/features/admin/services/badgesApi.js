import api from "@/config/api";

/**
 * Utility function to validate badge data structure
 * @param {Object} badge - Badge object to validate
 * @returns {boolean} - Whether the badge has required properties
 */
const validateBadgeData = (badge) => {
  return (
    badge &&
    typeof badge === "object" &&
    badge.id &&
    badge.badgeName &&
    badge.description !== undefined
  );
};

/**
 * Utility function to normalize badge data
 * @param {Object} badge - Raw badge data from API
 * @returns {Object} - Normalized badge object
 */
const normalizeBadgeData = (badge) => {
  if (!validateBadgeData(badge)) {
    throw new Error("Invalid badge data structure");
  }

  return {
    id: badge.id,
    badgeName: String(badge.badgeName).trim(),
    description: String(badge.description).trim(),
    status:
      typeof badge.status === "string" ? badge.status.toLowerCase() : "active",
    dateCreated: badge.dateCreated || new Date().toISOString(),
    dateUpdated: badge.dateUpdated || new Date().toISOString(),
  };
};

/**
 * Utility function to handle API errors consistently
 * @param {Error} error - Error object from API call
 * @param {string} operation - Operation that failed
 * @returns {Object} - Standardized error response
 */
const handleApiError = (error, operation) => {
  console.error(`Error ${operation}:`, error);

  // Network or timeout errors
  if (!error.response) {
    return {
      success: false,
      message: `Network error: Failed to ${operation}. Please check your connection.`,
      error: {
        type: "NETWORK_ERROR",
        message: error.message,
      },
    };
  }

  // API errors with response
  const status = error.response.status;
  const responseData = error.response.data;

  let message;
  switch (status) {
    case 400:
      message =
        responseData?.message || `Invalid data provided for ${operation}`;
      break;
    case 401:
      message = "Authentication required. Please log in again.";
      break;
    case 403:
      message = "You do not have permission to perform this action.";
      break;
    case 404:
      message = "The requested badge was not found.";
      break;
    case 409:
      message = "A badge with this name already exists.";
      break;
    case 422:
      message =
        responseData?.message || "Validation failed. Please check your input.";
      break;
    case 500:
      message = "Server error. Please try again later.";
      break;
    default:
      message = responseData?.message || `Failed to ${operation}`;
  }

  return {
    success: false,
    message,
    error: {
      type: "API_ERROR",
      status,
      data: responseData,
    },
  };
};

/**
 * Badges API Service
 * Handles all CRUD operations for badges with improved error handling and validation
 */
export const badgesApi = {
  /**
   * Get all badges with proper validation and error handling
   * @returns {Promise<Object>} API response with normalized data
   */
  async getAllBadges() {
    try {
      const response = await api.get("/api/public/get-all-badges");

      // Validate response structure
      if (!response || !response.data) {
        throw new Error("Invalid response structure from server");
      }

      // Extract badges array with multiple fallback options
      let badgesData = [];
      if (response.data.badges && Array.isArray(response.data.badges)) {
        badgesData = response.data.badges;
      } else if (Array.isArray(response.data)) {
        badgesData = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        badgesData = response.data.data;
      }

      // Validate and normalize each badge
      const normalizedBadges = [];
      for (const badge of badgesData) {
        try {
          normalizedBadges.push(normalizeBadgeData(badge));
        } catch (validationError) {
          console.warn(
            "Skipping invalid badge data:",
            badge,
            validationError.message
          );
          // Continue processing other badges instead of failing completely
        }
      }

      return {
        success: true,
        data: {
          badges: normalizedBadges,
          total: normalizedBadges.length,
        },
        message: `Successfully fetched ${normalizedBadges.length} badges`,
      };
    } catch (error) {
      return handleApiError(error, "fetch badges");
    }
  },

  /**
   * Create a new badge with validation
   * @param {Object} badgeData - Badge data to create
   * @returns {Promise<Object>} API response
   */
  async createBadge(badgeData) {
    try {
      // Client-side validation
      if (!badgeData || typeof badgeData !== "object") {
        throw new Error("Badge data is required");
      }

      if (!badgeData.badgeName || !badgeData.badgeName.toString().trim()) {
        throw new Error("Badge name is required");
      }

      if (!badgeData.description || !badgeData.description.toString().trim()) {
        throw new Error("Badge description is required");
      }

      // Sanitize input data
      const sanitizedData = {
        badgeName: badgeData.badgeName.toString().trim(),
        description: badgeData.description.toString().trim(),
        status: badgeData.status || "active",
      };
      const response = await api.post(
        "/api/public/create-badge",
        sanitizedData
      );

      if (!response || !response.data) {
        throw new Error("Invalid response from server");
      }

      const normalizedBadge = normalizeBadgeData(response.data);

      return {
        success: true,
        data: normalizedBadge,
        message: "Badge created successfully",
      };
    } catch (error) {
      return handleApiError(error, "create badge");
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
      // Validate inputs
      if (!badgeId) {
        throw new Error("Badge ID is required");
      }

      if (!badgeData || typeof badgeData !== "object") {
        throw new Error("Badge data is required");
      }

      // Sanitize input data (only include allowed fields)
      const sanitizedData = {};
      if (badgeData.badgeName !== undefined) {
        sanitizedData.badgeName = badgeData.badgeName.toString().trim();
      }
      if (badgeData.description !== undefined) {
        sanitizedData.description = badgeData.description.toString().trim();
      }
      if (badgeData.status !== undefined) {
        sanitizedData.status = badgeData.status.toString().toLowerCase();
      }

      // Ensure at least one field is being updated
      if (Object.keys(sanitizedData).length === 0) {
        throw new Error("At least one field must be provided for update");
      }

      const response = await api.put(
        `/api/public/update-badge/${badgeId}`,
        sanitizedData
      );

      if (!response || !response.data) {
        throw new Error("Invalid response from server");
      }

      const normalizedBadge = normalizeBadgeData(response.data);

      return {
        success: true,
        data: normalizedBadge,
        message: "Badge updated successfully",
      };
    } catch (error) {
      return handleApiError(error, "update badge");
    }
  },

  /**
   * Delete a badge with proper validation
   * @param {string|number} badgeId - Badge ID to delete
   * @returns {Promise<Object>} API response
   */
  async deleteBadge(badgeId) {
    try {
      if (!badgeId) {
        throw new Error("Badge ID is required");
      }

      const response = await api.delete(`/api/public/delete-badge/${badgeId}`);

      return {
        success: true,
        data: {
          deletedId: badgeId,
          ...response.data,
        },
        message: "Badge deleted successfully",
      };
    } catch (error) {
      return handleApiError(error, "delete badge");
    }
  },

  /**
   * Get a specific badge by ID with validation
   * @param {string|number} badgeId - Badge ID to fetch
   * @returns {Promise<Object>} API response
   */
  async getBadgeById(badgeId) {
    try {
      if (!badgeId) {
        throw new Error("Badge ID is required");
      }

      const response = await api.get(`/api/public/get-badge/${badgeId}`);

      if (!response || !response.data) {
        throw new Error("Invalid response from server");
      }

      const normalizedBadge = normalizeBadgeData(response.data);

      return {
        success: true,
        data: normalizedBadge,
        message: "Badge fetched successfully",
      };
    } catch (error) {
      return handleApiError(error, "fetch badge");
    }
  },
};
