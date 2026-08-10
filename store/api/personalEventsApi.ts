import { api } from "./api";

const unwrapData = (response: any) => response?.data ?? response;
const normalizePersonalEvent = (event: any) => ({
  ...event,
  date: event?.eventDate ?? event?.date,
});

export const personalEventsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getPersonalEvents: build.query<any, { fromDate?: string; toDate?: string } | void>({
      query: (args) => {
        const fromDate = args?.fromDate;
        const toDate = args?.toDate;
        const params = new URLSearchParams();
        if (fromDate) params.append("fromDate", fromDate);
        if (toDate) params.append("toDate", toDate);
        return `/calendar/personal?${params.toString()}`;
      },
      transformResponse: (response: any) => {
        const data = unwrapData(response);
        return (Array.isArray(data) ? data : []).map(normalizePersonalEvent);
      },
      providesTags: ["PERSONAL_EVENTS"],
    }),
    createPersonalEvent: build.mutation({
      query: ({ date, ...body }) => ({
        url: "/calendar/personal",
        method: "POST",
        body: { ...body, eventDate: date ?? body.eventDate },
      }),
      transformResponse: (response: any) => normalizePersonalEvent(unwrapData(response)),
      invalidatesTags: ["PERSONAL_EVENTS"],
    }),
    updatePersonalEvent: build.mutation({
      query: ({ id, date, ...body }) => ({
        url: `/calendar/personal/${id}`,
        method: "PATCH",
        body: { ...body, ...(date ? { eventDate: date } : {}) },
      }),
      transformResponse: (response: any) => normalizePersonalEvent(unwrapData(response)),
      invalidatesTags: ["PERSONAL_EVENTS"],
    }),
    deletePersonalEvent: build.mutation({
      query: (id) => ({
        url: `/calendar/personal/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["PERSONAL_EVENTS"],
    }),
    createEventReminder: build.mutation({
      query: ({ eventId, ...body }) => ({
        url: `/events/${eventId}/reminders`,
        method: "POST",
        body,
      }),
      transformResponse: (response: any) => unwrapData(response),
      invalidatesTags: ["EVENT_REMINDERS"],
    }),
    getEventReminders: build.query({
      query: () => "/events/reminders",
      transformResponse: (response: any) => {
        const data = unwrapData(response);
        return Array.isArray(data) ? data : [];
      },
      providesTags: ["EVENT_REMINDERS"],
    }),
    deleteEventReminder: build.mutation({
      query: (id) => ({
        url: `/events/reminders/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["EVENT_REMINDERS"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPersonalEventsQuery,
  useCreatePersonalEventMutation,
  useUpdatePersonalEventMutation,
  useDeletePersonalEventMutation,
  useCreateEventReminderMutation,
  useGetEventRemindersQuery,
  useDeleteEventReminderMutation,
} = personalEventsApi;
