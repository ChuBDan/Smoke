import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { membersApi } from "@/features/admin/services/membersApi";

// Async thunk for fetching all members
export const fetchAllMembers = createAsyncThunk(
  "members/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const result = await membersApi.getAllUsers();
      if (result.success) {
        // Extract members array from the API response
        const membersData = result.data.members || [];
        // Map API data to component format with clean data mapping
        const mappedMembers = membersData.map((member) => ({
          id: member.id,
          name: member.fullName,
          username: member.username,
          email: member.email,
          phone: member.phoneNumber,
          joinDate: member.join_Date,
          status: member.status.toLowerCase(), // Convert "ACTIVE" to "active"
          gender: member.gender,
          dob: member.dob,
          role: member.role,
          dateCreated: member.dateCreated,
          memberBadges: member.memberBadges || [],
        }));
        return mappedMembers;
      } else {
        return rejectWithValue(result.message || "Failed to fetch members");
      }
    } catch (error) {
      return rejectWithValue(error.message || "Failed to connect to API endpoint");
    }
  }
);

// Test members API endpoint
export const testMembersApi = createAsyncThunk(
  "members/testApi",
  async (_, { rejectWithValue }) => {
    try {
      const result = await membersApi.testGetAllUsers();
      return result;
    } catch (error) {
      return rejectWithValue(error.message || "API test failed");
    }
  }
);

const membersSlice = createSlice({
  name: "members",
  initialState: {
    members: [],
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
      // Fetch all members
      .addCase(fetchAllMembers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllMembers.fulfilled, (state, action) => {
        state.loading = false;
        state.members = action.payload;
        state.lastFetch = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchAllMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Test API
      .addCase(testMembersApi.pending, (state) => {
        state.loading = true;
      })
      .addCase(testMembersApi.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(testMembersApi.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setSearchTerm, setFilterStatus } = membersSlice.actions;
export default membersSlice.reducer;
