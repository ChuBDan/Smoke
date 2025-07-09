import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async: fetch badges by user
export const fetchUserBadges = createAsyncThunk(
  "userBadges/fetch",
  async ({ userId, token }, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        `https://deploy-smk.onrender.com/api/user/get-badge-by-member/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return res.data.badges || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const userBadgeSlice = createSlice({
  name: "userBadges",
  initialState: {
    badges: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearUserBadges: (state) => {
      state.badges = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserBadges.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserBadges.fulfilled, (state, action) => {
        state.loading = false;
        state.badges = action.payload;
      })
      .addCase(fetchUserBadges.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.badges = [];
      });
  },
});

export const { clearUserBadges } = userBadgeSlice.actions;
export default userBadgeSlice.reducer;
