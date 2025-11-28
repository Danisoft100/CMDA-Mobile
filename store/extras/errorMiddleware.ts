import { CommonActions } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { navigate } from "~/utils/navigationService";
import { logout } from "../slices/authSlice";
import api from "../api/api";
import { persistor } from "../store";

const errorMiddleware = (store: any) => (next: any) => async (action: any) => {
  try {
    const isRejected = action.type?.endsWith("/rejected");
    const isFulfilled = action.type?.endsWith("/fulfilled");

    const getErrorMessage = () => {
      try {
        const payload = action.payload || {};
        const { data, error, message } = payload;

        const errorMessage =
          typeof payload === "string"
            ? payload
            : data
            ? Array.isArray(data?.message)
              ? data?.message?.[0]
              : Array.isArray(data?.error)
              ? data?.error?.[0]
              : data?.message || data?.error
            : message || error || "Oops, something went wrong!";

        return errorMessage || "An error occurred";
      } catch (e) {
        console.error('[errorMiddleware] Error getting message:', e);
        return "An error occurred";
      }
    };

    // check if action is rejected or is fufilled but an error exists
    if ((isFulfilled && action.payload?.error) || isRejected) {
      const text1 = getErrorMessage();
      if (text1?.includes("expired token")) {
        Toast.show({ type: "error", text1: "Session has expired. Login again" });
        // Dispatch logout action
        store.dispatch(logout());
        try {
          await persistor.purge();
          api.util.resetApiState();
          // Navigate to the login screen
          navigate("sign-in");
        } catch (e) {
          console.error('[errorMiddleware] Error during logout:', e);
        }
      } else {
        // show a toast with the error message
        try {
          Toast.show({ type: "error", text1 });
        } catch (e) {
          console.error('[errorMiddleware] Error showing toast:', e);
        }
      }
    }
  } catch (error) {
    console.error('[errorMiddleware] Fatal error in middleware:', error);
  }

  // Pass the action to the next middleware or the reducer
  return next(action);
};

export default errorMiddleware;
