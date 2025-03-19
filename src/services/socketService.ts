import { RoomUser } from "@/types/SocketTypes";
import { io, Socket } from "socket.io-client";

class SocketService {
  // private BASE_URL = "https://signal-server-2s66.onrender.com";
  private BASE_URL = "http://localhost:5000";
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

  public createRoom = async (roomName: string) => {
    const response = await this.socket?.emitWithAck("createRoom", roomName);
    return response;
  };

  public async findFirstUser(socket: Socket): Promise<RoomUser | null> {
    const users = await socketService.getConnectedUsers();
    if (users.length <= 0) return null;

    const firstUser = users.find((user) => user.socketId !== socket?.id);
    if (!firstUser) {
      return null;
    }
    return firstUser;
  }

  public async getConnectedUsersInRoom(
    roomName: string
  ): Promise<RoomUser[] | []> {
    try {
      const users: RoomUser[] = await this.socket?.emitWithAck(
        "getUsersInRoom",
        roomName
      );
      if (!users) return [];
      return users;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  public getConnectedUsers = async (): Promise<
    { userName: string; socketId: string }[]
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
