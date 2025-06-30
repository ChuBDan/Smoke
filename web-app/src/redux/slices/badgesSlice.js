import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { badgesApi } from "@/features/admin/services/badgesApi";

// Async thunks for badge operations
export const fetchAllBadges = createAsyncThunk(
  "badges/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const result = await badgesApi.getAllBadges();
      if (result.success) {
        // Ensure we always return an array
        return Array.isArray(result.data) ? result.data : [];
      } else {
        return rejectWithValue(result.message);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createBadge = createAsyncThunk(
  "badges/create",
  async (badgeData, { rejectWithValue }) => {
    try {
      const result = await badgesApi.createBadge(badgeData);
      if (result.success) {
        return result.data;
      } else {
        return rejectWithValue(result.message);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateBadge = createAsyncThunk(
  "badges/update",
  async ({ id, badgeData }, { rejectWithValue }) => {
    try {
      const result = await badgesApi.updateBadge(id, badgeData);
      if (result.success) {
        return result.data;
      } else {
        return rejectWithValue(result.message);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteBadge = createAsyncThunk(
  "badges/delete",
  async (badgeId, { rejectWithValue }) => {
    try {
      const result = await badgesApi.deleteBadge(badgeId);
      if (result.success) {
        return badgeId;
      } else {
        return rejectWithValue(result.message);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchBadgeById = createAsyncThunk(
  "badges/fetchById",
  async (badgeId, { rejectWithValue }) => {
    try {
      const result = await badgesApi.getBadgeById(badgeId);
      if (result.success) {
        return result.data;
      } else {
        return rejectWithValue(result.message);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  badges: [], // Always initialize as empty array
  selectedBadge: null,
  loading: false,
  error: null,
  searchTerm: "",
  filterStatus: "all",
  lastFetch: null, // <-- add this line
};

const badgesSlice = createSlice({
  name: "badges",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    setFilterStatus: (state, action) => {
      state.filterStatus = action.payload;
    },
    setSelectedBadge: (state, action) => {
      state.selectedBadge = action.payload;
    },
    clearSelectedBadge: (state) => {
      state.selectedBadge = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all badges
      .addCase(fetchAllBadges.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllBadges.fulfilled, (state, action) => {
        state.loading = false;
        // Ensure payload is always an array
        state.badges = Array.isArray(action.payload) ? action.payload : [];
        state.lastFetch = new Date().toISOString(); // <-- add this line
      })
      .addCase(fetchAllBadges.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Keep badges as empty array on error
        state.badges = [];
      })

      // Create badge
      .addCase(createBadge.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBadge.fulfilled, (state, action) => {
        state.loading = false;
        // Ensure badges is array before pushing
        if (Array.isArray(state.badges)) {
          state.badges.push(action.payload);
        } else {
          state.badges = [action.payload];
        }
      })
      .addCase(createBadge.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update badge
      .addCase(updateBadge.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBadge.fulfilled, (state, action) => {
        state.loading = false;
        if (Array.isArray(state.badges)) {
          const index = state.badges.findIndex(
            (badge) => badge.id === action.payload.id
          );
          if (index !== -1) {
            state.badges[index] = action.payload;
          }
        }
      })
      .addCase(updateBadge.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete badge
      .addCase(deleteBadge.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBadge.fulfilled, (state, action) => {
        state.loading = false;
        if (Array.isArray(state.badges)) {
          state.badges = state.badges.filter(
            (badge) => badge.id !== action.payload
          );
        }
      })
      .addCase(deleteBadge.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch badge by ID
      .addCase(fetchBadgeById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBadgeById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedBadge = action.payload;
      })
      .addCase(fetchBadgeById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  setSearchTerm,
  setFilterStatus,
  setSelectedBadge,
  clearSelectedBadge,
} = badgesSlice.actions;

export default badgesSlice.reducer;
