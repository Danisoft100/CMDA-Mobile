import api from "./api";

const chaptersApi = api.injectEndpoints({
  endpoints: (build) => ({
    getAllChapters: build.query({
      query: ({ type }: { type?: string } = {}) => ({
        url: "/chapters",
        params: type ? { type } : {},
      }),
      transformResponse: (response: any) => {
        const payload = response?.data || response;
        return Array.isArray(payload) ? payload : payload?.items || [];
      },
      providesTags: ["CHAPTERS"],
    }),
  }),
});

export const { useGetAllChaptersQuery } = chaptersApi;
export default chaptersApi;
