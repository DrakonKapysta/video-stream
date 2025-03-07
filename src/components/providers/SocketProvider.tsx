import { useSocketStore } from "@/store/socketStore";
import React, { FC, useEffect } from "react";

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: FC<SocketProviderProps> = ({ children }) => {
  const { initializeSocket, disconnect } = useSocketStore();
  useEffect(() => {
    try {
      initializeSocket();
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
