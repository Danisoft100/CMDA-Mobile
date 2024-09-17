import { combineReducers } from "@reduxjs/toolkit";
import authSlice from "../slices/authSlice";
import api from "../api/api";

const rootReducer = combineReducers({
  auth: authSlice,
  [api.reducerPath]: api.reducer,
});

export default rootReducer;
