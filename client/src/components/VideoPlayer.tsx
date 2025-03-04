import { useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { setVideoElement } from "@/lib/video-controller";

interface VideoPlayerProps {
  src: string;
}

export default function VideoPlayer({ src }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = false; // Ensure video is unmuted
      videoRef.current.volume = 0.5; // Set initial volume to 50%
      setVideoElement(videoRef.current);

      // Add error handling for video events
      const handleError = (e: Event) => {
        console.error('Video playback error:', e);
      };

      const handleEnded = () => {
        if (videoRef.current) {
          videoRef.current.pause();
        }
      };

      // Set initial playback position to middle of video when metadata is loaded
      const handleLoadedMetadata = () => {
        if (videoRef.current) {
          const midPoint = videoRef.current.duration / 2;
          videoRef.current.currentTime = midPoint;
        }
      };

      videoRef.current.addEventListener('error', handleError);
      videoRef.current.addEventListener('ended', handleEnded);
      videoRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);

      return () => {
        if (videoRef.current) {
          videoRef.current.removeEventListener('error', handleError);
          videoRef.current.removeEventListener('ended', handleEnded);
          videoRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
        }
      };
    }
  }, []);

  return (
    <Card className="overflow-hidden">
      <video
        ref={videoRef}
        src={src}
        controls
        className="w-full rounded-lg"
      />
    </Card>
  );
}