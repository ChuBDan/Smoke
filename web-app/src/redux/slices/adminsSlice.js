import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import adminsApi from "@/features/admin/services/adminsApi";

// Async thunks
export const fetchAllAdmins = createAsyncThunk(
  "admins/fetchAllAdmins",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminsApi.getAllAdmins();

      // Validate response structure
      if (!response || typeof response !== "object") {
        console.error("Invalid admins response format:", response);
        return rejectWithValue("Invalid data format received from server");
      }

      // Handle both direct array and wrapped response formats
      let adminsData;
      if (Array.isArray(response)) {
        adminsData = response;
      } else if (response.data && Array.isArray(response.data)) {
        adminsData = response.data;
      } else if (
        response.data &&
        response.data.admins &&
        Array.isArray(response.data.admins)
      ) {
        adminsData = response.data.admins;
      } else {
        console.error("Could not find admins array in response:", response);
        return rejectWithValue("Invalid data structure received from server");
      }

      // Map and validate each admin
      const mappedAdmins = adminsData.map((admin) => {
        try {
          return {
            id: admin.id || Math.random().toString(36).substr(2, 9),
            username: admin.username || "unknown",
            role: admin.role || "admin",
            status: admin.status ? admin.status.toLowerCase() : "active",
            dateCreated:
              admin.dateCreated || admin.createdAt || new Date().toISOString(),
            dateUpdated:
              admin.dateUpdated || admin.updatedAt || new Date().toISOString(),
          };
        } catch (mappingError) {
          console.error("Error mapping admin data:", admin, mappingError);
          return {
            id: Math.random().toString(36).substr(2, 9),
            username: "unknown",
            role: "admin",
            status: "active",
            dateCreated: new Date().toISOString(),
            dateUpdated: new Date().toISOString(),
          };
        }
      });

      return mappedAdmins;
    } catch (error) {
      console.error("Network or parsing error:", error);
      return rejectWithValue(
        error.message || "Failed to connect to API endpoint"
      );
    }
  }
);

export const registerAdmin = createAsyncThunk(
  "admins/registerAdmin",
  async (adminData, { rejectWithValue }) => {
    try {
      const response = await adminsApi.registerAdmin(adminData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteAdmin = createAsyncThunk(
  "admins/deleteAdmin",
  async (adminId, { rejectWithValue }) => {
    try {
      await adminsApi.deleteAdmin(adminId);
      return adminId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getAdminById = createAsyncThunk(
  "admins/getAdminById",
  async (adminId, { rejectWithValue }) => {
    try {
      const response = await adminsApi.getAdminById(adminId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateAdmin = createAsyncThunk(
  "admins/updateAdmin",
  async ({ adminId, adminData }, { rejectWithValue }) => {
    try {
      const response = await adminsApi.updateAdmin(adminId, adminData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  admins: [],
  currentAdmin: null,
  loading: false,
  error: null,
  totalAdmins: 0,
};

const adminsSlice = createSlice({
  name: "admins",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentAdmin: (state) => {
      state.currentAdmin = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all admins
      .addCase(fetchAllAdmins.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllAdmins.fulfilled, (state, action) => {
        state.loading = false;
        state.admins = action.payload;
        state.totalAdmins = action.payload.length;
      })
      .addCase(fetchAllAdmins.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Register admin
      .addCase(registerAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerAdmin.fulfilled, (state, action) => {
        state.loading = false;
        // Add the new admin to the list if the response contains the admin data
        if (action.payload && action.payload.id) {
          state.admins.push(action.payload);
          state.totalAdmins += 1;
        }
      })
      .addCase(registerAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete admin
      .addCase(deleteAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.admins = state.admins.filter(
          (admin) => admin.id !== action.payload
        );
        state.totalAdmins -= 1;
      })
      .addCase(deleteAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get admin by ID
      .addCase(getAdminById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAdminById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAdmin = action.payload;
      })
      .addCase(getAdminById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update admin
      .addCase(updateAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAdmin.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.admins.findIndex(
          (admin) => admin.id === action.payload.id
        );
        if (index !== -1) {
          state.admins[index] = action.payload;
        }
        if (state.currentAdmin && state.currentAdmin.id === action.payload.id) {
          state.currentAdmin = action.payload;
        }
      })
      .addCase(updateAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentAdmin } = adminsSlice.actions;
export default adminsSlice.reducer;
