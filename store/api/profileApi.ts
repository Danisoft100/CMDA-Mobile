import api from "./api";

const profileApi = api.injectEndpoints({
  endpoints: (build) => ({
    getProfile: build.query({
      query: () => ({ url: `/auth/me` }),
      transformResponse: (response: any) => response.data,
      providesTags: ["PROFILE"],
    }),
    // edit profile
    editProfile: build.mutation({
      query: (payload) => ({ url: `/auth/me`, method: "PATCH", body: payload }),
      transformErrorResponse: (response: any) => response.data?.message,
      invalidatesTags: ["PROFILE"],
    }),
    // update password
    updatePassword: build.mutation({
      query: (payload) => ({ url: `/auth/change-password`, method: "POST", body: payload }),
      transformErrorResponse: (response: any) => response.data?.message,
    }),
    getTransition: build.query({
      query: () => ({ url: `/users/transition` }),
      transformResponse: (response: any) => response?.data,
      providesTags: ["TRANSIT"],
    }),
    initiateTransition: build.mutation({
      query: (body) => ({ url: `/users/transition`, method: "POST", body }),
      transformErrorResponse: (response: any) => response.data?.message,
      invalidatesTags: ["TRANSIT"],
    }),
    // GET SETTINGS
    getSettings: build.query({
      query: () => ({ url: "/users/settings" }),
      transformResponse: (response: any) => response.data,
      providesTags: ["USER_SETTINGS"],
    }),
    // UPDATE SETTINGS
    updateSettings: build.mutation({
      query: (body) => ({ url: "/users/settings", method: "PATCH", body }),
      invalidatesTags: ["USER_SETTINGS"],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useEditProfileMutation,
  useUpdatePasswordMutation,
  useGetTransitionQuery,
  useInitiateTransitionMutation,
  useGetSettingsQuery,
  useUpdateSettingsMutation,
} = profileApi;

export default profileApi;
