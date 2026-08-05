import api from "./api";

const eventsApi = api.injectEndpoints({
  endpoints: (build) => ({    getAllEvents: build.query({
      query: ({ limit, page, searchBy, eventDate, eventType, membersGroup, fromToday, fromDate, toDate }) => ({
        url: "/events",
        params: {
          limit,
          page,
          ...(searchBy ? { searchBy } : {}),
          ...(eventDate ? { eventDate } : {}),
          ...(eventType ? { eventType } : {}),
          ...(membersGroup ? { membersGroup } : {}),
          ...(fromToday !== undefined ? { fromToday: String(fromToday) } : {}),
          ...(fromDate ? { fromDate } : {}),
          ...(toDate ? { toDate } : {}),
        },
      }),
      transformResponse: (response: any) => {
        return response.data;
      },
      providesTags: ["EVENTS"],
    }),
    getAllConferences: build.query({
      query: ({ limit, page, searchBy, eventDate, eventType, membersGroup, fromToday, conferenceType, zone, region }) => ({
        url: "/events/conferences",
        params: {
          limit,
          page,
          ...(searchBy ? { searchBy } : {}),
          ...(eventDate ? { eventDate } : {}),
          ...(eventType ? { eventType } : {}),
          ...(membersGroup ? { membersGroup } : {}),
          ...(fromToday !== undefined ? { fromToday: String(fromToday) } : {}),
          ...(conferenceType ? { conferenceType } : {}),
          ...(zone ? { zone } : {}),
          ...(region ? { region } : {}),
        },
      }),
      transformResponse: (response: any) => {
        return response.data;
      },
      providesTags: ["CONFERENCES"],
    }),
    getPublicConferences: build.query({
      query: ({ limit = 10, page = 1, searchBy }: any = {}) => ({
        url: "/events/public/conferences",
        params: { limit, page, ...(searchBy ? { searchBy } : {}) },
      }),
      transformResponse: (response: any) => response.data,
    }),
    getUserConferences: build.query({
      query: ({ limit, page, searchBy, eventDate, eventType, membersGroup, fromToday, conferenceType, zone, region }) => ({
        url: "/events/user-conferences",
        params: {
          limit,
          page,
          ...(searchBy ? { searchBy } : {}),
          ...(eventDate ? { eventDate } : {}),
          ...(eventType ? { eventType } : {}),
          ...(membersGroup ? { membersGroup } : {}),
          ...(fromToday !== undefined ? { fromToday: String(fromToday) } : {}),
          ...(conferenceType ? { conferenceType } : {}),
          ...(zone ? { zone } : {}),
          ...(region ? { region } : {}),
        },
      }),
      transformResponse: (response: any) => {
        return response.data;
      },
      providesTags: ["USER_CONFERENCES"],
    }),
    getSingleEvent: build.query({
      query: (slug) => `/events/${slug}`,
      transformResponse: (response: any) => response.data,
      providesTags: ["SINGLE_EVT"],
    }),
    getUserPaymentPlans: build.query({
      query: (slug) => `/events/${slug}/payment-plans`,
      transformResponse: (response: any) => response.data,
      providesTags: (result, error, slug) => [{ type: "PAYMENT_PLANS", id: slug }],
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
      query: ({ slug, accommodationOptionId, customResponses }) => ({
        url: `/events/register/${slug}`,
        method: "POST",
        body: {
          ...(accommodationOptionId ? { accommodationOptionId } : {}),
          ...(customResponses ? { customResponses } : {}),
        },
      }),
      invalidatesTags: ["USER_EVENTS", "SINGLE_EVT"],
    }),
    payForEvent: build.mutation({
      query: ({ slug, accommodationOptionId, customResponses }) => ({
        url: `/events/pay/${slug}`,
        method: "POST",
        body: {
          ...(accommodationOptionId ? { accommodationOptionId } : {}),
          ...(customResponses ? { customResponses } : {}),
        },
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: ["USER_EVENTS", "SINGLE_EVT"],
    }),
    confirmEventPayment: build.mutation({
      query: (body) => ({ url: `/events/confirm-payment`, method: "POST", body }),
      invalidatesTags: ["USER_EVENTS", "SINGLE_EVT"],
    }),
    checkPublicEventUser: build.mutation({
      query: (body) => ({ url: "/events/public/check-user", method: "POST", body }),
      transformResponse: (response: any) => response.data || response,
    }),
  }),
});

export const {
  useGetAllEventsQuery,
  useGetAllConferencesQuery,
  useGetPublicConferencesQuery,
  useGetUserConferencesQuery,
  useGetSingleEventQuery,
  useGetUserPaymentPlansQuery,
  useGetAllTrainingsQuery,
  useRegisterForEventMutation,
  useGetRegisteredEventsQuery,
  useConfirmEventPaymentMutation,
  usePayForEventMutation,
  useCheckPublicEventUserMutation,
} = eventsApi;

export default eventsApi;
