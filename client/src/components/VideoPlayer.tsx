import { useRef, useEffect, useState, forwardRef } from "react";
import { Card } from "@/components/ui/card";
import { setVideoElement } from "@/lib/video-controller";
import RotatingArrow from "./RotatingArrow";

interface VideoPlayerProps {
  src: string;
}

const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(({ src }, ref) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  // Use the forwarded ref if provided, otherwise use local ref
  const videoRef = (ref as React.RefObject<HTMLVideoElement>) || localVideoRef;

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.volume = 0.5;
      setVideoElement(videoRef.current);

      const handleTimeUpdate = () => {
        if (videoRef.current) {
          setCurrentTime(videoRef.current.currentTime);
        }
      };

      const handleDurationChange = () => {
        if (videoRef.current) {
          setDuration(videoRef.current.duration);
        }
      };

      const handleError = (e: Event) => {
        const videoElement = e.target as HTMLVideoElement;
        console.error('Video playback error:', {
          error: videoElement.error?.message,
          code: videoElement.error?.code,
          networkState: videoElement.networkState,
          readyState: videoElement.readyState
        });
      };

      const handleEnded = () => {
        if (videoRef.current) {
          videoRef.current.pause();
        }
      };

      videoRef.current.addEventListener('timeupdate', handleTimeUpdate);
      videoRef.current.addEventListener('durationchange', handleDurationChange);
      videoRef.current.addEventListener('error', handleError);
      videoRef.current.addEventListener('ended', handleEnded);

      return () => {
        if (videoRef.current) {
          videoRef.current.removeEventListener('timeupdate', handleTimeUpdate);
          videoRef.current.removeEventListener('durationchange', handleDurationChange);
          videoRef.current.removeEventListener('error', handleError);
          videoRef.current.removeEventListener('ended', handleEnded);
        }
      };
    }
  }, [videoRef]);

  return (
    <div className="relative">
      <video
        ref={videoRef}
        src={src}
        controls
        className="w-full rounded-lg"
      />
      <RotatingArrow videoTime={currentTime} duration={duration} />
    </div>
  );
});

VideoPlayer.displayName = "VideoPlayer";

export default VideoPlayer;