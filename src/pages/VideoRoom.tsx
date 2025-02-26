import { Controls } from "@/components/shared/Controls/ControlsProvider";
import { Video } from "@/components/shared/Video";
import { Button } from "@/components/ui/button";
import { useVideo } from "@/hooks/useVideo";

export const VideoRoom = () => {
  const {
    videoStream,
    startStream,
    stopStreams,
    destroyStreams,
    isInitializing,
  } = useVideo();

  return (
    <div className=" rounded-md flex flex-col h-screen">
      <div className="flex flex-col items-center flex-1  ">
        {isInitializing ? (
          <div>Loading...</div>
        ) : (
          <div className="flex w-full flex-1 gap-2 ">
            <Video width={400} className="" stream={videoStream} />
          </div>
        )}

        <Controls>
          <div className="flex gap-2 justify-center items-center min-h-[100px] w-full border-t-2 border-purple-500">
            <Button
              onClick={() => {
                startStream();
              }}
            >
              Start Video
            </Button>
            <Button
              onClick={() => {
                stopStreams();
              }}
            >
              Stop Video
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
