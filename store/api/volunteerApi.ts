import api from "./api";

const toList = (value: unknown) => {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return [];
  return value.split(/\r?\n|;|\u2022/).map((item) => item.trim()).filter(Boolean);
};

const normalizeJob = (job: any) => ({
  ...job,
  companyName: job?.companyName ?? job?.company,
  companyLocation: job?.companyLocation ?? job?.location,
  responsibilities: toList(job?.responsibilities),
  requirements: toList(job?.requirements),
});

const normalizeShift = (shift: any) => ({
  ...shift,
  startDate: shift?.startDate ?? shift?.startTime,
  endDate: shift?.endDate ?? shift?.endTime,
  currentVolunteers: shift?.currentVolunteers ?? shift?.volunteers?.length ?? 0,
  status: shift?.myStatus ?? shift?.status,
});

const normalizePage = (response: any, mapper: (item: any) => any) => {
  const data = response?.data ?? response;
  return {
    ...(data || {}),
    items: (Array.isArray(data?.items) ? data.items : []).map(mapper),
  };
};

const volunteerApi = api.injectEndpoints({
  endpoints: (build) => ({
    getVolunteerJobs: build.query({
      query: ({ page, limit, searchBy, category }) => ({
        url: "/volunteer/jobs",
        params: { page, limit, ...(searchBy ? { search: searchBy } : {}), ...(category ? { category } : {}) },
      }),
      transformResponse: (response: any) => normalizePage(response, normalizeJob),
    }),
    getSingleVolunteerJob: build.query({
      query: (id) => `/volunteer/jobs/${id}`,
      transformResponse: (response: any) => normalizeJob(response?.data ?? response),
      providesTags: (_result, _error, id) => [{ type: "VOLUNTEER", id }],
    }),
    volunteerForJob: build.mutation({
      query: ({ id }) => ({ url: `/volunteer/jobs/${id}/register`, method: "POST" }),
      transformResponse: (response: any) => normalizeJob(response?.data ?? response),
      invalidatesTags: (_result, _error, { id }) => [{ type: "VOLUNTEER", id }],
    }),
    getMyApplications: build.query({
      query: () => "/volunteer/my-applications",
      transformResponse: (response: any) => normalizePage(response, (job) => ({
        ...normalizeJob(job),
        status: job?.application?.status,
        appliedAt: job?.application?.appliedAt,
      })),
      providesTags: ["VOLUNTEER"],
    }),
    withdrawApplication: build.mutation({
      query: (id) => ({ url: `/volunteer/jobs/${id}/register`, method: "DELETE" }),
      invalidatesTags: ["VOLUNTEER"],
    }),
    getShiftsForJob: build.query({
      query: ({ jobId }) => `/volunteer/jobs/${jobId}/shifts`,
      transformResponse: (response: any) => normalizePage(response, normalizeShift),
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
      transformResponse: (response: any) => normalizePage(response, (shift) => ({
        ...normalizeShift(shift),
        job: shift?.job ? normalizeJob(shift.job) : shift?.job,
      })),
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
