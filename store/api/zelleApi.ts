import api from "./api";
const zelleApi = api.injectEndpoints({
  endpoints: (build) => ({
    getZelleSettings: build.query<any, void>({
      query: () => "/zelle/settings",
      transformResponse: (r: any) => r.data,
    }),
    getMyZellePayments: build.query<any, number>({
      query: (page) => ({ url: "/zelle/intents", params: { page } }),
      transformResponse: (r: any) => r.data,
      providesTags: ["PAYMENT_INTENTS"],
    }),
    createZellePayment: build.mutation<any, any>({
      query: (body) => ({ url: "/zelle/intents", method: "POST", body }),
      transformResponse: (r: any) => r.data,
      invalidatesTags: ["PAYMENT_INTENTS"],
    }),
    uploadZelleProof: build.mutation<any, { id: string; body: FormData }>({
      query: ({ id, body }) => ({
        url: `/zelle/intents/${id}/proof`,
        method: "POST",
        body,
      }),
      transformResponse: (r: any) => r.data,
      invalidatesTags: ["PAYMENT_INTENTS", "SUBSCRIPTION"],
    }),
  }),
});
export const {
  useGetZelleSettingsQuery,
  useGetMyZellePaymentsQuery,
  useCreateZellePaymentMutation,
  useUploadZelleProofMutation,
} = zelleApi;
