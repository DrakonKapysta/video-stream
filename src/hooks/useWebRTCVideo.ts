import { useSocketStore } from "@/store/socketStore";
import useCalling from "./useCalling";
import { useEffect, useRef, useState } from "react";
import webRtcService from "@/services/webRtcService";
import { socketService } from "@/services/socketService";

export const useWebRTCVideo = () => {
  const socket = useSocketStore((state) => state.socket);
  const {
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
    const firstUser = await socketService.findFirstUser(socket);
    if (firstUser) {
      socket.emit("calling", {
        from: socket.id,
        targetSocketId: firstUser.socketId,
      });
      setIsCalling(true);
      setCaller({
        calleeUsername: firstUser.userName,
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
      const firstUser = await socketService.findFirstUser(socket);
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
      const firstUser = await socketService.findFirstUser(socket);
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

  return {
    socket,
    localStream,
    remoteStream,
    isInCall,
    localVideoRef,
    remoteVideoRef,
    initiateCall,
    handleAcceptCall,
    handleDeclineCall,
    handleCallClose,
  };
};
