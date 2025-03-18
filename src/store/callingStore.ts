import { socketService } from "@/services/socketService";
import webRtcService from "@/services/webRtcService";
import { CallerInfo } from "@/types/SocketTypes";
import { create } from "zustand";

interface CallingState {
  isCalling: boolean;
  isInitiator: boolean;
  caller: CallerInfo | null;
  setIsCalling: (isCalling: boolean) => void;
  accepted: (targetSocketId: string) => void;
  setInitiator: (isInitiator: boolean) => void;
  setCaller: (callee: CallerInfo | null) => void;
  resetCaller: () => void;
  initializeCallHandlers: () => void;
}

const initialState: CallingState = {
  isCalling: false,
  isInitiator: false,
  caller: null,
  setIsCalling: () => {},
  setInitiator: () => {},
  setCaller: () => {},
  accepted: () => {},
  resetCaller: () => {},
  initializeCallHandlers: () => {},
};

export const useCallingStore = create<CallingState>()((set, get) => ({
  ...initialState,
  initializeCallHandlers: () => {
    const socket = socketService.getSocket();
    if (socket) {
      socket.on("hang-up", () => {
        webRtcService.closeVideoCall();
      });
      socket.on("accepted", () => {
        set({ isCalling: false, isInitiator: false });
      });
      socket.on("calling", (data) => {
        set({ isCalling: true, caller: data });
      });
      socket.on("declined", () => {
        set({ isCalling: false, caller: null, isInitiator: false });
      });
    }
  },
  setIsCalling: (isCalling: boolean) => set({ isCalling }),
  setCaller: (caller: CallerInfo | null) => set({ caller }),
  accepted: (targetSocketId: string) => {
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit("accepted", { from: socket.id, targetSocketId });
    }
  },
  setInitiator: (isInitiator: boolean) => set({ isInitiator }),

  resetCaller: () =>
    set(() => {
      const socket = socketService.getSocket();
      if (socket) {
        socketService.findFirstUser(socket).then((firstUser) => {
          if (firstUser) {
            socket.emit("declined", {
              from: socket.id,
              targetSocketId: firstUser.socketId,
            });
          }
        });
      }
      return { isCalling: false, caller: null };
    }),
}));
