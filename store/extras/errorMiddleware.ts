import Toast from "react-native-toast-message";
import { getApiErrorMessage } from "~/utils/getApiErrorMessage";
let lastMessage = "";
let lastShownAt = 0;
const errorMiddleware = (store: any) => (next: any) => (action: any) => {
  const arg = action.meta?.arg;
  const previousQuery = store.getState()?.api?.queries?.[arg?.queryCacheKey];
  const result = next(action);
  if (
    !action.type?.endsWith("/rejected") ||
    !action.payload ||
    action.meta?.aborted ||
    action.meta?.condition ||
    action.meta?.baseQueryMeta?.handlesError ||
    /verifyPassword|pinLogin|biometricLogin|notification.*stats/i.test(
      arg?.endpointName || "",
    )
  )
    return result;
  if (
    arg?.type === "query" &&
    (previousQuery?.data !== undefined || previousQuery?.error)
  )
    return result;
  if (arg?.type === "query" && arg.originalArgs?.feedbackHandled) return result;
  if (!["query", "mutation"].includes(arg?.type)) return result;
  const message = getApiErrorMessage(action.payload);
  if (message !== lastMessage || Date.now() - lastShownAt > 5000) {
    lastMessage = message;
    lastShownAt = Date.now();
    Toast.show({
      type: "error",
      text1:
        arg.type === "query"
          ? "Couldn’t load this information"
          : "Couldn’t complete request",
      text2: message,
      visibilityTime: 6000,
    });
  }
  return result;
};
export default errorMiddleware;
