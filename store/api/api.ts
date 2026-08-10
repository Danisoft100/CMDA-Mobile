import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import TokenManager from "~/services/TokenManager";
import { handleSessionExpired } from "~/services/SessionExpiryService";

const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://cmdabackend-38258a63fa98.herokuapp.com';

const rawBaseQuery = fetchBaseQuery({
    baseUrl,
    prepareHeaders: async (headers, { getState }: any) => {
      const token = (await TokenManager.getToken()) || getState().auth.accessToken;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  });

const baseQueryWithRefresh = async (args: any, apiContext: any, extraOptions: any) => {
  let result = await rawBaseQuery(args, apiContext, extraOptions);
  const url = typeof args === "string" ? args : args?.url;
  const isPublicAuthRequest = typeof url === "string" && [
    "/auth/login",
    "/auth/signup",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/verify-email",
    "/auth/resend-verify-code",
    "/auth/check-user",
  ].some((path) => url.startsWith(path));

  if (result.error?.status === 401 && !isPublicAuthRequest) {
    const refreshedToken = await TokenManager.refreshToken();
    if (refreshedToken) {
      result = await rawBaseQuery(args, apiContext, extraOptions);
    } else {
      await handleSessionExpired(apiContext.dispatch);
    }
  }
  return result;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithRefresh,
  tagTypes: [
    "AUTH_USER",
    "USER_SETTINGS",
    "TRANSIT",
    "DEVOTIONALS",
    "EVENTS",
    "CONFERENCES",
    "USER_CONFERENCES",
    "USER_EVENTS",
    "SINGLE_EVT",
    "PAYMENT_PLANS",
    "TRAININGS",
    "FAITH",
    "DONATIONS",
    "SUBSCRIPTION",
    "ORDERS",
    "PROFILE",
    "ALL_NOTIFICATIONS",
    "NOTIFICATIONS_STATS",
    "PAYMENT_INTENTS",
    "VOLUNTEER",
    "CHAPTERS",
    "COMMENTS",
    "REACTIONS",
    "EVENT_FEEDBACK",
    "EVENT_ATTENDEES",
    "PERSONAL_EVENTS",
    "EVENT_REMINDERS",
  ],
  endpoints: () => ({}),
});

export default api;
