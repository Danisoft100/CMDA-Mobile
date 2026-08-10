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

export const useSocket = () => {
  const { isAuthenticated, user } = useSelector(selectAuth);
  const dispatch = useDispatch();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [state, setState] = useState<SocketState>(initialSocketState);

  useEffect(() => {
    let active = true;
    let newSocket: Socket | null = null;
    let refreshing = false;

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

      newSocket = io(URL, {
        auth: { token },
        transports: ["polling", "websocket"],
        tryAllTransports: true,
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        timeout: 20000,
        path: "/socket.io",
      });

      newSocket.on("connect", () => {
        setState({ connected: true, error: null });
      });

      newSocket.on("disconnect", (reason) => {
        setState((prev) => ({ ...prev, connected: false }));
      });

      newSocket.on("connect_error", (error: Error) => {
        setState({ connected: false, error: error.message });
      });

      newSocket.on("auth_error", async () => {
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
      });

      setSocket(newSocket);
    };

    void connect();

    return () => {
      active = false;
      newSocket?.removeAllListeners();
      newSocket?.disconnect();
    };
  }, [dispatch, isAuthenticated, user?._id]);

  return { socket, state };
};
