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
  roomName: string;
  ownerId: string;
  ownerUsername: string;
  errorMessage: string | null;
}
