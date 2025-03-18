export interface Message {
  text: string;
  sent: boolean;
  received: boolean;
}

export interface CallerInfo {
  calleeUsername: string;
  from: string;
  targetSocketId: string;
  callerUsername: string;
}

export interface RoomInfo {
  roomId: string;
  roomName: string;
  ownerId: string;
  ownerUsername: string;
  errorMessage: string | null;
}

export interface FormRoomInfo {
  userName: string;
  roomName: string;
}
