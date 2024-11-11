import { CommonActions } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { navigate } from "~/utils/navigationService";
import { logout } from "../slices/authSlice";

const errorMiddleware = (store: any) => (next: any) => (action: any) => {
  const isRejected = action.type.endsWith("/rejected");
  const isFulfilled = action.type.endsWith("/fulfilled");

  const getErrorMessage = () => {
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

    return errorMessage;
  };

  // check if action is rejected or is fufilled but an error exists
  if ((isFulfilled && action.payload?.error) || isRejected) {
    const text1 = getErrorMessage();
    if (text1.includes("expired token")) {
      Toast.show({ type: "error", text1: "Session has expired. Login again" });
      // Navigate to the login screen
      navigate("sign-in");
      // Dispatch logout action
      store.dispatch(logout());
    } else {
      // show a toast with the error message
      Toast.show({ type: "error", text1 });
    }
  }

  // Pass the action to the next middleware or the reducer
  return next(action);
};

export default errorMiddleware;
