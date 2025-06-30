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
        const membersData = result.data?.members || result.data || [];

        // Validate that membersData is an array
        if (!Array.isArray(membersData)) {
          console.error("Invalid members data format:", membersData);
          return rejectWithValue("Invalid data format received from server");
        }

        // Map API data to component format with clean data mapping
        const mappedMembers = membersData.map((member) => {
          try {
            return {
              id: member.id || Math.random().toString(36).substr(2, 9),
              name: member.fullName || member.name || "Unknown",
              fullName: member.fullName || member.name || "Unknown",
              username: member.username || "unknown",
              email: member.email || "",
              phone: member.phoneNumber || member.phone || "",
              phoneNumber: member.phoneNumber || member.phone || "",
              joinDate:
                member.join_Date ||
                member.joinDate ||
                member.dateCreated ||
                new Date().toISOString(),
              status: member.status ? member.status.toLowerCase() : "active",
              gender: member.gender || "",
              dob: member.dob || "",
              role: member.role || "member",
              dateCreated:
                member.dateCreated ||
                member.createdAt ||
                new Date().toISOString(),
              memberBadges: Array.isArray(member.memberBadges)
                ? member.memberBadges
                : [],
            };
          } catch (mappingError) {
            console.error("Error mapping member data:", member, mappingError);
            return {
              id: Math.random().toString(36).substr(2, 9),
              name: "Unknown Member",
              fullName: "Unknown Member",
              username: "unknown",
              email: "",
              phone: "",
              phoneNumber: "",
              joinDate: new Date().toISOString(),
              status: "active",
              gender: "",
              dob: "",
              role: "member",
              dateCreated: new Date().toISOString(),
              memberBadges: [],
            };
          }
        });

        // Filter out deleted members
        const activeMembers = mappedMembers.filter(
          (member) => member.status !== "deleted"
        );

        return activeMembers;
      } else {
        return rejectWithValue(result.message || "Failed to fetch members");
      }
    } catch (error) {
      console.error("Network or parsing error:", error);
      return rejectWithValue(
        error.message || "Failed to connect to API endpoint"
      );
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

// Delete a member
export const deleteMember = createAsyncThunk(
  "members/delete",
  async (memberId, { rejectWithValue }) => {
    try {
      const result = await membersApi.deleteUser(memberId);
      if (result.success) {
        return memberId; // Return the deleted member ID
      } else {
        return rejectWithValue(result.message || "Failed to delete member");
      }
    } catch (error) {
      return rejectWithValue(error.message || "Failed to delete member");
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
    dashboardLoadedOnce: false, // <-- add this line
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
    setDashboardLoadedOnce: (state, action) => {
      state.dashboardLoadedOnce = action.payload;
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
        state.dashboardLoadedOnce = true; // <-- set flag on first load
      })
      .addCase(fetchAllMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      }) // Test API
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
      })
      // Delete member
      .addCase(deleteMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMember.fulfilled, (state, action) => {
        state.loading = false;
        // Remove the deleted member from the state
        state.members = state.members.filter(
          (member) => member.id !== action.payload
        );
        state.error = null;
      })
      .addCase(deleteMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  setSearchTerm,
  setFilterStatus,
  setDashboardLoadedOnce,
} = membersSlice.actions;
export default membersSlice.reducer;
