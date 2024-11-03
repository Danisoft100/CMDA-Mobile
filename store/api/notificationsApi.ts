import api from "./api";

const notificationsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getAllNotifications: build.query({
      query: () => ({ url: "/notifications" }),
      transformResponse: (response: any) => response.data,
      providesTags: ["ALL_NOTIFICATIONS"],
    }),
    getNotificationStats: build.query({
      query: () => ({ url: "/notifications/stats" }),
      transformResponse: (response: any) => response.data,
      providesTags: ["NOTIFICATIONS_STATS"],
    }),
    markAsRead: build.mutation({
      query: (id) => ({ url: `/notifications/${id}/read`, method: "PATCH" }),
      invalidatesTags: ["ALL_NOTIFICATIONS", "NOTIFICATIONS_STATS"],
    }),
  }),
});

export const { useGetAllNotificationsQuery, useMarkAsReadMutation, useGetNotificationStatsQuery } = notificationsApi;

export default notificationsApi;
