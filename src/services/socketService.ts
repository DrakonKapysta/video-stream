import { io, Socket } from "socket.io-client";

class SocketService {
  private BASE_URL = "http://localhost:3001";
  private socket: Socket | null = null;
  public initSocket = () => {
    this.socket = io(this.BASE_URL);

    return this.socket;
  };

  public getSocket = () => this.socket;

  public disconnect = () => this.socket?.disconnect();
}

export const socketService = new SocketService();
