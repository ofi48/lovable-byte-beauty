import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";

interface SettingsPanelProps {
  activeFunction: 'video-spoofer' | 'image-spoofer' | 'similarity-detector' | null;
}

export const SettingsPanel = ({ activeFunction }: SettingsPanelProps) => {
  const renderVideoSpooferSettings = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="resolution" className="text-sm font-medium text-card-foreground">
          Output Resolution
        </Label>
        <Input 
          id="resolution"
          placeholder="1920x1080"
          className="mt-2"
        />
      </div>
      
      <div>
        <Label htmlFor="framerate" className="text-sm font-medium text-card-foreground">
          Frame Rate
        </Label>
        <div className="mt-2 space-y-2">
          <Slider defaultValue={[30]} max={60} min={1} step={1} />
          <span className="text-xs text-muted-foreground">30 FPS</span>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <Switch id="realtime" />
        <Label htmlFor="realtime" className="text-sm text-card-foreground">
          Real-time Processing
        </Label>
      </div>
    </div>
  );

  const renderImageSpooferSettings = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="image-quality" className="text-sm font-medium text-card-foreground">
          Image Quality
        </Label>
        <div className="mt-2 space-y-2">
          <Slider defaultValue={[85]} max={100} min={1} step={1} />
          <span className="text-xs text-muted-foreground">85%</span>
        </div>
      </div>
      
      <div>
        <Label htmlFor="format" className="text-sm font-medium text-card-foreground">
          Output Format
        </Label>
        <Input 
          id="format"
          placeholder="PNG, JPG, WEBP"
          className="mt-2"
        />
      </div>

      <div className="flex items-center space-x-3">
        <Switch id="preserve-metadata" />
        <Label htmlFor="preserve-metadata" className="text-sm text-card-foreground">
          Preserve Metadata
        </Label>
      </div>
    </div>
  );

  const renderSimilarityDetectorSettings = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="sensitivity" className="text-sm font-medium text-card-foreground">
          Detection Sensitivity
        </Label>
        <div className="mt-2 space-y-2">
          <Slider defaultValue={[75]} max={100} min={1} step={1} />
          <span className="text-xs text-muted-foreground">75%</span>
        </div>
      </div>
      
      <div>
        <Label htmlFor="threshold" className="text-sm font-medium text-card-foreground">
          Similarity Threshold
        </Label>
        <Input 
          id="threshold"
          placeholder="0.85"
          type="number"
          className="mt-2"
        />
      </div>

      <div className="flex items-center space-x-3">
        <Switch id="deep-analysis" defaultChecked />
        <Label htmlFor="deep-analysis" className="text-sm text-card-foreground">
          Deep Analysis Mode
        </Label>
      </div>
    </div>
  );

  if (!activeFunction) {
    return (
      <Card className="p-6 h-full bg-card">
        <div className="flex items-center justify-center h-full text-center">
          <div>
            <h3 className="text-lg font-semibold text-card-foreground mb-2">
              Select a Function
            </h3>
            <p className="text-muted-foreground">
              Choose a tool from the dashboard to view its settings and configuration options.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const functionTitles = {
    'video-spoofer': 'Video Spoofer Settings',
    'image-spoofer': 'Image Spoofer Settings',
    'similarity-detector': 'Similarity Detector Settings'
  };

  return (
    <Card className="p-6 h-full bg-card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-card-foreground">
          {functionTitles[activeFunction]}
        </h2>
      </div>
      
      <Separator className="mb-6" />
      
      <div className="space-y-6">
        {activeFunction === 'video-spoofer' && renderVideoSpooferSettings()}
        {activeFunction === 'image-spoofer' && renderImageSpooferSettings()}
        {activeFunction === 'similarity-detector' && renderSimilarityDetectorSettings()}
        
        <Separator />
        
        <div className="flex space-x-3">
          <Button className="flex-1 bg-sidebar-primary hover:bg-sidebar-primary/90">
            Apply Settings
          </Button>
          <Button variant="outline" className="flex-1">
            Reset to Default
          </Button>
        </div>
      </div>
    </Card>
  );
};