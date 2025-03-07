import { cn } from "@/lib/utils";
import { VideoType } from "@/types/VideoTypes";
import React, { ComponentPropsWithoutRef, FC } from "react";
import { Video } from "./Video";

interface VideoListProps extends ComponentPropsWithoutRef<"div"> {
  videos: VideoType[];
}

export const VideoList = React.forwardRef<HTMLDivElement, VideoListProps>(
  ({ videos, className, ...props }, ref) => {
    return (
      <div
        className={cn("grid grid-cols-3 gap-2 w-full", className)}
        ref={ref}
        {...props}
      >
        {videos.map((video) => (
          // TODO: change div tag to <Video/> component
          //   <Video
          //     className=" object-cover"
          //     stream={video.stream}
          //     key={video.id}
          //   />
          <div
            className="border rounded-md p-2 flex justify-center items-center"
            key={video.id}
          >
            {video.username}
          </div>
        ))}
        {videos.length % 2 !== 0 && <div className="border bg-accent"></div>}
      </div>
    );
  }
);

VideoList.displayName = "VideoList";
