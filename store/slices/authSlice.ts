import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  isAuthenticated: false,
  accessToken: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, { payload }) => {
      console.log("PA", payload);
      state.user = payload.user;
      state.isAuthenticated = !!payload.user;
      state.accessToken = payload.accessToken;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.accessToken = null;
    },
  },
});

export const { setUser, logout } = authSlice.actions;

export const selectAuth = (state: any) => state.auth;

export default authSlice.reducer;
