import api from "./api";

const authApi = api.injectEndpoints({
  endpoints: (build) => ({
    // LOGIN
    login: build.mutation({
      query: (payload) => ({ url: "/auth/login", method: "POST", body: payload }),
    }),
    // Sign Up
    signUp: build.mutation({
      query: (payload) => ({ url: "/auth/signup", method: "POST", body: payload }),
    }),
    // FORGOT PASSWORD
    passwordForgot: build.mutation({
      query: (body) => ({ url: "/auth/forgot-password", method: "POST", body }),
    }),
    // RESET PASSWORD
    passwordReset: build.mutation({
      query: (body) => ({ url: "/auth/reset-password", method: "POST", body }),
    }),
  }),
});

export const { useLoginMutation, useSignUpMutation, usePasswordForgotMutation, usePasswordResetMutation } = authApi;

export default authApi;
