import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/redux/slices/authSlice";
import membersReducer from "@/redux/slices/membersSlice";
import packagesReducer from "@/redux/slices/packagesSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    members: membersReducer,
    packages: packagesReducer,
  },
});
export default store;
