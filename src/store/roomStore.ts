import { socketService } from "@/services/socketService";
import { FormRoomInfo, RoomInfo } from "@/types/SocketTypes";
import { create } from "zustand";

interface RoomState {
  roomId: string;
  roomName: string;
  ownerUsername: string;
  isgRoomLoading: boolean;
  isRoomConnected: boolean;
  setIsRoomLoading: (joiningRoom: boolean) => void;
  setIsRoomConnected: (isRoomConnected: boolean) => void;
  initializeRoomHandlers: () => void;
  joinRoom: (joinRoomInfo: FormRoomInfo) => Promise<boolean>;
  createRoom: (createRoomInfo: FormRoomInfo) => Promise<boolean>;
}

const initialState: RoomState = {
  roomId: "",
  roomName: "",
  ownerUsername: "",
  isgRoomLoading: false,
  isRoomConnected: false,
  setIsRoomConnected: () => {},
  setIsRoomLoading: () => {},
  initializeRoomHandlers: () => {},
  joinRoom: async () => false,
  createRoom: async () => false,
};

export const useRoomStore = create<RoomState>()((set, get) => ({
  ...initialState,
  // initializeRoomHandlers maybe delete it... Or just expand it in future with additionals event handlers.
  // Maybe implement room join/leave notifications for users in room with shadcn-toast.
  initializeRoomHandlers: () => {
    const socket = socketService.getSocket();
    if (socket) {
      socket.on("join-room", (data: { roomName: string }) => {});
      socket.on("leave-room", () => set({ roomName: "" }));
    }
  },
  setIsRoomConnected: (isRoomConnected: boolean) => set({ isRoomConnected }),
  setJoiningRoom: (isgRoomLoading: boolean) => set({ isgRoomLoading }),
  createRoom: async (createRoomInfo: FormRoomInfo) => {
    const socket = socketService.getSocket();
    if (socket) {
      try {
        set({ isgRoomLoading: true });
        const roomInfo: RoomInfo = await socket.emitWithAck(
          "create-room",
          createRoomInfo
        );
        if (!roomInfo.errorMessage) {
          set({
            roomId: roomInfo.roomId,
            roomName: roomInfo.roomName,
            ownerUsername: roomInfo.ownerUsername,
            isRoomConnected: true,
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
  joinRoom: async (joinRoomInfo: FormRoomInfo) => {
    if (get().roomName === joinRoomInfo.roomName) return false;
    const socket = socketService.getSocket();
    if (socket) {
      try {
        set({ isgRoomLoading: true });
        const roomInfo: RoomInfo = await socket.emitWithAck(
          "join-room",
          joinRoomInfo
        );
        if (!roomInfo.errorMessage) {
          set({
            roomId: roomInfo.roomId,
            roomName: roomInfo.roomName,
            ownerUsername: roomInfo.ownerUsername,
            isRoomConnected: true,
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
