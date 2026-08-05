import api from "./api";

const volunteerApi = api.injectEndpoints({
  endpoints: (build) => ({
    getVolunteerJobs: build.query({
      query: ({ page, limit, searchBy }) => ({
        url: "/volunteer/jobs",
        params: { page, limit, ...(searchBy ? { searchBy } : {}) },
      }),
      transformResponse: (response: any) => {
        return response.data;
      },
    }),
    getSingleVolunteerJob: build.query({
      query: (id) => `/volunteer/jobs/${id}`,
      transformResponse: (response: any) => response.data,
      providesTags: (_result, _error, id) => [{ type: "VOLUNTEER", id }],
    }),
    volunteerForJob: build.mutation({
      query: ({ id }) => ({ url: `/volunteer/jobs/${id}/register`, method: "POST" }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: (_result, _error, { id }) => [{ type: "VOLUNTEER", id }],
    }),
    getMyApplications: build.query({
      query: () => "/volunteer/my-applications",
      transformResponse: (response: any) => response.data,
      providesTags: ["VOLUNTEER"],
    }),
    withdrawApplication: build.mutation({
      query: (id) => ({ url: `/volunteer/jobs/${id}/register`, method: "DELETE" }),
      invalidatesTags: ["VOLUNTEER"],
    }),
    getShiftsForJob: build.query({
      query: ({ jobId }) => `/volunteer/jobs/${jobId}/shifts`,
      transformResponse: (response: any) => response.data,
      providesTags: (_result, _error, { jobId }) => [{ type: "VOLUNTEER", id: jobId }],
    }),
    signUpForShift: build.mutation({
      query: ({ shiftId }) => ({ url: `/volunteer/shifts/${shiftId}/signup`, method: "POST" }),
      invalidatesTags: ["VOLUNTEER"],
    }),
    withdrawFromShift: build.mutation({
      query: ({ shiftId }) => ({ url: `/volunteer/shifts/${shiftId}/signup`, method: "DELETE" }),
      invalidatesTags: ["VOLUNTEER"],
    }),
    getMyShifts: build.query({
      query: () => "/volunteer/my-shifts",
      transformResponse: (response: any) => response.data,
      providesTags: ["VOLUNTEER"],
    }),
  }),
});

export const {
  useGetVolunteerJobsQuery,
  useGetSingleVolunteerJobQuery,
  useVolunteerForJobMutation,
  useGetMyApplicationsQuery,
  useWithdrawApplicationMutation,
  useGetShiftsForJobQuery,
  useSignUpForShiftMutation,
  useWithdrawFromShiftMutation,
  useGetMyShiftsQuery,
} = volunteerApi;

export default volunteerApi;
