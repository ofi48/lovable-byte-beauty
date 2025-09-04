import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { VideoParameterControls } from "@/components/video-spoofer/VideoParameterControls";
import { SingleVideoProcessor } from "@/components/video-spoofer/SingleVideoProcessor";
import { BatchVideoProcessor } from "@/components/video-spoofer/BatchVideoProcessor";
import { EnhancedSingleVideoProcessor } from "@/components/video-spoofer/EnhancedSingleVideoProcessor";

const VideoSpoofer = () => {
  const [parameters, setParameters] = useState({
    // Video Quality
    videoQuality: 80,
    videoBitrate: { enabled: false, min: 1000, max: 15000 },
    audioBitrate: { enabled: false, min: 96, max: 128 },
    framerate: { enabled: false, min: 24, max: 60 },
    
    // Color Adjustment
    saturation: { enabled: false, min: 1.0, max: 1.3 },
    contrast: { enabled: false, min: 0.5, max: 1.5 },
    brightness: { enabled: false, min: -0.3, max: 0.3 },
    gamma: { enabled: false, min: 0.7, max: 1.3 },
    
    // Visual Effects
    vignette: { enabled: false, min: 0.0, max: 1.0 },
    noise: { enabled: false, min: 0.0, max: 1.0 },
    waveformShift: { enabled: false, min: 0.0, max: 1.0 },
    pixelShift: { enabled: false, min: 0.0, max: 1.0 },
    
    // Speed & Zoom
    speed: { enabled: false, min: 0.9, max: 1.2 },
    zoom: { enabled: false, min: 0.0, max: 2.0 },
    
    // Audio Settings
    volume: { enabled: false, min: 0.9, max: 1.2 },
    
    // Rotation and Flip
    rotation: { enabled: false, min: -10, max: 10 },
    flipHorizontally: { enabled: false },
    
    // Size and Trim
    randomPixelSize: { enabled: false },
    trim: { enabled: false, min: 0.2, max: 1.0 }
  });

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Video Spoofer</h1>
          <p className="text-muted-foreground">
            Process videos with advanced manipulation and variation generation
          </p>
        </div>

        <Tabs defaultValue="enhanced" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="enhanced">Enhanced Processing</TabsTrigger>
            <TabsTrigger value="single">Single Processing</TabsTrigger>
            <TabsTrigger value="batch">Batch Processing</TabsTrigger>
          </TabsList>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Parameter Controls - Left Side */}
            <div className="xl:col-span-1">
              <VideoParameterControls 
                parameters={parameters}
                onParametersChange={setParameters}
              />
            </div>

            {/* Processing Area - Right Side */}
            <div className="xl:col-span-2">
              <TabsContent value="enhanced" className="mt-0">
                <EnhancedSingleVideoProcessor parameters={parameters} />
              </TabsContent>
              
              <TabsContent value="single" className="mt-0">
                <SingleVideoProcessor parameters={parameters} />
              </TabsContent>
              
              <TabsContent value="batch" className="mt-0">
                <BatchVideoProcessor parameters={parameters} />
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default VideoSpoofer;