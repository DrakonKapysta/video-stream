import { Video } from "@/components/shared/Video";
import { useVideo } from "@/hooks/useVideo";

export const VideoRoom = () => {
  const { videoStream } = useVideo();

  return (
    <div>
      VideoRoom
      <Video stream={videoStream} />
    </div>
  );
};
