import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload, Play, Download, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SingleVideoProcessorProps {
  parameters: any;
}

export const SingleVideoProcessor = ({ parameters }: SingleVideoProcessorProps) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [variations, setVariations] = useState<string[]>([]);
  const [numberOfVariations, setNumberOfVariations] = useState(3);
  const { toast } = useToast();

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
    setVariations([]);

    // Simulate processing with progress
    const totalSteps = numberOfVariations * 10;
    for (let i = 0; i <= totalSteps; i++) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setProgress((i / totalSteps) * 100);
    }

    // Generate mock variation URLs
    const mockVariations = Array.from({ length: numberOfVariations }, (_, i) => 
      `processed_${uploadedFile.name.split('.')[0]}_variation_${i + 1}.mp4`
    );
    
    setVariations(mockVariations);
    setProcessing(false);
    
    toast({
      title: "Processing complete",
      description: `Generated ${numberOfVariations} variations successfully`,
    });
  }, [uploadedFile, numberOfVariations, toast]);

  const removeFile = () => {
    setUploadedFile(null);
    setVariations([]);
    setProgress(0);
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Upload Video</h3>
            <Badge variant="outline" className="text-purple-accent border-purple-accent">
              Single Processing
            </Badge>
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
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Processing variations...</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="w-full" />
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
                <div key={index} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Play className="h-4 w-4 text-purple-accent" />
                    <span className="font-medium">{variation}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="hover:bg-purple-accent hover:text-white"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              ))}
            </div>

            <Button className="w-full mt-4 bg-green-500 hover:bg-green-600">
              <Download className="h-4 w-4 mr-2" />
              Download All Variations
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};