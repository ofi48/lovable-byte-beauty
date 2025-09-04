import { useState, useCallback, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload, Play, Download, X, Archive, Trash2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { videoProcessor, type VideoProcessingParameters } from "@/utils/videoProcessor";

interface BatchVideoProcessorProps {
  parameters: VideoProcessingParameters;
}

interface QueueItem {
  id: string;
  file: File;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  variations: Blob[];
}

export const BatchVideoProcessor = ({ parameters }: BatchVideoProcessorProps) => {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const [numberOfVariations, setNumberOfVariations] = useState(3);
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const initializeFFmpeg = async () => {
      try {
        await videoProcessor.initialize();
        setFfmpegLoaded(true);
        toast({
          title: "Batch processor ready",
          description: "FFmpeg has been loaded and is ready for batch processing",
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
    const files = Array.from(event.target.files || []);
    const videoFiles = files.filter(file => file.type.startsWith('video/'));
    
    if (videoFiles.length === 0) {
      toast({
        title: "No valid video files",
        description: "Please select video files to add to the queue",
        variant: "destructive",
      });
      return;
    }

    const newItems: QueueItem[] = videoFiles.map(file => ({
      id: `${Date.now()}_${file.name}`,
      file,
      status: 'pending',
      progress: 0,
      variations: []
    }));

    setQueue(prev => [...prev, ...newItems]);
    
    toast({
      title: "Files added to queue",
      description: `Added ${videoFiles.length} video(s) to processing queue`,
    });

    // Reset the input
    event.target.value = '';
  }, [toast]);

  const removeFromQueue = (id: string) => {
    setQueue(prev => prev.filter(item => item.id !== id));
  };

  const clearQueue = () => {
    setQueue([]);
  };

  const processQueue = useCallback(async () => {
    if (queue.length === 0 || processing) return;

    setProcessing(true);

    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      
      // Update status to processing
      setQueue(prev => prev.map(q => 
        q.id === item.id ? { ...q, status: 'processing' as const, progress: 0 } : q
      ));

      try {
        if (ffmpegLoaded) {
          // Real video processing
          const processedVariations = await videoProcessor.generateVariations(
            item.file,
            parameters,
            numberOfVariations,
            (variation, progress) => {
              setQueue(prev => prev.map(q => 
                q.id === item.id ? { ...q, progress } : q
              ));
            }
          );

          // Mark as completed
          setQueue(prev => prev.map(q => 
            q.id === item.id ? { 
              ...q, 
              status: 'completed' as const, 
              variations: processedVariations,
              progress: 100 
            } : q
          ));
        } else {
          // Fallback: simulate processing
          const totalSteps = numberOfVariations * 20;
          for (let step = 0; step <= totalSteps; step++) {
            await new Promise(resolve => setTimeout(resolve, 25));
            const progress = (step / totalSteps) * 100;
            
            setQueue(prev => prev.map(q => 
              q.id === item.id ? { ...q, progress } : q
            ));
          }

          // Create mock variations (copies of original)
          const mockVariations: Blob[] = [];
          for (let j = 0; j < numberOfVariations; j++) {
            const arrayBuffer = await item.file.arrayBuffer();
            const mockVariation = new Blob([arrayBuffer], { type: item.file.type });
            mockVariations.push(mockVariation);
          }

          // Mark as completed
          setQueue(prev => prev.map(q => 
            q.id === item.id ? { 
              ...q, 
              status: 'completed' as const, 
              variations: mockVariations,
              progress: 100 
            } : q
          ));
        }
      } catch (error) {
        console.error(`Processing failed for ${item.file.name}:`, error);
        setQueue(prev => prev.map(q => 
          q.id === item.id ? { ...q, status: 'error' as const } : q
        ));
      }
    }

    setProcessing(false);
    
    const completedCount = queue.filter(q => q.status === 'completed').length;
    toast({
      title: "Batch processing complete",
      description: `Successfully processed ${completedCount} of ${queue.length} videos with ${numberOfVariations} variations each`,
    });
  }, [queue, numberOfVariations, processing, parameters, ffmpegLoaded, toast]);

  const downloadAllAsZip = async () => {
    try {
      const allVariations: Blob[] = [];
      completedItems.forEach(item => {
        allVariations.push(...item.variations);
      });

      await videoProcessor.createZipWithVariations(allVariations, 'batch_processing');
      
      toast({
        title: "Download started",
        description: `Downloading all ${allVariations.length} variations from batch processing`,
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Could not download batch variations. Please try again.",
        variant: "destructive",
      });
    }
  };

  const downloadVideoVariations = async (variations: Blob[], fileName: string) => {
    try {
      const baseFileName = fileName.split('.')[0];
      await videoProcessor.createZipWithVariations(variations, baseFileName);
      
      toast({
        title: "Download started",
        description: `Downloading ${variations.length} variations for ${fileName}`,
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Could not download variations. Please try again.",
        variant: "destructive",
      });
    }
  };

  const completedItems = queue.filter(item => item.status === 'completed');
  const totalVariations = completedItems.reduce((sum, item) => sum + item.variations.length, 0);

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Batch Upload</h3>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-cyan-accent border-cyan-accent">
                Batch Processing
              </Badge>
              {!ffmpegLoaded && (
                <Badge variant="outline" className="text-yellow-accent border-yellow-accent">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Fallback Mode
                </Badge>
              )}
            </div>
          </div>

          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <Label htmlFor="batch-video-upload" className="cursor-pointer">
              <span className="text-lg font-medium text-foreground hover:text-cyan-accent transition-colors">
                Click to upload multiple videos
              </span>
              <p className="text-muted-foreground mt-2">
                Select multiple video files to add them to the processing queue
              </p>
            </Label>
            <Input
              id="batch-video-upload"
              type="file"
              accept="video/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>
      </Card>

      {/* Processing Controls */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Queue Controls</h3>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">
                {queue.length} videos in queue
              </Badge>
              {completedItems.length > 0 && (
                <Badge className="bg-green-500 text-white">
                  {completedItems.length} completed
                </Badge>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Variations per Video</Label>
              <Input
                type="number"
                min="1"
                max="10"
                value={numberOfVariations}
                onChange={(e) => setNumberOfVariations(parseInt(e.target.value) || 1)}
              />
            </div>
            
            <div className="flex items-end">
              <Button
                onClick={processQueue}
                disabled={processing || queue.length === 0}
                className="w-full bg-cyan-accent hover:bg-cyan-accent/90"
              >
                {processing ? 'Processing Queue...' : 'Start Batch Processing'}
              </Button>
            </div>

            <div className="flex items-end">
              <Button
                onClick={clearQueue}
                variant="outline"
                disabled={processing}
                className="w-full hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Queue
              </Button>
            </div>
          </div>

          {totalVariations > 0 && (
            <Button
              onClick={downloadAllAsZip}
              className="w-full bg-green-accent hover:bg-green-accent/90 text-background font-semibold"
            >
              <Archive className="h-4 w-4 mr-2" />
              Download All as ZIP ({totalVariations} variations)
            </Button>
          )}
        </div>
      </Card>

      {/* Queue Display */}
      {queue.length > 0 && (
        <Card className="p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Processing Queue</h3>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {queue.map((item) => (
                <div key={item.id} className="p-4 bg-accent rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Play className="h-5 w-5 text-cyan-accent" />
                      <div>
                        <p className="font-medium text-foreground">{item.file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(item.file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={
                          item.status === 'completed' ? 'default' :
                          item.status === 'processing' ? 'secondary' :
                          item.status === 'error' ? 'destructive' :
                          'outline'
                        }
                        className={
                          item.status === 'completed' ? 'bg-green-500 text-white' :
                          item.status === 'processing' ? 'bg-cyan-accent text-white' : ''
                        }
                      >
                        {item.status}
                      </Badge>
                      
                      {item.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromQueue(item.id)}
                          disabled={processing}
                          className="hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {(item.status === 'processing' || item.status === 'completed') && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{Math.round(item.progress)}%</span>
                      </div>
                      <Progress value={item.progress} className="w-full" />
                    </div>
                  )}

                  {item.status === 'completed' && item.variations.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {item.variations.length} variations generated
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadVideoVariations(item.variations, item.file.name)}
                          className="hover:bg-cyan-accent hover:text-white border-cyan-accent/30"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download ZIP ({item.variations.length} files)
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};