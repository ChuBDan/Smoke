import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { loginUser } from "@/features/auth/services/Login";
import { registerUser } from "@/features/auth/services/Register";
import { loginCoach } from "@/features/coaches/services/LoginCoach";
import { loginAdmin } from "@/features/admin/services/adminLoginApi";

// Utility: parse from localStorage safely
const safeParseArray = (key) => {
  try {
    const raw = localStorage.getItem(key);
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    const raw = localStorage.getItem(key);
    return raw
      ? raw
          .split(",")
          .map(Number)
          .filter((n) => !isNaN(n))
      : [];
  }
};

// Initial state
const initialState = {
  token: localStorage.getItem("token") || null,
  userId: localStorage.getItem("userId") || null,
  coachId: localStorage.getItem("coachId") || null,
  planIds: safeParseArray("planIds"),
  smokingLogIds: safeParseArray("smokingLogIds"),
  memberPackage: localStorage.getItem("memberPackage")
    ? JSON.parse(localStorage.getItem("memberPackage"))
    : null,
  status: "idle",
  successMessage: "",
  errorMessage: "",
};

// Async Thunks
export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }) => {
    const res = await loginUser({ email, password });
    return res;
  }
);

export const signup = createAsyncThunk("auth/signup", async (data) => {
  return await registerUser(data);
});

export const coachLogin = createAsyncThunk(
  "auth/coachLogin",
  async ({ email, password }) => {
    return await loginCoach({ email, password });
  }
);

export const adminLogin = createAsyncThunk(
  "auth/adminLogin",
  async ({ username, password }) => {
    return await loginAdmin({ username, password });
  }
);

export const updateUserProfile = createAsyncThunk(
  "auth/updateUserProfile",
  async (userData, { getState }) => {
    const { token, userId } = getState().auth;

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
      const text = await response.text();
      throw new Error(`Failed to update profile: ${response.status} - ${text}`);
    }

    const data = await response.json();
    return data.member;
  }
);

// Slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      Object.assign(state, {
        token: null,
        userId: null,
        planIds: [],
        smokingLogIds: [],
        memberPackage: null,
        successMessage: "",
        coachId: null,
        planId: [],
      });

      [
        "token",
        "coachId",
        "userId",
        "role",
        "planIds",
        "planId",
        "smokingLogIds",
        "latestPlanId",
        "memberPackage",
      ].forEach((key) => localStorage.removeItem(key));
    },

    clearMessages: (state) => {
      state.successMessage = "";
      state.errorMessage = "";
    },

    updateMemberPackage: (state, action) => {
      state.memberPackage = action.payload;
      localStorage.setItem("memberPackage", JSON.stringify(action.payload));
    },
  },

  extraReducers: (builder) => {
    builder

      // MEMBER LOGIN
      .addCase(login.pending, (state) => {
        state.status = "loading";
      })
      .addCase(login.fulfilled, (state, { payload }) => {
        const member = payload.member;

        state.status = "succeeded";
        state.token = payload.token;
        state.userId = member?.id || payload.id;
        state.planIds = payload.planIds || [];
        state.smokingLogIds = payload.smokingLogIds || [];
        state.memberPackage = member?.membership_Package || null;
        state.successMessage = "Login successful!";

        localStorage.setItem("role", "MEMBER");
        localStorage.setItem("token", payload.token);
        localStorage.setItem("userId", state.userId);
        localStorage.setItem("planIds", JSON.stringify(state.planIds));
        localStorage.setItem(
          "smokingLogIds",
          JSON.stringify(state.smokingLogIds)
        );
        localStorage.setItem(
          "memberPackage",
          JSON.stringify(state.memberPackage)
        );

        if (state.planIds.length > 0) {
          const latest = state.planIds.at(-1);
          localStorage.setItem("latestPlanId", latest);
        }
      })
      .addCase(login.rejected, (state) => {
        state.status = "failed";
        state.errorMessage = "Email or password is incorrect";
      })

      // SIGNUP
      .addCase(signup.pending, (state) => {
        state.status = "loading";
      })
      .addCase(signup.fulfilled, (state) => {
        state.status = "succeeded";
        state.successMessage = "Sign up successful!";
      })
      .addCase(signup.rejected, (state, { error }) => {
        state.status = "failed";
        state.errorMessage = error?.message || "Sign up failed";
      })

      // COACH LOGIN
      .addCase(coachLogin.pending, (state) => {
        state.status = "loading";
      })
      .addCase(coachLogin.fulfilled, (state, { payload }) => {
        state.status = "succeeded";
        state.token = payload.token;
        state.coachId = payload.coach?.id || payload.id;
        state.successMessage = "Coach login successful!";

        localStorage.setItem("role", "COACH");
        localStorage.setItem("token", payload.token);
        localStorage.setItem("coachId", state.coachId);
      })
      .addCase(coachLogin.rejected, (state) => {
        state.status = "failed";
        state.errorMessage = "Email or password is incorrect";
      })

      // ADMIN LOGIN
      .addCase(adminLogin.pending, (state) => {
        state.status = "loading";
      })
      .addCase(adminLogin.fulfilled, (state, { payload }) => {
        state.status = "succeeded";
        state.token = payload.token;

        localStorage.setItem("role", "ADMIN");
        localStorage.setItem("token", payload.token);
      })
      .addCase(adminLogin.rejected, (state) => {
        state.status = "failed";
        state.errorMessage = "Email or password is incorrect";
      })

      // UPDATE PROFILE
      .addCase(updateUserProfile.fulfilled, (state, { payload }) => {
        state.userId = payload.id;
        state.successMessage = "Profile updated successfully!";
      });
  },
});

export const { logout, clearMessages, updateMemberPackage } = authSlice.actions;
export default authSlice.reducer;
