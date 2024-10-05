import api from "./api";

const volunteerApi = api.injectEndpoints({
  endpoints: (build) => ({
    getVolunteerJobs: build.query({
      query: ({ page, limit, searchBy }) => ({
        url: "/volunteer/jobs",
        params: { page, limit, ...(searchBy ? { searchBy } : {}) },
      }),
      transformResponse: (response: any) => response.data,
    }),
    getSingleVolunteerJob: build.query({
      query: (id) => `/volunteer/jobs/${id}`,
      transformResponse: (response: any) => response.data,
    }),
  }),
});

export const { useGetVolunteerJobsQuery, useGetSingleVolunteerJobQuery } = volunteerApi;

export default volunteerApi;
