import { useRef, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { setVideoElement } from "@/lib/video-controller";
import RotatingArrow from "./RotatingArrow";

interface VideoPlayerProps {
  src: string;
}

export default function VideoPlayer({ src }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

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
        console.error('Video playback error:', e);
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
  }, []);

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
}