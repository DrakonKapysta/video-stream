import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export function useVideo() {
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);

  const videoStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    videoStreamRef.current = videoStream;
  }, [videoStream]);

  const startStream = useCallback(
    async (options = { video: true, audio: true }) => {
      const currentStream = videoStreamRef.current;

      if (currentStream) {
        currentStream.getTracks().forEach((track) => (track.enabled = true));
        setIsVideoEnabled(true);
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia(options);

        setVideoStream(stream);
        setIsVideoEnabled(true);
      } catch (error) {
        console.error("Error while accessing camera:", error);
      } finally {
        setIsInitializing(false);
      }
    },
    []
  );

  const stopStreams = useCallback(() => {
    videoStreamRef.current
      ?.getTracks()
      .forEach((track) => (track.enabled = false));

    setIsVideoEnabled(false);
  }, []);

  const destroyStreams = useCallback(() => {
    videoStreamRef.current?.getTracks().forEach((track) => {
      track.stop();
      videoStreamRef.current?.removeTrack(track);
    });
    setVideoStream(null);
  }, []);

  useEffect(() => {
    setIsInitializing(true);

    const timeout = setTimeout(() => {
      startStream();
    }, 1000);

    return () => {
      clearTimeout(timeout);
      destroyStreams();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    videoStream,
    startStream,
    stopStreams,
    destroyStreams,
    isInitializing,
    isVideoEnabled,
  };
}
