import api from "./api";

const productsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getAllProducts: build.query({
      query: ({ page, limit, searchBy }) => ({
        url: "/products",
        params: { page, limit, ...(searchBy ? { searchBy } : {}) },
      }),
      transformResponse: (response: any) => response.data,
    }),
    getSingleProduct: build.query({
      query: (slug) => ({ url: `/products/${slug}` }),
      transformResponse: (response: any) => response.data,
    }),
    payOrderSession: build.mutation({
      query: (body) => ({ url: "/orders/pay", body, method: "POST" }),
      transformResponse: (response: any) => response.data,
    }),
    createOrder: build.mutation({
      query: (body) => ({ url: "/orders/create", body, method: "POST" }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: ["ORDERS"],
    }),
    getOrderHistory: build.query({
      query: ({ page, limit, searchBy }) => ({
        url: "/orders/history",
        params: { page, limit, ...(searchBy ? { searchBy } : {}) },
      }),
      transformResponse: (response: any) => response.data,
      providesTags: ["ORDERS"],
    }),
    getSingleOrder: build.query({
      query: (id) => ({ url: `/orders/${id}` }),
      transformResponse: (response: any) => response.data,
    }),
  }),
});

export const {
  useGetAllProductsQuery,
  useGetSingleProductQuery,
  usePayOrderSessionMutation,
  useCreateOrderMutation,
  useGetOrderHistoryQuery,
  useGetSingleOrderQuery,
} = productsApi;

export default productsApi;
