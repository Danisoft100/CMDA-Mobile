import { api } from "./api";

export const personalEventsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getPersonalEvents: build.query({
      query: ({ fromDate, toDate } = {}) => {
        const params = new URLSearchParams();
        if (fromDate) params.append("fromDate", fromDate);
        if (toDate) params.append("toDate", toDate);
        return `/calendar/personal?${params.toString()}`;
      },
      providesTags: ["PERSONAL_EVENTS"],
    }),
    createPersonalEvent: build.mutation({
      query: (body) => ({ url: "/calendar/personal", method: "POST", body }),
      invalidatesTags: ["PERSONAL_EVENTS"],
    }),
    updatePersonalEvent: build.mutation({
      query: ({ id, ...body }) => ({
        url: `/calendar/personal/${id}`,
        method: "PATCH",
        body,
      }),
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
      invalidatesTags: ["EVENT_REMINDERS"],
    }),
    getEventReminders: build.query({
      query: () => "/events/reminders",
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
