import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { badgesApi } from "@/features/admin/services/badgesApi";

/**
 * Utility function to handle async thunk errors consistently
 * @param {*} error - Error from API
 * @param {Function} rejectWithValue - Redux thunk reject function
 * @returns {*} Rejected value
 */
const handleThunkError = (error, rejectWithValue) => {
  if (error.success === false) {
    // Error from our API service
    return rejectWithValue({
      message: error.message,
      type: error.error?.type || "UNKNOWN_ERROR",
      details: error.error,
    });
  }

  // Unexpected error
  return rejectWithValue({
    message: error.message || "An unexpected error occurred",
    type: "UNEXPECTED_ERROR",
    details: error,
  });
};

/**
 * Async thunk for fetching all badges with improved error handling
 */
export const fetchAllBadges = createAsyncThunk(
  "badges/fetchAll",
  async (_, { rejectWithValue, signal }) => {
    try {
      // Check if the request was cancelled
      if (signal.aborted) {
        throw new Error("Request cancelled");
      }

      const result = await badgesApi.getAllBadges();

      if (result.success) {
        // Validate response structure
        if (!result.data || !Array.isArray(result.data.badges)) {
          throw new Error("Invalid response structure from API");
        }

        return {
          badges: result.data.badges,
          total: result.data.total || result.data.badges.length,
          message: result.message,
        };
      } else {
        return handleThunkError(result, rejectWithValue);
      }
    } catch (error) {
      return handleThunkError(error, rejectWithValue);
    }
  }
);

/**
 * Async thunk for creating a badge with validation
 */
export const createBadge = createAsyncThunk(
  "badges/create",
  async (badgeData, { rejectWithValue, signal }) => {
    try {
      if (signal.aborted) {
        throw new Error("Request cancelled");
      }

      // Client-side validation before API call
      if (!badgeData || typeof badgeData !== "object") {
        return rejectWithValue({
          message: "Invalid badge data provided",
          type: "VALIDATION_ERROR",
        });
      }

      const result = await badgesApi.createBadge(badgeData);

      if (result.success) {
        return {
          badge: result.data,
          message: result.message,
        };
      } else {
        return handleThunkError(result, rejectWithValue);
      }
    } catch (error) {
      return handleThunkError(error, rejectWithValue);
    }
  }
);

/**
 * Async thunk for updating a badge with validation
 */
export const updateBadge = createAsyncThunk(
  "badges/update",
  async ({ id, badgeData }, { rejectWithValue, signal, getState }) => {
    try {
      if (signal.aborted) {
        throw new Error("Request cancelled");
      }

      // Validate inputs
      if (!id) {
        return rejectWithValue({
          message: "Badge ID is required for update",
          type: "VALIDATION_ERROR",
        });
      }

      if (!badgeData || typeof badgeData !== "object") {
        return rejectWithValue({
          message: "Invalid badge data provided",
          type: "VALIDATION_ERROR",
        });
      }

      // Check if badge exists in current state (optional optimization)
      const currentState = getState();
      const existingBadge = currentState.badges.badges.find(
        (badge) => badge.id === id
      );
      if (!existingBadge) {
        return rejectWithValue({
          message: "Badge not found in current state",
          type: "NOT_FOUND_ERROR",
        });
      }

      const result = await badgesApi.updateBadge(id, badgeData);

      if (result.success) {
        return {
          badge: result.data,
          message: result.message,
        };
      } else {
        return handleThunkError(result, rejectWithValue);
      }
    } catch (error) {
      return handleThunkError(error, rejectWithValue);
    }
  }
);

/**
 * Async thunk for deleting a badge with validation
 */
export const deleteBadge = createAsyncThunk(
  "badges/delete",
  async (badgeId, { rejectWithValue, signal, getState }) => {
    try {
      if (signal.aborted) {
        throw new Error("Request cancelled");
      }

      if (!badgeId) {
        return rejectWithValue({
          message: "Badge ID is required for deletion",
          type: "VALIDATION_ERROR",
        });
      }

      // Check if badge exists in current state
      const currentState = getState();
      const existingBadge = currentState.badges.badges.find(
        (badge) => badge.id === badgeId
      );
      if (!existingBadge) {
        return rejectWithValue({
          message: "Badge not found",
          type: "NOT_FOUND_ERROR",
        });
      }

      const result = await badgesApi.deleteBadge(badgeId);

      if (result.success) {
        return {
          deletedId: badgeId,
          deletedBadge: existingBadge, // Keep reference for potential undo
          message: result.message,
        };
      } else {
        return handleThunkError(result, rejectWithValue);
      }
    } catch (error) {
      return handleThunkError(error, rejectWithValue);
    }
  }
);

/**
 * Async thunk for fetching a single badge by ID
 */
export const fetchBadgeById = createAsyncThunk(
  "badges/fetchById",
  async (badgeId, { rejectWithValue, signal }) => {
    try {
      if (signal.aborted) {
        throw new Error("Request cancelled");
      }

      if (!badgeId) {
        return rejectWithValue({
          message: "Badge ID is required",
          type: "VALIDATION_ERROR",
        });
      }

      const result = await badgesApi.getBadgeById(badgeId);

      if (result.success) {
        return {
          badge: result.data,
          message: result.message,
        };
      } else {
        return handleThunkError(result, rejectWithValue);
      }
    } catch (error) {
      return handleThunkError(error, rejectWithValue);
    }
  }
);

/**
 * Enhanced initial state with better organization
 */
const initialState = {
  // Data
  badges: [],
  selectedBadge: null,
  totalCount: 0,

  // Loading states - more granular control
  loading: {
    fetch: false,
    create: false,
    update: false,
    delete: false,
    fetchById: false,
  },

  // Error handling - more detailed error information
  error: {
    fetch: null,
    create: null,
    update: null,
    delete: null,
    fetchById: null,
  },

  // UI state
  searchTerm: "",
  filterStatus: "all",

  // Operation tracking
  operationInProgress: false,
  lastSuccessfulOperation: null,

  // Cache and optimization
  lastFetched: null,
  isStale: false,
};

/**
 * Enhanced badges slice with improved state management
 */
const badgesSlice = createSlice({
  name: "badges",
  initialState,
  reducers: {
    // Clear specific error
    clearError: (state, action) => {
      const errorType = action.payload;
      if (errorType && state.error[errorType]) {
        state.error[errorType] = null;
      } else {
        // Clear all errors if no specific type provided
        Object.keys(state.error).forEach((key) => {
          state.error[key] = null;
        });
      }
    },

    // Set search term
    setSearchTerm: (state, action) => {
      state.searchTerm =
        typeof action.payload === "string" ? action.payload : "";
    },

    // Set filter status with validation
    setFilterStatus: (state, action) => {
      const validStatuses = ["all", "active", "inactive"];
      state.filterStatus = validStatuses.includes(action.payload)
        ? action.payload
        : "all";
    },

    // Clear selected badge
    clearSelectedBadge: (state) => {
      state.selectedBadge = null;
      state.error.fetchById = null;
    },

    // Reset entire badges state
    resetBadgesState: () => {
      return { ...initialState };
    },

    // Mark data as stale (useful for cache invalidation)
    markAsStale: (state) => {
      state.isStale = true;
    },

    // Update badge optimistically (for immediate UI feedback)
    updateBadgeOptimistic: (state, action) => {
      const { id, updates } = action.payload;
      const index = state.badges.findIndex((badge) => badge.id === id);
      if (index !== -1) {
        state.badges[index] = { ...state.badges[index], ...updates };
      }
    },

    // Revert optimistic update (if API call fails)
    revertOptimisticUpdate: (state, action) => {
      const { id, originalBadge } = action.payload;
      const index = state.badges.findIndex((badge) => badge.id === id);
      if (index !== -1 && originalBadge) {
        state.badges[index] = originalBadge;
      }
    },
  },

  extraReducers: (builder) => {
    builder
      // Fetch all badges
      .addCase(fetchAllBadges.pending, (state) => {
        state.loading.fetch = true;
        state.error.fetch = null;
        state.operationInProgress = true;
      })
      .addCase(fetchAllBadges.fulfilled, (state, action) => {
        state.loading.fetch = false;
        state.operationInProgress = false;
        state.badges = action.payload.badges;
        state.totalCount = action.payload.total;
        state.error.fetch = null;
        state.lastFetched = new Date().toISOString();
        state.isStale = false;
        state.lastSuccessfulOperation = {
          type: "fetch",
          timestamp: new Date().toISOString(),
          message: action.payload.message,
        };
      })
      .addCase(fetchAllBadges.rejected, (state, action) => {
        state.loading.fetch = false;
        state.operationInProgress = false;
        state.error.fetch = action.payload;
      })

      // Create badge
      .addCase(createBadge.pending, (state) => {
        state.loading.create = true;
        state.error.create = null;
        state.operationInProgress = true;
      })
      .addCase(createBadge.fulfilled, (state, action) => {
        state.loading.create = false;
        state.operationInProgress = false;

        // Safely add new badge
        if (action.payload.badge) {
          state.badges.push(action.payload.badge);
          state.totalCount += 1;
        }

        state.error.create = null;
        state.lastSuccessfulOperation = {
          type: "create",
          timestamp: new Date().toISOString(),
          message: action.payload.message,
        };
      })
      .addCase(createBadge.rejected, (state, action) => {
        state.loading.create = false;
        state.operationInProgress = false;
        state.error.create = action.payload;
      })

      // Update badge
      .addCase(updateBadge.pending, (state) => {
        state.loading.update = true;
        state.error.update = null;
        state.operationInProgress = true;
      })
      .addCase(updateBadge.fulfilled, (state, action) => {
        state.loading.update = false;
        state.operationInProgress = false;

        if (action.payload.badge) {
          const index = state.badges.findIndex(
            (badge) => badge.id === action.payload.badge.id
          );
          if (index !== -1) {
            state.badges[index] = action.payload.badge;
          }

          // Update selected badge if it matches
          if (state.selectedBadge?.id === action.payload.badge.id) {
            state.selectedBadge = action.payload.badge;
          }
        }

        state.error.update = null;
        state.lastSuccessfulOperation = {
          type: "update",
          timestamp: new Date().toISOString(),
          message: action.payload.message,
        };
      })
      .addCase(updateBadge.rejected, (state, action) => {
        state.loading.update = false;
        state.operationInProgress = false;
        state.error.update = action.payload;
      })

      // Delete badge
      .addCase(deleteBadge.pending, (state) => {
        state.loading.delete = true;
        state.error.delete = null;
        state.operationInProgress = true;
      })
      .addCase(deleteBadge.fulfilled, (state, action) => {
        state.loading.delete = false;
        state.operationInProgress = false;

        const deletedId = action.payload.deletedId;
        state.badges = state.badges.filter((badge) => badge.id !== deletedId);
        state.totalCount = Math.max(0, state.totalCount - 1);

        // Clear selected badge if it was deleted
        if (state.selectedBadge?.id === deletedId) {
          state.selectedBadge = null;
        }

        state.error.delete = null;
        state.lastSuccessfulOperation = {
          type: "delete",
          timestamp: new Date().toISOString(),
          message: action.payload.message,
          deletedBadge: action.payload.deletedBadge, // For potential undo functionality
        };
      })
      .addCase(deleteBadge.rejected, (state, action) => {
        state.loading.delete = false;
        state.operationInProgress = false;
        state.error.delete = action.payload;
      })

      // Fetch badge by ID
      .addCase(fetchBadgeById.pending, (state) => {
        state.loading.fetchById = true;
        state.error.fetchById = null;
        state.operationInProgress = true;
      })
      .addCase(fetchBadgeById.fulfilled, (state, action) => {
        state.loading.fetchById = false;
        state.operationInProgress = false;

        if (action.payload.badge) {
          state.selectedBadge = action.payload.badge;

          // Update the badge in badges array if it exists
          const index = state.badges.findIndex(
            (badge) => badge.id === action.payload.badge.id
          );
          if (index !== -1) {
            state.badges[index] = action.payload.badge;
          }
        }

        state.error.fetchById = null;
        state.lastSuccessfulOperation = {
          type: "fetchById",
          timestamp: new Date().toISOString(),
          message: action.payload.message,
        };
      })
      .addCase(fetchBadgeById.rejected, (state, action) => {
        state.loading.fetchById = false;
        state.operationInProgress = false;
        state.error.fetchById = action.payload;
        state.selectedBadge = null;
      });
  },
});

// Export actions
export const {
  clearError,
  setSearchTerm,
  setFilterStatus,
  clearSelectedBadge,
  resetBadgesState,
  markAsStale,
  updateBadgeOptimistic,
  revertOptimisticUpdate,
} = badgesSlice.actions;

// Selectors for better state access
export const selectBadges = (state) => state.badges.badges;
export const selectSelectedBadge = (state) => state.badges.selectedBadge;
export const selectBadgesLoading = (state) => state.badges.loading;
export const selectBadgesError = (state) => state.badges.error;
export const selectFilteredBadges = (state) => {
  const { badges, searchTerm, filterStatus } = state.badges;
  return badges.filter((badge) => {
    const matchesSearch =
      !searchTerm ||
      badge.badgeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      badge.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" || badge.status === filterStatus;

    return matchesSearch && matchesFilter;
  });
};
export const selectOperationInProgress = (state) =>
  state.badges.operationInProgress;
export const selectLastSuccessfulOperation = (state) =>
  state.badges.lastSuccessfulOperation;

export default badgesSlice.reducer;
