import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/redux/slices/authSlice";
import membersReducer from "@/redux/slices/membersSlice";
import packagesReducer from "@/redux/slices/packagesSlice";
import badgesReducer from "@/redux/slices/badgesSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    members: membersReducer,
    packages: packagesReducer,
    badges: badgesReducer,
  },
});
export default store;
