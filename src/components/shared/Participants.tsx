import { RoomUser } from "@/types/SocketTypes";
import React, { FC } from "react";

interface ParticipantsProps extends React.ComponentPropsWithoutRef<"div"> {
  users: RoomUser[];
  roomName?: string;
}

export const Participants: FC<ParticipantsProps> = ({
  users,
  roomName,
  ...props
}) => {
  return (
    <div
      {...props}
      className="flex flex-col max-w-[200px] w-full ring-1 rounded-md max-h-[100%] overflow-auto"
    >
      {users.map((user) => (
        <div
          key={user.socketId}
          className="flex items-center gap-2 border-b-2 p-2"
        >
          <div className="w-[50px] h-[50px] rounded-full bg-primary"></div>
          <div className="flex flex-col">
            <p>{user.userName}</p>
            <p>{roomName}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
