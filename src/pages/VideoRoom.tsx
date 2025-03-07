import { Controls } from "@/components/shared/Controls/ControlsProvider";
import { Video } from "@/components/shared/Video";
import { Button } from "@/components/ui/button";
import { useVideo } from "@/hooks/useVideo";
import { socketService } from "@/services/socketService";
import webRtcService from "@/services/webRtcService";
import { useSocketStore } from "@/store/socketStore";
import { Camera, CameraOff, Volume2, VolumeOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const VideoRoom = () => {
  // const {
  //   videoStream,
  //   startStream,
  //   destroyStreams,
  //   isAudioEnabled,
  //   isCameraEnabled,

  //   muteAudio,
  //   hideCamera,
  // } = useVideo();
  const socket = useSocketStore((state) => state.socket);
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
    const users = await socketService.getConnectedUsers();
    const otherUser = users.find((user) => user.socketId !== socket.id);
    console.log("Other user", otherUser);
    if (otherUser) {
      webRtcService.invite(otherUser.socketId);
    } else {
      alert("No other users connected to call");
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
    <div className="rounded-md flex flex-col h-screen">
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
            {/* <Button
              onClick={() => {
                startStream();
              }}
            >
              Start Video
            </Button>
            <Button onClick={() => hideCamera(!isCameraEnabled)}>
              {isCameraEnabled ? <Camera size={16} /> : <CameraOff />}
            </Button>
            <Button onClick={() => muteAudio(!isAudioEnabled)}>
              {isAudioEnabled ? <Volume2 size={16} /> : <VolumeOff size={16} />}
            </Button>
            <Button
              onClick={() => {
                destroyStreams();
              }}
            >
              Destroy Stream
            </Button> */}
            <Button
              onClick={() => {
                initiateCall();
              }}
            >
              Call
            </Button>
            <Button
              onClick={async () => {
                console.log(await socketService.getConnectedUsers());
              }}
            >
              Get connected users
            </Button>
          </div>
        </Controls>
      </div>
    </div>
  );
};
