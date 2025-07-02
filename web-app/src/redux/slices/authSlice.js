import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { loginUser } from "@/features/auth/services/Login";
import { registerUser } from "@/features/auth/services/Register";
import { loginCoach } from "@/features/coaches/services/LoginCoach";
import { toast } from "react-toastify";

// Utility: safe JSON parse fallback
const safeParseArray = (key) => {
  try {
    const raw = localStorage.getItem(key);
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    const raw = localStorage.getItem(key);
    return raw ? raw.split(",").map(Number).filter((x) => !isNaN(x)) : [];
  }
};

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

export const coachLogin = createAsyncThunk("auth/loginCoach", async (coachData) => {
  const res = await loginCoach({
    email: coachData.email,
    password: coachData.password,
  });
  return res;
});

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
      throw new Error(`Failed to update profile: ${response.status} - ${errorText}`);
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
    planIds: safeParseArray("planIds"),
    smokingLogIds: safeParseArray("smokingLogIds"),
    successMessage: "",
    errorMessage: "",
    status: "idle",
  },
  reducers: {
    logout: (state) => {
      state.token = null;
      state.userId = null;
      state.planIds = [];
      state.smokingLogIds = [];
      state.successMessage = "";
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("userId");
      localStorage.removeItem("planIds");
      localStorage.removeItem("smokingLogIds");
      localStorage.removeItem("latestPlanId");
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
        state.planIds = action.payload.planIds || [];
        state.smokingLogIds = action.payload.smokingLogIds || [];

        toast.success("Login successful!");
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("userId", state.userId);

        if (state.planIds.length > 0) {
          const latestPlanId = state.planIds[state.planIds.length - 1];
          localStorage.setItem("latestPlanId", latestPlanId);
        }

        localStorage.setItem("planIds", JSON.stringify(state.planIds));
        localStorage.setItem("smokingLogIds", JSON.stringify(state.smokingLogIds));
      })
      .addCase(login.rejected, (state) => {
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
        state.planIds = action.payload.planIds || [];
        state.smokingLogIds = action.payload.smokingLogIds || [];

        toast.success("Sign up successful!");
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("userId", state.userId);

        if (state.planIds.length > 0) {
          const latestPlanId = state.planIds[state.planIds.length - 1];
          localStorage.setItem("latestPlanId", latestPlanId);
        }

        localStorage.setItem("planIds", JSON.stringify(state.planIds));
        localStorage.setItem("smokingLogIds", JSON.stringify(state.smokingLogIds));
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
