import Toast from "react-native-toast-message";

import TokenManager from "./TokenManager";
import { logout } from "~/store/slices/authSlice";
import { resetTo } from "~/utils/navigationService";

let expiryInProgress = false;

/** Clears only the server session and returns to the existing quick-unlock sign-in screen. */
export async function handleSessionExpired(dispatch: (action: any) => unknown) {
  if (expiryInProgress) return;
  expiryInProgress = true;

  try {
    await TokenManager.clearTokens();
    dispatch(logout());
    dispatch({ type: "api/resetApiState" });
    Toast.show({
      type: "info",
      text1: "Session expired",
      text2: "Unlock or sign in again to continue.",
      visibilityTime: 4000,
    });
    resetTo("sign-in");
  } finally {
    setTimeout(() => {
      expiryInProgress = false;
    }, 1000);
  }
}
