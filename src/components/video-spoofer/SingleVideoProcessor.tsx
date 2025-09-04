import { useState, useCallback, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload, Play, Download, X, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { videoProcessor, type VideoProcessingParameters } from "@/utils/videoProcessor";

interface SingleVideoProcessorProps {
  parameters: VideoProcessingParameters;
}

export const SingleVideoProcessor = ({ parameters }: SingleVideoProcessorProps) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentVariation, setCurrentVariation] = useState(0);
  const [variations, setVariations] = useState<Blob[]>([]);
  const [numberOfVariations, setNumberOfVariations] = useState(3);
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const initializeFFmpeg = async () => {
      try {
        await videoProcessor.initialize();
        setFfmpegLoaded(true);
        toast({
          title: "Video processor ready",
          description: "FFmpeg has been loaded and is ready for processing",
        });
      } catch (error) {
        console.error('Failed to initialize FFmpeg:', error);
        toast({
          title: "Processing unavailable",
          description: "Failed to load video processing engine. Using fallback mode.",
          variant: "destructive",
        });
      }
    };

    initializeFFmpeg();
  }, [toast]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('video/')) {
        setUploadedFile(file);
        setVariations([]);
        toast({
          title: "Video uploaded",
          description: `${file.name} is ready for processing`,
        });
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a video file",
          variant: "destructive",
        });
      }
    }
  }, [toast]);

  const handleProcess = useCallback(async () => {
    if (!uploadedFile) return;

    setProcessing(true);
    setProgress(0);
    setCurrentVariation(0);
    setVariations([]);

    try {
      if (ffmpegLoaded) {
        // Real video processing
        const processedVariations = await videoProcessor.generateVariations(
          uploadedFile,
          parameters,
          numberOfVariations,
          (variation, progress) => {
            setCurrentVariation(variation);
            setProgress(progress);
          }
        );
        
        setVariations(processedVariations);
        
        toast({
          title: "Processing complete",
          description: `Generated ${numberOfVariations} video variations with applied parameters`,
        });
      } else {
        // Fallback: simulate processing
        for (let i = 1; i <= numberOfVariations; i++) {
          setCurrentVariation(i);
          
          const steps = 100;
          for (let step = 0; step <= steps; step++) {
            await new Promise(resolve => setTimeout(resolve, 50));
            setProgress((step / steps) * 100);
          }
          
          // Create a blob copy of the original file as fallback
          const arrayBuffer = await uploadedFile.arrayBuffer();
          const mockVariation = new Blob([arrayBuffer], { type: uploadedFile.type });
          setVariations(prev => [...prev, mockVariation]);
        }

        toast({
          title: "Fallback processing complete", 
          description: `Created ${numberOfVariations} file copies (real processing unavailable)`,
        });
      }
    } catch (error) {
      console.error('Processing failed:', error);
      toast({
        title: "Processing failed",
        description: "An error occurred during video processing. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
      setProgress(0);
      setCurrentVariation(0);
    }
  }, [uploadedFile, numberOfVariations, parameters, ffmpegLoaded, toast]);

  const removeFile = () => {
    setUploadedFile(null);
    setVariations([]);
    setProgress(0);
    setCurrentVariation(0);
  };

  const downloadVariation = async (variation: Blob, index: number) => {
    try {
      const filename = `${uploadedFile?.name.split('.')[0]}_variation_${index + 1}.mp4`;
      await videoProcessor.downloadBlob(variation, filename);
      
      toast({
        title: "Download started",
        description: `Downloading ${filename}`,
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Could not download the variation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const downloadAllVariations = async () => {
    if (variations.length === 0) return;
    
    try {
      const baseFileName = uploadedFile?.name.split('.')[0] || 'video';
      await videoProcessor.createZipWithVariations(variations, baseFileName);
      
      toast({
        title: "Download started",
        description: `Downloading all ${variations.length} variations`,
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Could not download variations. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Upload Video</h3>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-purple-accent border-purple-accent">
                Single Processing
              </Badge>
              {!ffmpegLoaded && (
                <Badge variant="outline" className="text-yellow-accent border-yellow-accent">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Fallback Mode
                </Badge>
              )}
            </div>
          </div>

          {!uploadedFile ? (
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <Label htmlFor="video-upload" className="cursor-pointer">
                <span className="text-lg font-medium text-foreground hover:text-purple-accent transition-colors">
                  Click to upload video
                </span>
                <p className="text-muted-foreground mt-2">
                  Supported formats: MP4, AVI, MOV, MKV
                </p>
              </Label>
              <Input
                id="video-upload"
                type="file"
                accept="video/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
              <div className="flex items-center space-x-3">
                <Play className="h-5 w-5 text-purple-accent" />
                <div>
                  <p className="font-medium text-foreground">{uploadedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={removeFile}
                className="hover:bg-destructive hover:text-destructive-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Processing Controls */}
      {uploadedFile && (
        <Card className="p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Processing Controls</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Number of Variations</Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={numberOfVariations}
                  onChange={(e) => setNumberOfVariations(parseInt(e.target.value) || 1)}
                  className="w-full"
                />
              </div>
              
              <div className="flex items-end">
                <Button
                  onClick={handleProcess}
                  disabled={processing}
                  className="w-full bg-purple-accent hover:bg-purple-accent/90"
                >
                  {processing ? 'Processing...' : 'Start Processing'}
                </Button>
              </div>
            </div>

            {processing && (
              <div className="space-y-3 p-4 bg-purple-accent/5 rounded-lg border border-purple-accent/20">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">
                    Processing variation {currentVariation} of {numberOfVariations}...
                  </span>
                  <span className="font-mono text-purple-accent">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="w-full" />
                <p className="text-xs text-muted-foreground">
                  {ffmpegLoaded 
                    ? "Applying video transformations and generating variations..." 
                    : "Creating file copies (real processing unavailable)..."
                  }
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Results Section */}
      {variations.length > 0 && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Generated Variations</h3>
              <Badge className="bg-green-500 text-white">
                {variations.length} variations ready
              </Badge>
            </div>

            <div className="space-y-3">
              {variations.map((variation, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-accent/50 rounded-lg border border-purple-accent/20 hover:bg-accent/70 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Play className="h-4 w-4 text-purple-accent" />
                    <div>
                      <span className="font-medium">
                        {uploadedFile?.name.split('.')[0]}_variation_{index + 1}.mp4
                      </span>
                      <p className="text-xs text-muted-foreground">
                        Size: {(variation.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadVariation(variation, index)}
                    className="hover:bg-purple-accent hover:text-white border-purple-accent/30"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              ))}
            </div>

            <Button 
              onClick={downloadAllVariations}
              className="w-full mt-4 bg-green-accent hover:bg-green-accent/90 text-background font-semibold"
            >
              <Download className="h-4 w-4 mr-2" />
              Download All Variations ({variations.length} files)
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};