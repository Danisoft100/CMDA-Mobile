import api from "./api";

const eventsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getAllEvents: build.query({
      query: ({ limit, page, searchBy, eventDate, eventType, membersGroup, fromToday }) => ({
        url: "/events",
        params: {
          limit,
          page,
          ...(searchBy ? { searchBy } : {}),
          ...(eventDate ? { eventDate } : {}),
          ...(eventType ? { eventType } : {}),
          ...(membersGroup ? { membersGroup } : {}),
          ...(fromToday ? { fromToday } : {}),
        },
      }),
      transformResponse: (response: any) => {
        return response.data;
      },
      providesTags: ["EVENTS"],
    }),
    getSingleEvent: build.query({
      query: (slug) => `/events/${slug}`,
      transformResponse: (response: any) => response.data,
      providesTags: ["SINGLE_EVT"],
    }),
    getAllTrainings: build.query({
      query: ({ searchBy, membersGroup }) => ({
        url: "/trainings",
        params: { ...(searchBy ? { searchBy } : {}), ...(membersGroup ? { membersGroup } : {}) },
      }),
      transformResponse: (response: any) => response.data,
      providesTags: ["TRAININGS"],
    }),
    getRegisteredEvents: build.query({
      query: ({ limit, page, searchBy }) => ({
        url: "/events/registered",
        params: { limit, page, ...(searchBy ? { searchBy } : {}) },
      }),
      transformResponse: (response: any) => response.data,
      providesTags: ["USER_EVENTS"],
    }),
    registerForEvent: build.mutation({
      query: ({ slug }) => ({ url: `/events/register/${slug}`, method: "POST" }),
      invalidatesTags: ["USER_EVENTS", "SINGLE_EVT"],
    }),
    payForEvent: build.mutation({
      query: ({ slug }) => ({ url: `/events/pay/${slug}`, method: "POST" }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: ["USER_EVENTS", "SINGLE_EVT"],
    }),
    confirmEventPayment: build.mutation({
      query: (body) => ({ url: `/events/confirm-payment`, method: "POST", body }),
      invalidatesTags: ["USER_EVENTS", "SINGLE_EVT"],
    }),
  }),
});

export const {
  useGetAllEventsQuery,
  useGetSingleEventQuery,
  useGetAllTrainingsQuery,
  useRegisterForEventMutation,
  useGetRegisteredEventsQuery,
  useConfirmEventPaymentMutation,
  usePayForEventMutation,
} = eventsApi;

export default eventsApi;
