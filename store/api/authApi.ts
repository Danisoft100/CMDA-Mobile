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
    // VERIFY USER
    verifyUser: build.mutation({
      query: (body) => ({ url: "/auth/verify-email", method: "POST", body }),
    }),
    // RESEND VERIFY CODE
    resendVerifyCode: build.mutation({
      query: (body) => ({ url: "/auth/resend-verify-code", method: "POST", body }),
    }),
  }),
});

export const {
  useLoginMutation,
  useSignUpMutation,
  usePasswordForgotMutation,
  usePasswordResetMutation,
  useVerifyUserMutation,
  useResendVerifyCodeMutation,
} = authApi;

export default authApi;
