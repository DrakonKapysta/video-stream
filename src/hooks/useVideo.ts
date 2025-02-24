import { useCallback, useEffect, useRef, useState } from "react";

export function useVideo() {
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);

  const videoStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    videoStreamRef.current = videoStream;
  }, [videoStream]);

  const startStream = useCallback(
    async (options = { video: true, audio: true }) => {
      const currentStream = videoStreamRef.current;

      if (currentStream) {
        currentStream.getTracks().forEach((track) => (track.enabled = true));
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia(options);
        setVideoStream(stream);
      } catch (error) {
        console.error("Error while accessing camera:", error);
      }
    },
    []
  );

  const stopStreams = useCallback(() => {
    videoStreamRef.current
      ?.getTracks()
      .forEach((track) => (track.enabled = false));
  }, []);

  const destroyStream = useCallback(() => {
    videoStreamRef.current?.getTracks().forEach((track) => track.stop());
    setVideoStream(null);
  }, []);

  useEffect(() => {
    startStream();

    return () => {
      destroyStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { videoStream, startStream, stopStreams, destroyStream };
}
