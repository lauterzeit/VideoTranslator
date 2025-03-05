import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { detectMotion } from "@/lib/motion-detector";
import { controlVideo } from "@/lib/video-controller";

interface CameraFeedProps {
  onError: (error: string) => void;
  isEnabled: boolean;
  sensitivity: number;
}

export default function CameraFeed({ onError, isEnabled, sensitivity }: CameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let animationFrame: number;

    async function setupCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: 640,
            height: 480,
            facingMode: "user",
            // Add advanced constraints to minimize camera usage
            advanced: [
              {
                brightness: 0,
                contrast: 0,
                saturation: 0,
                sharpness: 0,
                focusDistance: 0,
                exposureMode: "manual",
                exposureTime: 0,
                frameRate: 15
              }
            ]
          }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        onError("Could not access camera. Please ensure camera permissions are granted.");
      }
    }

    function processFrame() {
      if (!videoRef.current || !canvasRef.current || !isEnabled) return;

      const motion = detectMotion(videoRef.current, canvasRef.current, sensitivity);
      controlVideo(motion);

      animationFrame = requestAnimationFrame(processFrame);
    }

    if (isEnabled) {
      setupCamera();
      processFrame();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [onError, isEnabled, sensitivity]);

  return (
    <div className="relative">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute top-0 left-0 opacity-0"
        style={{ 
          visibility: 'hidden',
          position: 'absolute',
          left: '-9999px',
          width: '640px',
          height: '480px'
        }}
      />
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 opacity-0"
        style={{ 
          visibility: 'hidden',
          position: 'absolute',
          left: '-9999px'
        }}
        width={640}
        height={480}
      />
      {!isEnabled && (
        <Card className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <p className="text-white text-xl">Camera Disabled</p>
        </Card>
      )}
    </div>
  );
}