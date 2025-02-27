import { useSocketStore } from "@/store/socketStore";
import React, { FC, useEffect } from "react";

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: FC<SocketProviderProps> = ({ children }) => {
  const { initializeSocket, disconnect } = useSocketStore();
  useEffect(() => {
    initializeSocket();
    return () => {
      disconnect();
    };

    // eslint-disable-next-line
  }, []);
  return <>{children}</>;
};
