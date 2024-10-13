import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";

interface SocketState {
  connected: boolean;
}

// Define the default socket state
const initialSocketState: SocketState = {
  connected: false,
};

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [state, setState] = useState<SocketState>(initialSocketState);

  useEffect(() => {
    const URL: string = process.env.EXPO_PUBLIC_API_BASE_URL as string;

    const newSocket: Socket = io(URL);

    // Set up socket event listeners
    newSocket.on("connect", () => {
      setState({ connected: true });
    });

    newSocket.on("disconnect", () => {
      setState({ connected: false });
    });

    newSocket.on("connect_error", (error: Error) => {
      console.error("SOCKET_ERROR", error);
    });

    setSocket(newSocket);

    // Cleanup function on unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  return { socket, state };
};
