import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/redux/slices/authSlice";
import membersReducer from "@/redux/slices/membersSlice";
import coachesReducer from "@/redux/slices/coachesSlice";
import adminsReducer from "@/redux/slices/adminsSlice";
import packagesReducer from "@/redux/slices/packagesSlice";
import badgesReducer from "@/redux/slices/badgesSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    members: membersReducer,
    coaches: coachesReducer,
    admins: adminsReducer,
    packages: packagesReducer,
    badges: badgesReducer,
  },
});
export default store;
