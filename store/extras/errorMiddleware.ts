import Toast from "react-native-toast-message";
import { getApiErrorMessage } from "~/utils/getApiErrorMessage";

let lastMessage = "";
let lastShownAt = 0;
const errorMiddleware = () => (next: any) => (action: any) => {
  const result = next(action);
  if (!action.type?.endsWith("/rejected") || !action.payload || action.meta?.aborted || action.meta?.condition ||
      action.meta?.arg?.type !== "mutation" || action.meta?.baseQueryMeta?.handlesError ||
      /verifyPassword|pinLogin|biometricLogin/.test(action.meta?.arg?.endpointName || "")) return result;
  const message = getApiErrorMessage(action.payload);
  if (message !== lastMessage || Date.now() - lastShownAt > 5000) {
    lastMessage = message; lastShownAt = Date.now();
    Toast.show({ type: "error", text1: "Couldn’t complete request", text2: message, visibilityTime: 6000 });
  }
  return result;
};
export default errorMiddleware;
