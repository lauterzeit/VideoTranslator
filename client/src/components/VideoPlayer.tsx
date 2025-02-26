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
      setVideoElement(videoRef.current);
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
