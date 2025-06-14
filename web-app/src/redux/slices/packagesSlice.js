import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { packagesApi } from "@/features/admin/services/packagesApi";

// Async thunk for fetching all packages
export const fetchAllPackages = createAsyncThunk(
  "packages/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const result = await packagesApi.getAllPackages();
      if (result.success) {
        // Extract packages array from the API response
        const packagesData = result.data.packages || result.data || [];
        // Map API data to component format with clean data mapping
        const mappedPackages = packagesData.map((pkg) => ({
          id: pkg.id,
          packageName: pkg.packageName,
          price: pkg.price,
          description: pkg.description,
          status: pkg.status?.toLowerCase() || "active", // Convert "ACTIVE" to "active"
          dateCreated: pkg.dateCreated,
          dateUpdated: pkg.dateUpdated,
          members: pkg.members || [],
          // Additional fields for component display
          memberCount: pkg.members?.length || 0,
          category: pkg.category || "Premium", // Default category if not provided
          duration: pkg.duration || "1 month", // Default duration if not provided
        }));
        return mappedPackages;
      } else {
        return rejectWithValue(result.message || "Failed to fetch packages");
      }
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to connect to API endpoint"
      );
    }
  }
);

// Async thunk for creating a package
export const createPackage = createAsyncThunk(
  "packages/create",
  async (packageData, { rejectWithValue }) => {
    try {
      const result = await packagesApi.createPackage(packageData);
      if (result.success) {
        return {
          id: result.data.id,
          packageName: result.data.packageName,
          price: result.data.price,
          description: result.data.description,
          status: result.data.status?.toLowerCase() || "active",
          dateCreated: result.data.dateCreated,
          dateUpdated: result.data.dateUpdated,
          members: result.data.members || [],
          memberCount: result.data.members?.length || 0,
          category: result.data.category || packageData.category || "Premium",
          duration: result.data.duration || packageData.duration || "1 month",
        };
      } else {
        return rejectWithValue(result.message || "Failed to create package");
      }
    } catch (error) {
      return rejectWithValue(error.message || "Failed to create package");
    }
  }
);

// Async thunk for updating a package
export const updatePackage = createAsyncThunk(
  "packages/update",
  async ({ id, packageData }, { rejectWithValue }) => {
    try {
      const result = await packagesApi.updatePackage(id, packageData);
      if (result.success) {
        return {
          id: result.data.id,
          packageName: result.data.packageName,
          price: result.data.price,
          description: result.data.description,
          status: result.data.status?.toLowerCase() || "active",
          dateCreated: result.data.dateCreated,
          dateUpdated: result.data.dateUpdated,
          members: result.data.members || [],
          memberCount: result.data.members?.length || 0,
          category: result.data.category || packageData.category || "Premium",
          duration: result.data.duration || packageData.duration || "1 month",
        };
      } else {
        return rejectWithValue(result.message || "Failed to update package");
      }
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update package");
    }
  }
);

// Async thunk for deleting a package
export const deletePackage = createAsyncThunk(
  "packages/delete",
  async (id, { rejectWithValue }) => {
    try {
      const result = await packagesApi.deletePackage(id);
      if (result.success) {
        return id;
      } else {
        return rejectWithValue(result.message || "Failed to delete package");
      }
    } catch (error) {
      return rejectWithValue(error.message || "Failed to delete package");
    }
  }
);

// Test packages API endpoint
export const testPackagesApi = createAsyncThunk(
  "packages/testApi",
  async (_, { rejectWithValue }) => {
    try {
      const result = await packagesApi.testConnection();
      return result;
    } catch (error) {
      return rejectWithValue(error.message || "API test failed");
    }
  }
);

const packagesSlice = createSlice({
  name: "packages",
  initialState: {
    packages: [],
    loading: false,
    error: null,
    lastFetch: null,
    searchTerm: "",
    filterStatus: "all",
    filterCategory: "all",
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
    setFilterCategory: (state, action) => {
      state.filterCategory = action.payload;
    },
    clearFilters: (state) => {
      state.searchTerm = "";
      state.filterStatus = "all";
      state.filterCategory = "all";
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all packages
      .addCase(fetchAllPackages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllPackages.fulfilled, (state, action) => {
        state.loading = false;
        state.packages = action.payload;
        state.lastFetch = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchAllPackages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create package
      .addCase(createPackage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPackage.fulfilled, (state, action) => {
        state.loading = false;
        state.packages.push(action.payload);
        state.error = null;
      })
      .addCase(createPackage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update package
      .addCase(updatePackage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePackage.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.packages.findIndex(
          (pkg) => pkg.id === action.payload.id
        );
        if (index !== -1) {
          state.packages[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updatePackage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete package
      .addCase(deletePackage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePackage.fulfilled, (state, action) => {
        state.loading = false;
        state.packages = state.packages.filter(
          (pkg) => pkg.id !== action.payload
        );
        state.error = null;
      })
      .addCase(deletePackage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Test API
      .addCase(testPackagesApi.pending, (state) => {
        state.loading = true;
      })
      .addCase(testPackagesApi.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(testPackagesApi.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  setSearchTerm,
  setFilterStatus,
  setFilterCategory,
  clearFilters,
} = packagesSlice.actions;

export default packagesSlice.reducer;
