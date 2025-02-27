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
        if (stream !== null) {
          videoRef.current.srcObject = stream;
        } else {
          if (videoRef.current.srcObject) {
            videoRef.current.srcObject = null;
          }
        }
      }
    }, [stream, videoRef]);

    return <video {...props} ref={videoRef} autoPlay playsInline />;
  })
);

Video.displayName = "Video";
