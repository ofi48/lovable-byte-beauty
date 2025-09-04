import { useState, useCallback, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload, Play, Download, X, AlertCircle, CheckCircle, Monitor, Cpu, Palette } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { videoProcessorEnhanced, type VideoProcessingParameters, type ProcessingResult } from "@/utils/videoProcessorEnhanced";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EnhancedSingleVideoProcessorProps {
  parameters: VideoProcessingParameters;
}

export const EnhancedSingleVideoProcessor = ({ parameters }: EnhancedSingleVideoProcessorProps) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentVariation, setCurrentVariation] = useState(0);
  const [results, setResults] = useState<ProcessingResult[]>([]);
  const [numberOfVariations, setNumberOfVariations] = useState(3);
  const [capabilities, setCapabilities] = useState({ ffmpeg: false, webcodecs: false, canvas: true });
  const [initializationStatus, setInitializationStatus] = useState<'idle' | 'loading' | 'success' | 'failed'>('idle');
  const { toast } = useToast();

  useEffect(() => {
    const initializeProcessor = async () => {
      setInitializationStatus('loading');
      try {
        await videoProcessorEnhanced.initialize();
        const caps = videoProcessorEnhanced.capabilities;
        setCapabilities(caps);
        setInitializationStatus('success');
        
        toast({
          title: "Video processor ready",
          description: `FFmpeg loaded successfully ${caps.ffmpeg ? 'with full threading support' : 'in fallback mode'}`,
        });
      } catch (error) {
        console.error('Failed to initialize video processor:', error);
        const caps = videoProcessorEnhanced.capabilities;
        setCapabilities(caps);
        setInitializationStatus('failed');
        
        toast({
          title: "Processing engine limited",
          description: `FFmpeg unavailable. Using ${caps.webcodecs ? 'WebCodecs' : 'Canvas'} fallback.`,
          variant: "destructive",
        });
      }
    };

    initializeProcessor();
  }, [toast]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('video/')) {
        setUploadedFile(file);
        setResults([]);
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
    setResults([]);

    try {
      const processedResults = await videoProcessorEnhanced.generateVariations(
        uploadedFile,
        parameters,
        numberOfVariations,
        (variation, progress) => {
          setCurrentVariation(variation);
          setProgress(progress);
        }
      );
      
      setResults(processedResults);
      
      const engine = capabilities.ffmpeg ? 'FFmpeg' : capabilities.webcodecs ? 'WebCodecs' : 'Canvas';
      toast({
        title: "Processing complete",
        description: `Generated ${numberOfVariations} variations using ${engine}`,
      });
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
  }, [uploadedFile, numberOfVariations, parameters, capabilities, toast]);

  const removeFile = () => {
    setUploadedFile(null);
    setResults([]);
    setProgress(0);
    setCurrentVariation(0);
  };

  const downloadResult = async (result: ProcessingResult, index: number) => {
    try {
      const filename = `${uploadedFile?.name.split('.')[0]}_variation_${index + 1}.webm`;
      await videoProcessorEnhanced.downloadBlob(result.output_url, filename);
      
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

  const downloadAllResults = async () => {
    if (results.length === 0) return;
    
    try {
      const baseFileName = uploadedFile?.name.split('.')[0] || 'video';
      await videoProcessorEnhanced.createZipWithVariations(results, baseFileName);
      
      toast({
        title: "Download started",
        description: `Downloading all ${results.length} variations with metadata`,
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Could not download variations. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getEngineIcon = () => {
    if (capabilities.ffmpeg) return <Cpu className="h-4 w-4" />;
    if (capabilities.webcodecs) return <Monitor className="h-4 w-4" />;
    return <Palette className="h-4 w-4" />;
  };

  const getEngineLabel = () => {
    if (capabilities.ffmpeg) return "FFmpeg.wasm";
    if (capabilities.webcodecs) return "WebCodecs";
    return "Canvas";
  };

  const getStatusBadge = () => {
    switch (initializationStatus) {
      case 'loading':
        return <Badge variant="outline" className="text-blue-accent border-blue-accent">Initializing...</Badge>;
      case 'success':
        return (
          <Badge variant="outline" className="text-green-accent border-green-accent">
            <CheckCircle className="h-3 w-3 mr-1" />
            {getEngineLabel()}
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="outline" className="text-yellow-accent border-yellow-accent">
            <AlertCircle className="h-3 w-3 mr-1" />
            {getEngineLabel()} Fallback
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Enhanced Video Processing</h3>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-purple-accent border-purple-accent">
                <Play className="h-3 w-3 mr-1" />
                Single Mode
              </Badge>
              {getStatusBadge()}
            </div>
          </div>

          {!uploadedFile ? (
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <Label htmlFor="enhanced-video-upload" className="cursor-pointer">
                <span className="text-lg font-medium text-foreground hover:text-purple-accent transition-colors">
                  Click to upload video
                </span>
                <p className="text-muted-foreground mt-2">
                  Supported formats: MP4, AVI, MOV, MKV, WebM
                </p>
              </Label>
              <Input
                id="enhanced-video-upload"
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
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Processing Controls</h3>
              <div className="flex items-center gap-2">
                {getEngineIcon()}
                <span className="text-sm text-muted-foreground">Powered by {getEngineLabel()}</span>
              </div>
            </div>
            
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
                  disabled={processing || initializationStatus === 'loading'}
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
                  Applying video transformations using {getEngineLabel()}...
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Results Section */}
      {results.length > 0 && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Generated Variations</h3>
              <Badge className="bg-green-500 text-white">
                {results.length} variations ready
              </Badge>
            </div>

            <Tabs defaultValue="grid" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="grid">Grid View</TabsTrigger>
                <TabsTrigger value="details">Details View</TabsTrigger>
              </TabsList>
              
              <TabsContent value="grid" className="space-y-3">
                {results.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-accent/50 rounded-lg border border-purple-accent/20 hover:bg-accent/70 transition-colors">
                    <div className="flex items-center space-x-3">
                      <Play className="h-4 w-4 text-purple-accent" />
                      <div>
                        <span className="font-medium">
                          Variation {index + 1}
                        </span>
                        <p className="text-xs text-muted-foreground">
                          {(result.metadata.size / (1024 * 1024)).toFixed(2)} MB • 
                          {result.metadata.format.toUpperCase()} • 
                          {result.metadata.processing_time}ms
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadResult(result, index)}
                      className="hover:bg-purple-accent hover:text-white border-purple-accent/30"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="details" className="space-y-4">
                {results.map((result, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Variation {index + 1}</h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadResult(result, index)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Size:</span>
                          <p className="font-mono">{(result.metadata.size / (1024 * 1024)).toFixed(2)} MB</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Format:</span>
                          <p className="font-mono">{result.metadata.format.toUpperCase()}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Processing Time:</span>
                          <p className="font-mono">{result.metadata.processing_time}ms</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Filters Applied:</span>
                          <p className="font-mono">{result.applied_filters.length}</p>
                        </div>
                      </div>

                      {result.applied_filters.length > 0 && (
                        <div>
                          <span className="text-muted-foreground text-sm">Applied Filters:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {result.applied_filters.map((filter, filterIndex) => (
                              <Badge key={filterIndex} variant="secondary" className="text-xs">
                                {filter}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>

            <Button 
              onClick={downloadAllResults}
              className="w-full mt-4 bg-green-accent hover:bg-green-accent/90 text-background font-semibold"
            >
              <Download className="h-4 w-4 mr-2" />
              Download All Variations ({results.length} files + metadata)
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};