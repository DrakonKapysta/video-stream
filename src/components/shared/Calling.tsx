import React, { FC } from "react";
import { Button } from "../ui/button";
import { CallerInfo } from "@/types/SocketTypes";

interface CallingProps extends React.ComponentPropsWithoutRef<"div"> {
  isInitiator: boolean;
  caller?: CallerInfo | null;
  onAcceptCall?: () => void;
  onDeclineCall?: () => void;
}

export const Calling: FC<CallingProps> = ({
  isInitiator,
  caller,
  onAcceptCall,
  onDeclineCall,
}) => {
  return isInitiator ? (
    <div className="absolute top-10 right-1/2 translate-x-1/2 items-center flex flex-col gap-6 bg-calling rounded-md p-4 max-w-[400px]">
      <p className="w-full break-words flex-1">
        You are calling to {caller?.calleeUsername}.
      </p>
      <div className="flex gap-2">
        <Button variant={"destructive"} onClick={onDeclineCall}>
          Cancel
        </Button>
      </div>
    </div>
  ) : (
    <div className="absolute top-10 right-1/2 translate-x-1/2 items-center flex flex-col gap-6 bg-calling rounded-md p-4 max-w-[400px]">
      <p className="w-full break-words flex-1">
        {caller?.callerUsername} calling.
      </p>
      <div className="flex gap-2">
        <Button variant={"accept"} onClick={onAcceptCall}>
          Accept
        </Button>
        <Button variant={"destructive"} onClick={onDeclineCall}>
          Decline
        </Button>
      </div>
    </div>
  );
};
