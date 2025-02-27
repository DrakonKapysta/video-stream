import { Controls } from "@/components/shared/Controls/ControlsProvider";
import { Video } from "@/components/shared/Video";
import { Button } from "@/components/ui/button";
import { useVideo } from "@/hooks/useVideo";
import { Camera, CameraOff, Volume2, VolumeOff } from "lucide-react";

export const VideoRoom = () => {
  const {
    videoStream,
    startStream,
    stopStreams,
    destroyStreams,
    isInitializing,
    isAudioEnabled,
    isCameraEnabled,

    muteAudio,
    hideCamera,
  } = useVideo();

  return (
    <div className="rounded-md flex flex-col h-screen">
      <div className="flex flex-col items-center flex-1  ">
        <div className="flex relative">
          {isCameraEnabled && !isInitializing && <div>Video Enabled</div>}
          {!isCameraEnabled ||
            (isInitializing && (
              <span className="rounded-full animate-spin w-5 h-5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-t-2 border-blue-500"></span>
            ))}
          <Video width={400} stream={videoStream} />
        </div>
        <Controls>
          <div className="flex gap-2 justify-center items-center min-h-[100px] w-full border-t-2 border-purple-500">
            <Button
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
            </Button>
          </div>
        </Controls>
      </div>
    </div>
  );
};
