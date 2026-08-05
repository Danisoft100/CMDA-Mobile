import api from "./api";

const notificationsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getAllNotifications: build.query({
      query: ({ page, limit }) => ({ url: "/notifications", params: { page, limit } }),
      transformResponse: (response: any) => response.data,
      providesTags: ["ALL_NOTIFICATIONS"],
    }),
    getUnreadCount: build.query({
      query: () => ({ url: "/notifications/unread-count" }),
      transformResponse: (response: any) => response.data?.count ?? 0,
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
    markAllAsRead: build.mutation({
      query: () => ({ url: "/notifications/mark-all-read", method: "PATCH" }),
      invalidatesTags: ["ALL_NOTIFICATIONS", "NOTIFICATIONS_STATS"],
    }),
    deleteNotification: build.mutation({
      query: (id) => ({ url: `/notifications/${id}`, method: "DELETE" }),
      invalidatesTags: ["ALL_NOTIFICATIONS", "NOTIFICATIONS_STATS"],
    }),
  }),
});

export const {
  useGetAllNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
  useGetNotificationStatsQuery,
} = notificationsApi;

export default notificationsApi;
