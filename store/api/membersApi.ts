import api from "./api";

const membersApi = api.injectEndpoints({
  endpoints: (build) => ({
    getAllUsers: build.query({
      query: ({ searchBy, page, limit, role, region }: any) => ({
        url: "/users",
        params: {
          page,
          limit,
          ...(searchBy ? { searchBy } : {}),
          ...(role ? { role } : {}),
          ...(region ? { region } : {}),
        },
      }),
      transformResponse: (response: any) => response.data,
    }),
    getSingleUser: build.query({
      query: (memId: any) => `/users/${memId}`,
      transformResponse: (response: any) => response.data,
    }),
  }),
});

export const { useGetAllUsersQuery, useGetSingleUserQuery } = membersApi;

export default membersApi;
