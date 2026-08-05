import api from "./api";

const chatsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getAllContacts: build.query({
      query: () => ({ url: "/chats/contacts" }),
      transformResponse: (response: any) => response.data,
    }),
    getChatHistory: build.query({
      query: ({ id, page = 1, limit = 50 }) => ({
        url: `/chats/history/${id}`,
        params: { page, limit },
      }),
      transformResponse: (response: any) => response.data,
    }),
    sendMessage: build.mutation({
      query: (body: { receiver: string; content: string; clientMessageId?: string }) => ({
        url: "/chats/messages",
        method: "POST",
        body,
      }),
      transformResponse: (response: any) => response.data,
    }),
    blockUser: build.mutation({
      query: (id: string) => ({ url: `/chats/blocks/${id}`, method: "POST" }),
    }),
    reportMessage: build.mutation({
      query: ({ messageId, reason }: { messageId: string; reason: string }) => ({
        url: `/chats/messages/${messageId}/report`,
        method: "POST",
        body: { reason },
      }),
    }),
  }),
});

export const {
  useGetAllContactsQuery,
  useGetChatHistoryQuery,
  useSendMessageMutation,
  useBlockUserMutation,
  useReportMessageMutation,
} = chatsApi;

export default chatsApi;
