import api from "./api";

const authApi = api.injectEndpoints({
  endpoints: (build) => ({
    // LOGIN
    login: build.mutation({
      query: (body) => ({ url: "/account/login", method: "POST", body }),
    }),
    // Sign Up
    signUp: build.mutation({
      query: (body) => ({ url: "/account/register", method: "POST", body }),
    }),
    // VERIFY USER
    verifyUser: build.mutation({
      query: (body) => ({ url: "/account/confirm", method: "POST", body }),
    }),
    // RESEND CODE
    resendVerifyCode: build.mutation({
      query: (userId) => ({ url: `/account/resendconfirmationcode/${userId}`, method: "POST" }),
    }),
    // SET PIN
    setPin: build.mutation({
      query: (body) => ({ url: "/account/completeauthentication", method: "POST", body }),
    }),
    // FORGOT PASSWORD
    passwordForgot: build.mutation({
      query: (userName) => ({ url: `/account/forgetpassword/${userName}`, method: "POST" }),
    }),
    // RESET PASSWORD
    passwordReset: build.mutation({
      query: (body) => ({ url: "/account/resetpassword", method: "POST", body }),
    }),
    // GET PROFILE
    getProfile: build.query({
      query: () => ({ url: "/profile" }),
      transformResponse: (response: any) => response.data,
      providesTags: ["AUTH_USER"],
    }),
    // UPDATE PROFILE
    updateProfile: build.mutation({
      query: (body) => ({ url: "/profile/update", method: "POST", body }),
      invalidatesTags: ["AUTH_USER"],
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
  useUpdateProfileMutation,
  useGetProfileQuery,
  useSetPinMutation,
} = authApi;

export default authApi;
