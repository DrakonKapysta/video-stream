import { useCallingStore } from "@/store/callingStore";
import { useSocketStore } from "@/store/socketStore";
import React, { FC, useEffect } from "react";

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: FC<SocketProviderProps> = ({ children }) => {
  const { initializeSocket, disconnect } = useSocketStore();
  const initializeCallHandlers = useCallingStore(
    (state) => state.initializeCallHandlers
  );
  useEffect(() => {
    try {
      initializeSocket();
      initializeCallHandlers();
    } catch (error) {
      console.error("Failed to initialize socket:", error);
    }

    return () => {
      try {
        disconnect();
      } catch (error) {
        console.error("Error during socket disconnection:", error);
      }
    };

    // eslint-disable-next-line
  }, []);
  return <>{children}</>;
};
