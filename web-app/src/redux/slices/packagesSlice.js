import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { packagesApi } from "@/features/admin/services/packagesApi";

// Async thunk for fetching all packages
export const fetchAllPackages = createAsyncThunk(
  "packages/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const result = await packagesApi.getAllPackages();
      console.log("API Response:", result); // Debug log
      if (result.success) {
        // Extract packages array from the API response
        // API returns data with 'membership_Packages' field name
        const packagesData =
          result.data.membership_Packages ||
          result.data.packages ||
          result.data ||
          [];
        console.log("Extracted packages data:", packagesData); // Debug log

        // Helper function to convert DD-MM-YYYY to a proper Date object
        const parseCustomDate = (dateString) => {
          if (!dateString) return null;
          try {
            // Check if it's already a valid date string in ISO format
            if (
              dateString.includes("T") ||
              dateString.match(/^\d{4}-\d{2}-\d{2}$/)
            ) {
              return new Date(dateString).toISOString(); // Return ISO string instead of Date object
            }

            // Handle DD-MM-YYYY format
            const [day, month, year] = dateString.split("-");
            if (!day || !month || !year) {
              console.warn(`Invalid date format: ${dateString}`);
              return null;
            }

            const parsedDate = new Date(year, month - 1, day); // month is 0-indexed
            console.log(
              `Parsing date: ${dateString} -> ${parsedDate.toLocaleDateString()}`
            ); // Debug log
            return parsedDate.toISOString(); // Return ISO string instead of Date object
          } catch (error) {
            console.error(`Error parsing date: ${dateString}`, error);
            return null;
          }
        };

        // Map API data to component format with clean data mapping
        const mappedPackages = packagesData.map((pkg) => ({
          id: pkg.id,
          packageName: pkg.packageName,
          price: pkg.price,
          description: pkg.description,
          status: pkg.status?.toLowerCase() || "active", // Convert "ACTIVE" to "active"
          dateCreated: parseCustomDate(pkg.dateCreated),
          dateUpdated: parseCustomDate(pkg.dateUpdated),
          members: pkg.members || [], // Additional fields for component display
          memberCount: pkg.members?.length || 0,
          // Note: category and duration are frontend-only fields for UI filtering
          // Infer category from package name or description for better UI display
          category:
            pkg.category ||
            (pkg.packageName?.toLowerCase().includes("basic")
              ? "basic"
              : pkg.packageName?.toLowerCase().includes("premium")
              ? "premium"
              : pkg.packageName?.toLowerCase().includes("ultimate")
              ? "ultimate"
              : pkg.description?.toLowerCase().includes("basic")
              ? "basic"
              : pkg.description?.toLowerCase().includes("premium")
              ? "premium"
              : pkg.description?.toLowerCase().includes("ultimate")
              ? "ultimate"
              : "basic"),
          duration: pkg.duration || "month", // Frontend display only
        }));

        // Filter out deleted packages
        const activePackages = mappedPackages.filter(
          (pkg) => pkg.status !== "deleted"
        );
        console.log("Mapped packages:", mappedPackages); // Debug log
        console.log("Active packages (filtered):", activePackages); // Debug log
        return activePackages;
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
      // Transform data for backend - convert status to uppercase and remove frontend-only fields
      const backendData = {
        packageName: packageData.packageName,
        description: packageData.description,
        price: packageData.price,
        status: packageData.status?.toUpperCase() || "ACTIVE", // Convert to backend format
      };

      const result = await packagesApi.createPackage(backendData);
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
      // Transform data for backend - convert status to uppercase and remove frontend-only fields
      const backendData = {
        packageName: packageData.packageName,
        description: packageData.description,
        price: packageData.price,
        status: packageData.status?.toUpperCase() || "ACTIVE", // Convert to backend format
      };

      const result = await packagesApi.updatePackage(id, backendData);
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
      console.log("Delete package called with ID:", id, "Type:", typeof id); // Debug log
      const result = await packagesApi.deletePackage(id);
      console.log("Delete package API result:", result); // Debug log
      if (result.success) {
        console.log("Returning ID:", id, "Type:", typeof id); // Debug log
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

// Async thunk for buying a membership package
export const buyMembershipPackage = createAsyncThunk(
  "packages/buyMembership",
  async ({ packageId, memberId }, { rejectWithValue }) => {
    try {
      const result = await packagesApi.buyMembershipPackage(
        packageId,
        memberId
      );
      if (result.success) {
        return {
          packageId,
          memberId,
          purchaseData: result.data,
        };
      } else {
        return rejectWithValue(result.message || "Failed to purchase package");
      }
    } catch (error) {
      return rejectWithValue(error.message || "Failed to purchase package");
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
    purchaseLoading: false,
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
        console.log("Delete fulfilled - Package ID:", action.payload); // Debug log
        console.log("Packages before filter:", state.packages.length); // Debug log
        state.packages = state.packages.filter(
          (pkg) => pkg.id !== action.payload
        );
        console.log("Packages after filter:", state.packages.length); // Debug log
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
      }) // Buy membership package
      .addCase(buyMembershipPackage.pending, (state) => {
        state.purchaseLoading = true;
        state.error = null;
      })
      .addCase(buyMembershipPackage.fulfilled, (state) => {
        state.purchaseLoading = false;
        // Optionally, handle successful purchase (e.g., update state or show a message)
        state.error = null;
      })
      .addCase(buyMembershipPackage.rejected, (state, action) => {
        state.purchaseLoading = false;
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
