import { api } from "./api";

export const subscriptionStatusApi = api.injectEndpoints({
  endpoints: (build) => ({
    getSubscriptionStatus: build.query({
      query: () => "/subscriptions/status",
      providesTags: ["SUBSCRIPTION_STATUS"],
    }),
    cancelSubscription: build.mutation({
      query: () => ({ url: "/subscriptions/cancel", method: "POST" }),
      invalidatesTags: ["SUBSCRIPTION_STATUS"],
    }),
    renewSubscription: build.mutation({
      query: () => ({ url: "/subscriptions/renew", method: "POST" }),
      invalidatesTags: ["SUBSCRIPTION_STATUS"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSubscriptionStatusQuery,
  useCancelSubscriptionMutation,
  useRenewSubscriptionMutation,
} = subscriptionStatusApi;
