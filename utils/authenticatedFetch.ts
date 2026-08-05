import TokenManager from "~/services/TokenManager";

/**
 * Makes an authenticated request using the same secure token source as RTK Query.
 * If the server rejects the token, refresh it once and retry the request.
 */
export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const requestWithToken = async (token: string) => {
    const headers = new Headers(options.headers);
    headers.set("Authorization", `Bearer ${token}`);

    return fetch(url, {
      ...options,
      headers,
    });
  };

  const token = (await TokenManager.getToken()) ?? (await TokenManager.refreshToken());
  if (!token) {
    throw new Error("Your session has expired. Please sign in again.");
  }

  let response = await requestWithToken(token);

  if (response.status === 401) {
    const refreshedToken = await TokenManager.refreshToken();
    if (refreshedToken) {
      response = await requestWithToken(refreshedToken);
    }
  }

  return response;
};
