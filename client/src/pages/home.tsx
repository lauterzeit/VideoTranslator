import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import CameraFeed from "@/components/CameraFeed";
import VideoPlayer from "@/components/VideoPlayer";
import ConfigPanel from "@/components/ConfigPanel";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { toast } = useToast();
  const [sensitivity, setSensitivity] = useState(30);
  const [isEnabled, setIsEnabled] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleError = (error: string) => {
    toast({
      variant: "destructive",
      title: "Error",
      description: error,
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-8">
          Motion Control Video Player
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Camera Feed</h2>
              <CameraFeed onError={handleError} isEnabled={isEnabled} sensitivity={sensitivity} />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Video Player</h2>
              <VideoPlayer 
                ref={videoRef}
                src="https://storage.googleapis.com/web-dev-assets/video/chrome.webm"
              />
            </CardContent>
          </Card>
        </div>

        <Separator className="my-8" />

        <ConfigPanel 
          sensitivity={sensitivity}
          onSensitivityChange={setSensitivity}
          isEnabled={isEnabled}
          onEnabledChange={setIsEnabled}
        />
      </div>
    </div>
  );
}