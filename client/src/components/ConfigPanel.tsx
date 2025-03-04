import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

interface ConfigPanelProps {
  sensitivity: number;
  onSensitivityChange: (value: number) => void;
  isEnabled: boolean;
  onEnabledChange: (value: boolean) => void;
  showCamera: boolean;
  onShowCameraChange: (value: boolean) => void;
}

export default function ConfigPanel({
  isEnabled,
  onEnabledChange,
  sensitivity,
  onSensitivityChange,
  showCamera,
  onShowCameraChange
}: ConfigPanelProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-2xl font-semibold mb-6">Configuration</h2>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="show-camera" className="text-lg">
              Show Camera Feed
            </Label>
            <Switch
              id="show-camera"
              checked={showCamera}
              onCheckedChange={onShowCameraChange}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="motion-detection" className="text-lg">
              Motion Detection
            </Label>
            <Switch
              id="motion-detection"
              checked={isEnabled}
              onCheckedChange={onEnabledChange}
            />
          </div>
        
          <div className="space-y-2">
            <Label htmlFor="sensitivity" className="text-lg">
              Motion Sensitivity: {sensitivity}%
            </Label>
            <Slider
              id="sensitivity"
              min={1}
              max={100}
              step={1}
              value={[sensitivity]}
              onValueChange={(values) => onSensitivityChange(values[0])}
              disabled={!isEnabled}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}