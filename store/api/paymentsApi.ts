import api from "./api";

const paymentsApi = api.injectEndpoints({
  endpoints: (build) => ({
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
        cache: "no-cache",
      }),
      transformResponse: (response: any) => response.data,
      providesTags: ["DONATIONS"],
    }),
    exportDonations: build.mutation({
      queryFn: async ({ callback, userId }, api, extraOptions, baseQuery) => {
        const result = await baseQuery({
          url: `/donations/export?userId=${userId}`,
          method: "GET",
          responseHandler: (response) => response.blob(),
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
    exportSubscriptions: build.mutation({
      queryFn: async ({ callback, userId }, api, extraOptions, baseQuery) => {
        const result = await baseQuery({
          url: `/subscriptions/export?userId=${userId}`,
          method: "GET",
          responseHandler: (response) => response.blob(),
          cache: "no-cache",
        });
        callback(result);
        return { data: null };
      },
    }),
    getPaypalOrderDetails: build.mutation({
      query: (orderId) => ({ url: `/paypal/order/${orderId}`, method: "GET" }),
      // transformResponse: (response: any) => response.data,
    }),
  }),
});

export const {
  useInitDonationSessionMutation,
  useSaveDonationMutation,
  useGetAllDonationsQuery,
  useExportDonationsMutation,
  useInitSubscriptionSessionMutation,
  useSaveSubscriptionMutation,
  useGetAllSubscriptionsQuery,
  useExportSubscriptionsMutation,
  useGetPaypalOrderDetailsMutation,
} = paymentsApi;

export default paymentsApi;
