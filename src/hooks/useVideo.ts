import { useCallback, useEffect, useRef, useState } from "react";

export function useVideo() {
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);

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

      setIsInitializing(true);

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
    setIsVideoEnabled(false);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      startStream();
    }, 1000);

    return () => {
      clearTimeout(timeout);
      destroyStreams();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const muteAudio = useCallback((state: boolean) => {
    videoStreamRef.current
      ?.getAudioTracks()
      .forEach((track) => (track.enabled = state));

    setIsAudioEnabled(state);
  }, []);
  const hideCamera = useCallback((state: boolean) => {
    if (!state) {
      // Выключаем камеру, но оставляем микрофон
      videoStreamRef.current?.getVideoTracks().forEach((track) => track.stop());
      setIsCameraEnabled(false);
      setVideoStream((prev) => {
        if (!prev) return null;
        return new MediaStream(prev.getAudioTracks()); // Оставляем только аудио
      });
    } else {
      // Включаем камеру снова
      setIsInitializing(true);
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((videoStream) => {
          setVideoStream((prev) => {
            if (!prev) return videoStream;

            // Объединяем новый видео-поток с аудио, если оно есть
            const audioTracks = prev.getAudioTracks();
            audioTracks.forEach((track) => videoStream.addTrack(track));
            setIsCameraEnabled(true);
            return videoStream;
          });
        })
        .catch(console.error)
        .finally(() => setIsInitializing(false));
    }

    setIsCameraEnabled(state);
  }, []);

  return {
    videoStream,
    isVideoEnabled,
    isInitializing,
    isAudioEnabled,
    isCameraEnabled,
    startStream,
    stopStreams,
    destroyStreams,
    muteAudio,
    hideCamera,
  };
}
