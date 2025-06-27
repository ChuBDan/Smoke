import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { loginUser } from "@/features/auth/services/Login";
import { registerUser } from "@/features/auth/services/Register";
import { loginCoach } from "@/features/coaches/services/LoginCoach";
import { loginAdmin } from "@/features/admin/services/adminLoginApi";

// Định nghĩa các action
export const login = createAsyncThunk("auth/login", async (userData) => {
  const res = await loginUser({
    email: userData.email,
    password: userData.password,
  });
  return res;
});

export const signup = createAsyncThunk("auth/signup", async (userData) => {
  const res = await registerUser(userData);
  return res;
});

export const coachLogin = createAsyncThunk(
  "auth/coachLogin",
  async (userData) => {
    const res = await loginCoach({
      email: userData.email,
      password: userData.password,
    });
    return res;
  }
);

export const adminLogin = createAsyncThunk(
  "auth/loginAdmin",
  async (adminData) => {
    const res = await loginAdmin({
      username: adminData.username,
      password: adminData.password,
    });
    return res;
  }
);

export const updateUserProfile = createAsyncThunk(
  "auth/updateUserProfile",
  async (userData, { getState }) => {
    const { auth } = getState();
    const token = auth.token;
    const userId = auth.userId;

    const response = await fetch(
      `https://deploy-smk.onrender.com/api/user/update-member-by-id/${userId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to update profile: ${response.status} - ${errorText}`
      );
    }

    const data = await response.json();
    return data.member;
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: localStorage.getItem("token") || null,
    userId: localStorage.getItem("userId") || null,
    successMessage: "",
    errorMessage: "",
    status: "idle",
  },
  reducers: {
    logout: (state) => {
      state.token = null;
      state.userId = null;
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("role");
    },
    clearMessages: (state) => {
      state.successMessage = "";
      state.errorMessage = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.token = action.payload.token;
        state.userId = action.payload.member?.id || action.payload.id;
        state.successMessage = "Login successful!";
        localStorage.setItem("role", "MEMBER");
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("userId", state.userId);
      })
      .addCase(login.rejected, (state) => {
        state.status = "failed";
        state.successMessage = "";
        state.errorMessage = "Email or password is incorrect";
      })
      .addCase(signup.pending, (state) => {
        state.status = "loading";
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.successMessage = "Sign up successful!";
      })
      .addCase(signup.rejected, (state, action) => {
        state.status = "failed";
        state.successMessage = "";
        state.errorMessage = action.error?.message || "Sign up failed";
      })
      .addCase(coachLogin.pending, (state) => {
        state.status = "loading";
      })
      .addCase(coachLogin.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.token = action.payload.token;
        state.userId = action.payload.member?.id || action.payload.id;
        state.successMessage = "Login successful!";
        localStorage.setItem("role", "COACH");
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("userId", state.userId);
      })
      .addCase(coachLogin.rejected, (state) => {
        state.status = "failed";
        state.successMessage = "";
        state.errorMessage = "Email or password is incorrect";
      })
      .addCase(adminLogin.pending, (state) => {
        state.status = "loading";
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.token = action.payload.token;
        localStorage.setItem("role", "ADMIN");
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(adminLogin.rejected, (state) => {
        state.status = "failed";
        state.successMessage = "";
        state.errorMessage = "Email or password is incorrect";
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.userId = action.payload.id;
        state.successMessage = "Profile updated successfully!";
      });
  },
});

export const { logout, clearMessages } = authSlice.actions;
export default authSlice.reducer;
