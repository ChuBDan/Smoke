import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/redux/slices/authSlice';
import membersReducer from '@/redux/slices/membersSlice';

const store= configureStore({
  reducer:{
    auth : authReducer,
    members: membersReducer,
  }
})
export default store;