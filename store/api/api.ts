import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState }: any) => {
      const token = getState().auth.accessToken;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  refetchOnMountOrArgChange: true,
  tagTypes: [
    "AUTH_USER",
    "USER_SETTINGS",
    "TRANSIT",
    "DEVOTIONALS",
    "EVENTS",
    "USER_EVENTS",
    "SINGLE_EVT",
    "TRAININGS",
    "FAITH",
  ],
  endpoints: () => ({}),
});

export default api;
