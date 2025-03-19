import { socketService } from "@/services/socketService";
import { useRoomStore } from "@/store/roomStore";
import { RoomUser } from "@/types/SocketTypes";
import { useState, useEffect } from "react";

export const useConnectedUsers = () => {
  const roomName = useRoomStore((state) => state.roomName);
  const [connectedUsers, setConnectedUsers] = useState<RoomUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!roomName) return;

      setIsLoading(true);
      setError(null);

      try {
        const users = await socketService.getConnectedUsersInRoom(roomName);
        setConnectedUsers(users);
      } catch (err) {
        console.error("Failed to fetch connected users:", err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();

    // const handleUserUpdate = () => {
    //   fetchUsers();
    // };

    // if (socketService.socket) {
    //   socketService.socket.on("userJoined", handleUserUpdate);
    //   socketService.socket.on("userLeft", handleUserUpdate);
    // }

    // return () => {
    //   if (socketService.socket) {
    //     socketService.socket.off("userJoined", handleUserUpdate);
    //     socketService.socket.off("userLeft", handleUserUpdate);
    //   }
    // };
  }, [roomName]);

  const refreshUsers = async () => {
    if (!roomName) return;

    setIsLoading(true);
    try {
      const users = await socketService.getConnectedUsersInRoom(roomName);
      setConnectedUsers(users);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return { roomName, connectedUsers, isLoading, error, refreshUsers };
};
