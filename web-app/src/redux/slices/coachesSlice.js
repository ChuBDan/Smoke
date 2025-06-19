import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { coachesApi } from "@/features/admin/services/coachesApi";

// Async thunk for fetching all coaches
export const fetchAllCoaches = createAsyncThunk(
  "coaches/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const result = await coachesApi.getAllCoaches();
      if (result.success) {
        // Extract coaches array from the API response
        const coachesData = result.data?.coaches || result.data || [];

        // Validate that coachesData is an array
        if (!Array.isArray(coachesData)) {
          console.error("Invalid coaches data format:", coachesData);
          return rejectWithValue("Invalid data format received from server");
        }

        // Map API data to component format with clean data mapping
        const mappedCoaches = coachesData.map((coach) => {
          try {
            return {
              id: coach.id || Math.random().toString(36).substr(2, 9),
              name: coach.name || coach.fullName || "Unknown",
              username: coach.username || "unknown",
              email: coach.email || "",
              phoneNumber: coach.phoneNumber || "",
              expertise: coach.expertise || "",
              status: coach.status ? coach.status.toLowerCase() : "active",
              gender: coach.gender || "",
              dob: coach.dob || "",
              role: coach.role || "coach",
              dateCreated:
                coach.dateCreated ||
                coach.createdAt ||
                new Date().toISOString(),
              dateUpdated:
                coach.dateUpdated ||
                coach.updatedAt ||
                new Date().toISOString(),
            };
          } catch (mappingError) {
            console.error("Error mapping coach data:", coach, mappingError);
            return {
              id: Math.random().toString(36).substr(2, 9),
              name: "Unknown Coach",
              username: "unknown",
              email: "",
              phoneNumber: "",
              expertise: "",
              status: "active",
              gender: "",
              dob: "",
              role: "coach",
              dateCreated: new Date().toISOString(),
              dateUpdated: new Date().toISOString(),
            };
          }
        });

        // Filter out deleted coaches
        const activeCoaches = mappedCoaches.filter(
          (coach) => coach.status !== "deleted"
        );

        return activeCoaches;
      } else {
        return rejectWithValue(result.message || "Failed to fetch coaches");
      }
    } catch (error) {
      console.error("Network or parsing error:", error);
      return rejectWithValue(
        error.message || "Failed to connect to API endpoint"
      );
    }
  }
);

// Register a new coach
export const registerCoach = createAsyncThunk(
  "coaches/register",
  async (coachData, { rejectWithValue }) => {
    try {
      const result = await coachesApi.registerCoach(coachData);
      if (result.success) {
        return result.data;
      } else {
        return rejectWithValue(result.message || "Failed to register coach");
      }
    } catch (error) {
      return rejectWithValue(error.message || "Failed to register coach");
    }
  }
);

// Delete a coach
export const deleteCoach = createAsyncThunk(
  "coaches/delete",
  async (coachId, { rejectWithValue }) => {
    try {
      const result = await coachesApi.deleteCoach(coachId);
      if (result.success) {
        return coachId; // Return the deleted coach ID
      } else {
        return rejectWithValue(result.message || "Failed to delete coach");
      }
    } catch (error) {
      return rejectWithValue(error.message || "Failed to delete coach");
    }
  }
);

// Test coaches API endpoint
export const testCoachesApi = createAsyncThunk(
  "coaches/testApi",
  async (_, { rejectWithValue }) => {
    try {
      const result = await coachesApi.testGetAllCoaches();
      return result;
    } catch (error) {
      return rejectWithValue(error.message || "API test failed");
    }
  }
);

const coachesSlice = createSlice({
  name: "coaches",
  initialState: {
    coaches: [],
    loading: false,
    error: null,
    lastFetch: null,
  },
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
  },
  extraReducers: (builder) => {
    builder
      // Fetch all coaches
      .addCase(fetchAllCoaches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllCoaches.fulfilled, (state, action) => {
        state.loading = false;
        state.coaches = action.payload;
        state.lastFetch = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchAllCoaches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register coach
      .addCase(registerCoach.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerCoach.fulfilled, (state, action) => {
        state.loading = false;
        // Add the new coach to the state (if the API returns the coach data)
        if (action.payload) {
          state.coaches.push(action.payload);
        }
        state.error = null;
      })
      .addCase(registerCoach.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete coach
      .addCase(deleteCoach.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCoach.fulfilled, (state, action) => {
        state.loading = false;
        // Remove the deleted coach from the state
        state.coaches = state.coaches.filter(
          (coach) => coach.id !== action.payload
        );
        state.error = null;
      })
      .addCase(deleteCoach.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Test API
      .addCase(testCoachesApi.pending, (state) => {
        state.loading = true;
      })
      .addCase(testCoachesApi.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(testCoachesApi.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setSearchTerm, setFilterStatus } =
  coachesSlice.actions;
export default coachesSlice.reducer;
