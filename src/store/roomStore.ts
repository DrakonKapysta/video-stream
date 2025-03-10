import { socketService } from "@/services/socketService";
import { RoomInfo } from "@/types/SocketTypes";
import { create } from "zustand";

interface RoomState {
  roomName: string;
  ownerUsername: string;
  isgRoomLoading: boolean;
  setIsRoomLoading: (joiningRoom: boolean) => void;
  initializeRoomHandlers: () => void;
  joinRoom: (roomName: string) => Promise<boolean>;
  createRoom: (roomName: string) => Promise<boolean>;
}

const initialState: RoomState = {
  roomName: "",
  ownerUsername: "",
  isgRoomLoading: false,
  setIsRoomLoading: () => {},
  initializeRoomHandlers: () => {},
  joinRoom: async () => false,
  createRoom: async () => false,
};

export const useRoomStore = create<RoomState>()((set, get) => ({
  ...initialState,
  initializeRoomHandlers: () => {
    const socket = socketService.getSocket();
    if (socket) {
      socket.on("join-room", (data: { roomName: string }) => {});
      socket.on("leave-room", () => set({ roomName: "" }));
    }
  },
  setJoiningRoom: (isgRoomLoading: boolean) => set({ isgRoomLoading }),
  createRoom: async (roomName: string) => {
    const socket = socketService.getSocket();
    if (socket) {
      try {
        set({ isgRoomLoading: true });
        const roomInfo: RoomInfo = await socket.emitWithAck("create-room", {
          roomName,
        });
        if (!roomInfo.errorMessage) {
          set({
            roomName: roomInfo.roomName,
            ownerUsername: roomInfo.ownerUsername,
          });
          return true;
        }
        console.log(roomInfo.errorMessage);
        return false;
      } catch (error) {
        console.log(error);
        return false;
      } finally {
        set({ isgRoomLoading: false });
      }
    }
    return false;
  },
  joinRoom: async (roomName: string) => {
    if (get().roomName === roomName) return false;
    const socket = socketService.getSocket();
    if (socket) {
      try {
        set({ isgRoomLoading: true });
        const roomInfo: RoomInfo = await socket.emitWithAck("join-room", {
          roomName,
        });
        if (!roomInfo.errorMessage) {
          set({
            roomName: roomInfo.roomName,
            ownerUsername: roomInfo.ownerUsername,
          });
          console.log(roomInfo.errorMessage);
          return true;
        }
        return false;
      } catch (error) {
        console.log(error);
        return false;
      } finally {
        set({ isgRoomLoading: false });
      }
    }
    return false;
  },
}));
