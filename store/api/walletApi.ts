import api from "./api";

const walletApi = api.injectEndpoints({
  endpoints: (build) => ({
    getWalletBalance: build.query({
      query: () => ({ url: "/wallet" }),
      transformResponse: (response: any) => response.data,
      providesTags: ["WALLET_BAL"],
    }),
  }),
});

export const { useGetWalletBalanceQuery } = walletApi;

export default walletApi;
