import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import TokenManager from "~/services/TokenManager";
import { useDispatch, useSelector } from "react-redux";
import { selectAuth } from "~/store/slices/authSlice";
import { handleSessionExpired } from "~/services/SessionExpiryService";

interface SocketState {
  connected: boolean;
  error: string | null;
}

const initialSocketState: SocketState = {
  connected: false,
  error: null,
};

let sharedSocket: Socket | null = null;
let sharedSocketUsers = 0;

export const useSocket = () => {
  const { isAuthenticated, user } = useSelector(selectAuth);
  const dispatch = useDispatch();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [state, setState] = useState<SocketState>(initialSocketState);

  useEffect(() => {
    let active = true;
    let newSocket: Socket | null = null;
    let refreshing = false;
    let detachListeners: (() => void) | null = null;

    const URL: string =
      process.env.EXPO_PUBLIC_API_BASE_URL || "https://cmdabackend-38258a63fa98.herokuapp.com";

    const connect = async () => {
      if (!isAuthenticated) return;
      const token = await TokenManager.getToken();
      if (!active) return;
      if (!token) {
        setState({ connected: false, error: "Authentication required" });
        return;
      }

      newSocket = sharedSocket || io(URL, {
        auth: { token },
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        timeout: 20000,
        path: "/socket.io",
      });
      if (!sharedSocket) sharedSocket = newSocket;
      sharedSocketUsers += 1;

      const onConnect = () => {
        setState({ connected: true, error: null });
      };

      const onDisconnect = () => {
        setState((prev) => ({ ...prev, connected: false }));
      };

      const onConnectError = (error: Error) => {
        setState({ connected: false, error: error.message });
      };

      const onAuthError = async () => {
        if (refreshing || !newSocket) return;
        refreshing = true;
        const refreshedToken = await TokenManager.refreshToken();
        refreshing = false;
        if (!active || !newSocket || !refreshedToken) {
          setState({ connected: false, error: "Your session has expired. Please sign in again." });
          await handleSessionExpired(dispatch);
          return;
        }
        newSocket.auth = { token: refreshedToken };
        newSocket.connect();
      };

      newSocket.on("connect", onConnect);
      newSocket.on("disconnect", onDisconnect);
      newSocket.on("connect_error", onConnectError);
      newSocket.on("auth_error", onAuthError);

      detachListeners = () => {
        newSocket?.off("connect", onConnect);
        newSocket?.off("disconnect", onDisconnect);
        newSocket?.off("connect_error", onConnectError);
        newSocket?.off("auth_error", onAuthError);
      };

      setSocket(newSocket);
    };

    void connect();

    return () => {
      active = false;
      detachListeners?.();
      sharedSocketUsers = Math.max(0, sharedSocketUsers - 1);
      if (sharedSocketUsers === 0) {
        newSocket?.disconnect();
        sharedSocket = null;
      }
    };
  }, [dispatch, isAuthenticated, user?._id]);

  return { socket, state };
};
