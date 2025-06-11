import { loginUser } from "@/features/auth/services/Login";
import { registerUser } from "@/features/auth/services/Register";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { loginCoach } from "@/features/coaches/services/LoginCoach";
import { loginAdmin } from "@/features/admin/services/adminLoginApi";
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

export const adminLogin = createAsyncThunk(
  "auth/loginAdmin",
  async (adminData) => {
    const res = await loginAdmin({
      email: adminData.email,
      password: adminData.password,
    });
    return res;
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: localStorage.getItem("token") || null,
  },
  reducers: {
    logout: (state) => {
      state.token = null;
      localStorage.removeItem("token");
      localStorage.removeItem("role");
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
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(login.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(signup.pending, (state) => {
        state.status = "loading";
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.token = action.payload.token;
      })
      .addCase(signup.rejected, (state) => {
        state.status = "failed";
      })      .addCase(coachLogin.pending, (state) => {
        state.status = "loading";
      })
      .addCase(coachLogin.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.token = action.payload.token;
        localStorage.setItem("role", "COACH");
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(coachLogin.rejected, (state) => {
        state.status = "failed";
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
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
