import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { loginUser } from "@/features/auth/services/Login";
import { registerUser } from "@/features/auth/services/Register";
import { loginCoach } from "@/features/coaches/services/LoginCoach";
import { toast } from "react-toastify";

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
  "auth/loginCoach",
  async (coachData) => {
    const res = await loginCoach({
      email: coachData.email,
      password: coachData.password,
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
      state.successMessage = "";
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("userId");
    },
    clearMessages: (state) => {
      state.successMessage = "";
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
        toast.success("Login successful!");
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("userId", state.userId);
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.successMessage = "";
        toast.error("Login failed. Please check your email and password.");
      })
      .addCase(signup.pending, (state) => {
        state.status = "loading";
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.token = action.payload.token;
        state.userId = action.payload.member?.id || action.payload.id;
        toast.success("Sign up successful!");
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("userId", state.userId);
      })
      .addCase(signup.rejected, (state) => {
        state.status = "failed";
        state.successMessage = "";
        toast.error("Sign up failed. Please try again.");
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
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.userId = action.payload.id;
        state.successMessage = "Profile updated successfully!";
      });
  },
});

export const { logout, clearMessages } = authSlice.actions;
export default authSlice.reducer;
