import { Calling } from "@/components/shared/Calling";
import { Controls } from "@/components/shared/Controls/ControlsProvider";
import { Video } from "@/components/shared/Video";
import { Button } from "@/components/ui/button";
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

  return (
    <div className="relative rounded-md flex flex-col h-screen">
      <div className="flex flex-col items-center flex-1  ">
        <div className="flex relative flex-1 w-full p-2">
          <Video
            width={400}
            ref={localVideoRef}
            stream={localStream}
            muted
            autoPlay
          />
          <Video
            width={400}
            stream={remoteStream}
            ref={remoteVideoRef}
            autoPlay
          />
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
              onClick={async () => {
                console.log(
                  await socketService.getConnectedUsersInRoom(roomName)
                );
              }}
            >
              Show participants
            </Button>
            <Button
              onClick={async () => {
                socket?.emit("setUserName", {
                  socketId: socket.id,
                  userName: "test",
                });
              }}
            >
              Set username
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
