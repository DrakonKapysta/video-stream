import { useCombinedRef } from "@/hooks/useCombinedRef";
import React, { ComponentPropsWithoutRef, forwardRef, useEffect } from "react";

interface VideoProps extends ComponentPropsWithoutRef<"video"> {
  stream: MediaStream | null;
}

export const Video = React.memo(
  forwardRef<HTMLVideoElement, VideoProps>(({ stream, ...props }, ref) => {
    const videoRef = useCombinedRef<HTMLVideoElement>(ref);

    useEffect(() => {
      if (videoRef && videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    }, [stream, videoRef]);

    return (
      <video {...props} ref={videoRef} autoPlay playsInline>
        Video
      </video>
    );
  })
);

Video.displayName = "Video";
