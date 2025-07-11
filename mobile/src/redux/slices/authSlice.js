import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "../../services/authService";
import * as SecureStore from "expo-secure-store";

// Initial state
const initialState = {
  token: null,
  userId: null,
  user: null,
  role: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  successMessage: null,
};

// Async thunks
export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await authService.login({ email, password });

      // Store in secure storage
      await SecureStore.setItemAsync("token", response.token);
      await SecureStore.setItemAsync(
        "userId",
        response.member?.id?.toString() || response.id?.toString()
      );
      await SecureStore.setItemAsync("role", "MEMBER");

      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const loginCoach = createAsyncThunk(
  "auth/loginCoach",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await authService.loginCoach({ email, password });

      // Store in secure storage
      await SecureStore.setItemAsync("token", response.token);
      await SecureStore.setItemAsync(
        "userId",
        response.member?.id?.toString() || response.id?.toString()
      );
      await SecureStore.setItemAsync("role", "COACH");

      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const loadUserFromStorage = createAsyncThunk(
  "auth/loadFromStorage",
  async (_, { rejectWithValue }) => {
    try {
      const token = await SecureStore.getItemAsync("token");
      const userId = await SecureStore.getItemAsync("userId");
      const role = await SecureStore.getItemAsync("role");

      if (token && userId) {
        return { token, userId, role };
      }

      return null;
    } catch (error) {
      return rejectWithValue("Failed to load user data");
    }
  }
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await SecureStore.deleteItemAsync("token");
      await SecureStore.deleteItemAsync("userId");
      await SecureStore.deleteItemAsync("role");
      return null;
    } catch (error) {
      return rejectWithValue("Logout failed");
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.successMessage = null;
    },
    clearMessages: (state) => {
      // Only clear messages, don't touch other state
      state.error = null;
      state.successMessage = null;
    },
    resetAuthState: (state) => {
      // Full reset for debugging
      return { ...initialState };
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.userId = action.payload.member?.id || action.payload.id;
        state.user = action.payload.member || action.payload.user;
        state.role = "MEMBER";
        state.successMessage = "Login successful!";
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.successMessage = "Registration successful! Please login.";
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Coach Login
      .addCase(loginCoach.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginCoach.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.userId = action.payload.member?.id || action.payload.id;
        state.user = action.payload.member || action.payload.user;
        state.role = "COACH";
        state.successMessage = "Coach login successful!";
      })
      .addCase(loginCoach.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Load from storage
      .addCase(loadUserFromStorage.fulfilled, (state, action) => {
        if (action.payload) {
          state.token = action.payload.token;
          state.userId = action.payload.userId;
          state.role = action.payload.role;
          state.isAuthenticated = true;
        }
      })

      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.token = null;
        state.userId = null;
        state.user = null;
        state.role = null;
        state.isAuthenticated = false;
        state.successMessage = "Logged out successfully";
      });
  },
});

export const { clearError, clearSuccess, clearMessages, resetAuthState } =
  authSlice.actions;
export default authSlice.reducer;
