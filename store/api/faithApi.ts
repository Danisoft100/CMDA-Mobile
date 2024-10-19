import api from "./api";

const faithApi = api.injectEndpoints({
  endpoints: (build) => ({
    getAllDevotionals: build.query({
      query: () => "/devotionals",
      transformResponse: (response: any) => response.data,
      providesTags: ["DEVOTIONALS"],
    }),
    getLatestDevotional: build.query({
      query: () => ({ url: `/devotionals/latest` }),
      transformResponse: (response: any) => response,
    }),
    createFaithEntry: build.mutation({
      query: (body) => ({
        url: "/faith-entry",
        method: "POST",
        body,
      }),
      invalidatesTags: ["FAITH"],
    }),
    getAllFaithEntries: build.query({
      query: ({ limit, page, category }) => ({
        url: "/faith-entry",
        params: { limit, page, ...(category ? { category } : {}) },
      }),
      transformResponse: (response: any) => response.data,
      providesTags: ["FAITH"],
    }),
  }),
});

export const {
  useGetAllDevotionalsQuery,
  useGetLatestDevotionalQuery,
  useGetAllFaithEntriesQuery,
  useCreateFaithEntryMutation,
} = faithApi;

export default faithApi;
