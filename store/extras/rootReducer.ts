import { combineReducers } from "@reduxjs/toolkit";
import authSlice from "../slices/authSlice";
import cartSlice from "../slices/cartSlice";
import api from "../api/api";

const rootReducer = combineReducers({
  auth: authSlice,
  carts: cartSlice,
  [api.reducerPath]: api.reducer,
});

export default rootReducer;
