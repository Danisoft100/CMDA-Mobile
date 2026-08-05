import { api } from "./api";

export const commentsReactionsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getComments: build.query({
      query: ({ parentType, parentId, page = 1, limit = 20 }) =>
        `/comments/${parentType}/${parentId}?page=${page}&limit=${limit}`,
      providesTags: (_result, _err, { parentType, parentId }) => [
        { type: "COMMENTS", id: `${parentType}-${parentId}` },
      ],
    }),
    createComment: build.mutation({
      query: (body) => ({ url: "/comments", method: "POST", body }),
      invalidatesTags: (_result, _err, { parentType, parentId }) => [
        { type: "COMMENTS", id: `${parentType}-${parentId}` },
      ],
    }),
    deleteComment: build.mutation({
      query: (id) => ({ url: `/comments/${id}`, method: "DELETE" }),
      invalidatesTags: ["COMMENTS"],
    }),
    toggleReaction: build.mutation({
      query: (body) => ({ url: "/reactions", method: "POST", body }),
      invalidatesTags: ["REACTIONS"],
    }),
    getReactions: build.query({
      query: ({ parentType, parentId }) =>
        `/reactions/${parentType}/${parentId}`,
      providesTags: (_result, _err, { parentType, parentId }) => [
        { type: "REACTIONS", id: `${parentType}-${parentId}` },
      ],
    }),
    submitEventFeedback: build.mutation({
      query: ({ eventId, ...body }) => ({
        url: `/events/${eventId}/feedback`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["EVENT_FEEDBACK"],
    }),
    getEventFeedback: build.query({
      query: ({ eventId, page = 1, limit = 10 }) =>
        `/events/${eventId}/feedback?page=${page}&limit=${limit}`,
      providesTags: ["EVENT_FEEDBACK"],
    }),
    getEventAttendees: build.query({
      query: ({ eventId, page = 1, limit = 20 }) =>
        `/events/${eventId}/attendees?page=${page}&limit=${limit}`,
      providesTags: ["EVENT_ATTENDEES"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCommentsQuery,
  useCreateCommentMutation,
  useDeleteCommentMutation,
  useToggleReactionMutation,
  useGetReactionsQuery,
  useSubmitEventFeedbackMutation,
  useGetEventFeedbackQuery,
  useGetEventAttendeesQuery,
} = commentsReactionsApi;
