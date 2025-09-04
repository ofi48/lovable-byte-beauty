import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface VideoParameterControlsProps {
  parameters: any;
  onParametersChange: (parameters: any) => void;
}

export const VideoParameterControls = ({ parameters, onParametersChange }: VideoParameterControlsProps) => {
  const updateParameter = (path: string, value: any) => {
    const newParams = { ...parameters };
    const keys = path.split('.');
    let current = newParams;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    
    onParametersChange(newParams);
  };

  const RangeParameter = ({ 
    label, 
    parameter, 
    path, 
    unit = "",
    step = 0.1 
  }: { 
    label: string; 
    parameter: any; 
    path: string; 
    unit?: string;
    step?: number;
  }) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        <Switch 
          checked={parameter.enabled}
          onCheckedChange={(checked) => updateParameter(`${path}.enabled`, checked)}
        />
      </div>
      
      {parameter.enabled && (
        <div className="space-y-2 pl-4">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Min: {parameter.min}{unit}</span>
            <span>Max: {parameter.max}{unit}</span>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Min Value</Label>
            <Slider
              value={[parameter.min]}
              onValueChange={([value]) => updateParameter(`${path}.min`, value)}
              max={parameter.max * 2}
              min={0}
              step={step}
              className="w-full"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Max Value</Label>
            <Slider
              value={[parameter.max]}
              onValueChange={([value]) => updateParameter(`${path}.max`, value)}
              max={parameter.max * 2}
              min={parameter.min}
              step={step}
              className="w-full"
            />
          </div>
        </div>
      )}
    </div>
  );

  const ToggleParameter = ({ label, parameter, path }: { label: string; parameter: any; path: string }) => (
    <div className="flex items-center justify-between">
      <Label className="text-sm font-medium">{label}</Label>
      <Switch 
        checked={parameter.enabled}
        onCheckedChange={(checked) => updateParameter(`${path}.enabled`, checked)}
      />
    </div>
  );

  return (
    <Card className="p-6 h-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">Processing Parameters</h3>
        <p className="text-sm text-muted-foreground">Configure variation ranges for video processing</p>
      </div>

      <ScrollArea className="h-[600px] pr-3">
        <div className="space-y-6">
          {/* Video Quality Section */}
          <div className="space-y-4">
            <h4 className="font-medium text-purple-accent">Video Quality</h4>
            
            <div className="space-y-2">
              <Label className="text-sm">Base Quality</Label>
              <Slider
                value={[parameters.videoQuality]}
                onValueChange={([value]) => updateParameter('videoQuality', value)}
                max={100}
                min={1}
                step={1}
                className="w-full"
              />
              <span className="text-xs text-muted-foreground">{parameters.videoQuality}%</span>
            </div>

            <RangeParameter
              label="Video Bitrate"
              parameter={parameters.videoBitrate}
              path="videoBitrate"
              unit=" kbps"
              step={100}
            />

            <RangeParameter
              label="Audio Bitrate"
              parameter={parameters.audioBitrate}
              path="audioBitrate"
              unit=" kbps"
              step={1}
            />

            <RangeParameter
              label="Framerate"
              parameter={parameters.framerate}
              path="framerate"
              unit=" fps"
              step={1}
            />
          </div>

          <Separator />

          {/* Color Adjustment Section */}
          <div className="space-y-4">
            <h4 className="font-medium text-yellow-accent">Color Adjustment</h4>
            
            <RangeParameter
              label="Saturation"
              parameter={parameters.saturation}
              path="saturation"
              step={0.1}
            />

            <RangeParameter
              label="Contrast"
              parameter={parameters.contrast}
              path="contrast"
              step={0.1}
            />

            <RangeParameter
              label="Brightness"
              parameter={parameters.brightness}
              path="brightness"
              step={0.1}
            />

            <RangeParameter
              label="Gamma"
              parameter={parameters.gamma}
              path="gamma"
              step={0.1}
            />
          </div>

          <Separator />

          {/* Visual Effects Section */}
          <div className="space-y-4">
            <h4 className="font-medium text-cyan-accent">Visual Effects</h4>
            
            <RangeParameter
              label="Vignette"
              parameter={parameters.vignette}
              path="vignette"
              step={0.1}
            />

            <RangeParameter
              label="Noise"
              parameter={parameters.noise}
              path="noise"
              step={0.1}
            />

            <RangeParameter
              label="Waveform Shift"
              parameter={parameters.waveformShift}
              path="waveformShift"
              step={0.1}
            />

            <RangeParameter
              label="Pixel Shift"
              parameter={parameters.pixelShift}
              path="pixelShift"
              step={0.1}
            />
          </div>

          <Separator />

          {/* Speed & Zoom Section */}
          <div className="space-y-4">
            <h4 className="font-medium text-purple-accent">Speed & Zoom</h4>
            
            <RangeParameter
              label="Speed"
              parameter={parameters.speed}
              path="speed"
              unit="x"
              step={0.1}
            />

            <RangeParameter
              label="Zoom"
              parameter={parameters.zoom}
              path="zoom"
              unit="x"
              step={0.1}
            />
          </div>

          <Separator />

          {/* Audio Settings Section */}
          <div className="space-y-4">
            <h4 className="font-medium text-yellow-accent">Audio Settings</h4>
            
            <RangeParameter
              label="Volume"
              parameter={parameters.volume}
              path="volume"
              unit="x"
              step={0.1}
            />
          </div>

          <Separator />

          {/* Rotation and Flip Section */}
          <div className="space-y-4">
            <h4 className="font-medium text-cyan-accent">Rotation & Flip</h4>
            
            <RangeParameter
              label="Rotation"
              parameter={parameters.rotation}
              path="rotation"
              unit="°"
              step={1}
            />

            <ToggleParameter
              label="Flip Horizontally"
              parameter={parameters.flipHorizontally}
              path="flipHorizontally"
            />
          </div>

          <Separator />

          {/* Size and Trim Section */}
          <div className="space-y-4">
            <h4 className="font-medium text-purple-accent">Size & Trim</h4>
            
            <ToggleParameter
              label="Random Pixel Size (9:16 only)"
              parameter={parameters.randomPixelSize}
              path="randomPixelSize"
            />

            <RangeParameter
              label="Trim Beginning"
              parameter={parameters.trim}
              path="trim"
              unit="s"
              step={0.1}
            />
          </div>
        </div>
      </ScrollArea>
    </Card>
  );
};