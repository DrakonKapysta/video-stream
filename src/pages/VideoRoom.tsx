import { Calling } from "@/components/shared/Calling";
import { Controls } from "@/components/shared/Controls/ControlsProvider";
import { Video } from "@/components/shared/Video";
import { Button } from "@/components/ui/button";
import useCalling from "@/hooks/useCalling";
import { socketService } from "@/services/socketService";
import webRtcService from "@/services/webRtcService";
import { useSocketStore } from "@/store/socketStore";
import {
  Camera,
  CameraOff,
  Phone,
  PhoneOff,
  Volume2,
  VolumeOff,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const VideoRoom = () => {
  const socket = useSocketStore((state) => state.socket);
  const {
    isCalling,
    caller,
    resetCaller,
    setIsCalling,
    setCaller,
    setInitiator,
    isInitiator,
    accepted,
  } = useCalling();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isInCall, setIsInCall] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const initiateCall = async () => {
    // Make sure socket is connected
    if (!socket) {
      alert("Not connected to server");
      return;
    }

    // Get connected users
    const firstUser = await webRtcService.findFirstUser(socket);
    if (firstUser) {
      socket.emit("calling", {
        from: socket.id,
        targetSocketId: firstUser.socketId,
      });
      setIsCalling(true);
      setCaller({
        calleeUsername: firstUser.username,
        targetSocketId: firstUser.socketId,
        from: socket.id!,
        callerUsername: "Me",
      });
      setInitiator(true);
    } else {
      alert("No other users connected to call");
    }
  };

  const handleAcceptCall = async () => {
    if (socket) {
      const firstUser = await webRtcService.findFirstUser(socket);
      if (!firstUser) return;
      webRtcService.invite(firstUser.socketId);
      setIsCalling(false);
      accepted(firstUser.socketId);
    }
  };
  const handleDeclineCall = async () => {
    resetCaller();
    if (isInitiator) {
      setInitiator(false);
    }
  };

  const handleCallClose = async () => {
    webRtcService.closeVideoCall();
    if (socket) {
      const firstUser = await webRtcService.findFirstUser(socket);
      if (!firstUser) return;

      socket.emit("hang-up", {
        from: socket.id,
        targetSocketId: firstUser.socketId,
      });
    }
    if (isInitiator) {
      setInitiator(false);
    }
  };

  useEffect(() => {
    // Set up listeners for stream changes
    const localStreamListener = (stream: MediaStream | null) => {
      setLocalStream(stream);
    };

    const remoteStreamListener = (stream: MediaStream | null) => {
      setRemoteStream(stream);
      setIsInCall(stream !== null);
    };

    // Register listeners
    webRtcService.addLocalStreamListener(localStreamListener);
    webRtcService.addRemoteStreamListener(remoteStreamListener);

    // Clean up listeners on component unmount
    return () => {
      webRtcService.removeLocalStreamListener(localStreamListener);
      webRtcService.removeRemoteStreamListener(remoteStreamListener);

      // Also ensure we close any active call when component unmounts
      webRtcService.closeVideoCall();
    };
  }, []);

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
                console.log(await socketService.getConnectedUsers());
              }}
            >
              Get connected users
            </Button>
            <Button
              onClick={async () => {
                socket?.emit("setUserName", {
                  socketId: socket.id,
                  username: "test",
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
