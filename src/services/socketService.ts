import { io, Socket } from "socket.io-client";

class SocketService {
  private BASE_URL = "https://signal-server-2s66.onrender.com";
  private socket: Socket | null = null;
  public connectedSocketsIds: string[] = [];
  public initSocket = () => {
    if (this.socket && this.socket.connected) return this.socket;
    this.socket = io(this.BASE_URL, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    return this.socket;
  };

  public getSocket = () => this.socket;

  public getConnectedUsers = async (): Promise<
    { username: string; socketId: string }[]
  > => {
    if (!this.socket) return [];
    const users = await this.socket?.emitWithAck("getAllUser");
    return users;
  };

  public disconnect = () => {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  };
}

export const socketService = new SocketService();
