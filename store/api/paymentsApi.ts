import api from "./api";

const paymentsApi = api.injectEndpoints({
  endpoints: (build) => ({
    // Payment Intents endpoints
    getMyPaymentIntents: build.query({
      query: ({ page, limit, searchBy }) => ({
        url: "/payment-intents/me",
        params: { page, limit, ...(searchBy ? { searchBy } : {}) },
      }),
      transformResponse: (response: any) => response.data,
      providesTags: ["PAYMENT_INTENTS"],
    }),
    requeryPaymentIntents: build.mutation({
      query: (body) => ({ url: "/payment-intents/requery", body, method: "POST" }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: ["PAYMENT_INTENTS", "DONATIONS", "SUBSCRIPTION", "ORDERS", "EVENTS"],
    }),
    lookupPaymentIntentsByEmail: build.mutation({
      query: (body) => ({ url: "/payment-intents/lookup-email", body, method: "POST" }),
      transformResponse: (response: any) => response.data,
    }),
    initDonationSession: build.mutation({
      query: (body) => ({ url: "/donations/init", body, method: "POST" }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: ["DONATIONS"],
    }),
    saveDonation: build.mutation({
      query: (body) => ({ url: "/donations/create", body, method: "POST" }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: ["DONATIONS"],
    }),
    getAllDonations: build.query({
      query: ({ page, limit, searchBy }) => ({
        url: "/donations/user",
        params: { page, limit, ...(searchBy ? { searchBy } : {}) },
      }),
      transformResponse: (response: any) => response.data,
      providesTags: ["DONATIONS"],
    }),
    exportDonations: build.mutation({
      queryFn: async ({ callback, userId }, api, extraOptions, baseQuery) => {
        const result = await baseQuery({
          url: `/donations/export?userId=${userId}`,
          method: "GET",
          responseHandler: (response: Response) => response.blob(),
          cache: "no-cache",
        });
        callback(result);
        return { data: null };
      },
    }),
    initSubscriptionSession: build.mutation({
      query: (body) => ({ url: "/subscriptions/pay", body, method: "POST" }),
      transformResponse: (response: any) => response.data,
    }),
    saveSubscription: build.mutation({
      query: (body) => ({ url: "/subscriptions/save", body, method: "POST" }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: ["SUBSCRIPTION"],
    }),
    getAllSubscriptions: build.query({
      query: ({ page, limit, searchBy }) => ({
        url: "/subscriptions/history",
        params: { page, limit, ...(searchBy ? { searchBy } : {}) },
      }),
      transformResponse: (response: any) => response.data,
      providesTags: ["SUBSCRIPTION"],
    }),
    getSubscriptionStatus: build.query({
      query: () => "/subscriptions/status",
      transformResponse: (response: any) => response?.data ?? response,
      providesTags: ["SUBSCRIPTION"],
    }),
    cancelSubscription: build.mutation({
      query: () => ({ url: "/subscriptions/cancel", method: "POST" }),
      transformResponse: (response: any) => response?.data ?? response,
      invalidatesTags: ["SUBSCRIPTION", "PROFILE"],
    }),
    renewSubscription: build.mutation({
      query: () => ({ url: "/subscriptions/renew", method: "POST" }),
      transformResponse: (response: any) => response?.data ?? response,
      invalidatesTags: ["SUBSCRIPTION", "PROFILE"],
    }),
    exportSubscriptions: build.mutation({
      queryFn: async ({ callback, userId }, api, extraOptions, baseQuery) => {
        const result = await baseQuery({
          url: `/subscriptions/export?userId=${userId}`,
          method: "GET",
          responseHandler: (response: Response) => response.blob(),
          cache: "no-cache",
        });
        callback(result);
        return { data: null };
      },
    }),    getPaypalOrderDetails: build.mutation({
      query: (orderId) => ({ url: `/paypal/order/${orderId}`, method: "GET" }),
      // transformResponse: (response: any) => response.data,
    }),
    syncOrderPaymentStatus: build.mutation({
      query: (body) => ({ url: "/orders/sync-payment-status", body, method: "POST" }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: ["ORDERS"],
    }),
    syncDonationPaymentStatus: build.mutation({
      query: (body) => ({ url: "/donations/sync-payment-status", body, method: "POST" }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: ["DONATIONS"],
    }),
    syncSubscriptionPaymentStatus: build.mutation({
      query: (body) => ({ url: "/subscriptions/sync-payment-status", body, method: "POST" }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: ["SUBSCRIPTION"],
    }),
    syncEventPaymentStatus: build.mutation({
      query: (body) => ({ url: "/events/sync-payment-status", body, method: "POST" }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: ["EVENTS"],
    }),
  }),
});

export const {
  useGetMyPaymentIntentsQuery,
  useRequeryPaymentIntentsMutation,
  useLookupPaymentIntentsByEmailMutation,
  useInitDonationSessionMutation,
  useSaveDonationMutation,
  useGetAllDonationsQuery,
  useExportDonationsMutation,
  useInitSubscriptionSessionMutation,
  useSaveSubscriptionMutation,
  useGetAllSubscriptionsQuery,
  useGetSubscriptionStatusQuery,
  useCancelSubscriptionMutation,
  useRenewSubscriptionMutation,
  useExportSubscriptionsMutation,
  useGetPaypalOrderDetailsMutation,
  useSyncOrderPaymentStatusMutation,
  useSyncDonationPaymentStatusMutation,
  useSyncSubscriptionPaymentStatusMutation,
  useSyncEventPaymentStatusMutation,
} = paymentsApi;

export default paymentsApi;
