import { create } from "zustand";
import { Socket } from "socket.io-client";
import { socketService } from "@/services/socketService";
import { Message } from "@/types/SocketTypes";
import webRtcService from "@/services/webRtcService";

interface SocketState {
  socket: Socket | null;
  connected: boolean;
  messages: Message[];
  initializeSocket: () => void;
  sendMessage: (message: Message) => void;
  disconnect: () => void;
}

const initialState: SocketState = {
  socket: null,
  connected: false,
  messages: [],
  initializeSocket: () => {},
  sendMessage: () => {},
  disconnect: () => {},
};

export const useSocketStore = create<SocketState>()((set, get) => ({
  ...initialState,

  initializeSocket: () =>
    set((state) => {
      if (!state.socket || !state.socket.connected) {
        const socket = socketService.initSocket();
        socket.on("connect", () => set({ connected: true }));

        socket.on("disconnect", () => set({ connected: false }));

        socket.on("message", (message) => {
          console.log("Message from server", message);
          set((state) => ({
            messages: [...state.messages, { ...message, received: true }],
          }));
        });
        socket.on("ice-candidate", (data) => {
          console.log("DATA", data);
          webRtcService.handleNewICECandidateMsg(data);
        });
        socket.on("offer", (data) => webRtcService.handleVideoOfferMsg(data));
        socket.on("answer", (data) => webRtcService.handleVideoAnswerMsg(data));

        return { socket };
      }
      return state;
    }),

  disconnect: () =>
    set((state) => {
      const socket = state.socket;
      if (socket) {
        socketService.disconnect();
        return { socket: null };
      }
      return state;
    }),

  sendMessage: (message: Message) => {
    const socket = get().socket;
    if (socket && get().connected) {
      socket.emit("message", message);
      set((state) => ({
        messages: [...state.messages, { ...message, sent: true }],
      }));
      return true;
    }
    return false;
  },
}));

// with nested set func ------------------------>
//   sendMessage: (message) => {
//     set((state) => {
//       const socket = state.socket;
//       if (socket && socket.connected) {
//         socket.emit("message", message);
//         return { messages: [...state.messages, { ...message, sent: true }] };
//       }
//       return state;
//     });

//     return true;
//   },
