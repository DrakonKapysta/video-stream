import { Calling } from "@/components/shared/Calling";
import { Controls } from "@/components/shared/Controls/ControlsProvider";
import { Participants } from "@/components/shared/Participants";
import { Video } from "@/components/shared/Video";
import { Button } from "@/components/ui/button";
import { useConnectedUsers } from "@/hooks/useConnectedUsers";
import { useWebRTCVideo } from "@/hooks/useWebRTCVideo";
import { socketService } from "@/services/socketService";
import { useCallingStore } from "@/store/callingStore";
import { useRoomStore } from "@/store/roomStore";
import {
  Camera,
  CameraOff,
  Phone,
  PhoneOff,
  Volume2,
  VolumeOff,
} from "lucide-react";
import { useEffect, useState } from "react";

export const VideoRoom = () => {
  const isCalling = useCallingStore((state) => state.isCalling);
  const caller = useCallingStore((state) => state.caller);
  const isInitiator = useCallingStore((state) => state.isInitiator);
  const {
    socket,
    handleAcceptCall,
    handleDeclineCall,
    handleCallClose,
    initiateCall,
    localVideoRef,
    remoteVideoRef,
    localStream,
    remoteStream,
  } = useWebRTCVideo();
  const roomName = useRoomStore((state) => state.roomName);
  const { connectedUsers, isLoading, error } = useConnectedUsers();
  const [isUsersVisible, setIsUsersVisible] = useState(false);

  return (
    <div className="relative rounded-md flex flex-col h-screen">
      <div className="flex flex-col items-center flex-1  ">
        <div className="flex relative flex-1 w-full p-2 gap-1 ">
          <div className="flex relative flex-1 rounded-md gap-2 border-2 border-green-500">
            {connectedUsers.map((user) => (
              <div
                key={user.socketId}
                className="p-2 bg-accent flex flex-1 items-center justify-center"
              >
                <p>{user.userName}</p>
              </div>
            ))}
          </div>
          {isUsersVisible && (
            <Participants users={connectedUsers} roomName={roomName} />
          )}
        </div>
        <Controls>
          <div className="flex gap-2 justify-center items-center min-h-[100px] w-full border-t-2 border-purple-500">
            {localStream === null && remoteStream === null ? (
              <Button
                onClick={() => {
                  initiateCall();
                }}
              >
                <Phone className="mr-2" /> Call
              </Button>
            ) : (
              <Button variant={"destructive"} onClick={handleCallClose}>
                <PhoneOff className="mr-2" /> Hang up
              </Button>
            )}
            <Button
              onClick={() => {
                setIsUsersVisible(!isUsersVisible);
              }}
            >
              Participants
            </Button>
          </div>
        </Controls>
      </div>
      {isCalling && (
        <Calling
          isInitiator={isInitiator}
          onAcceptCall={handleAcceptCall}
          onDeclineCall={handleDeclineCall}
          caller={caller}
        />
      )}
    </div>
  );
};
