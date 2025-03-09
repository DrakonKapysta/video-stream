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
