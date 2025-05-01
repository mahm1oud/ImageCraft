import { useState } from 'react';
import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { 
  Loader2, 
  ArrowLeft, 
  Download, 
  RefreshCw, 
  ImageIcon,
  Check,
  Zap
} from 'lucide-react';
import DragDropUpload from '@/components/DragDropUpload';
import { useToast } from '@/hooks/use-toast';
import { imageProcessor } from '@/lib/imageProcessor';
import { ImageFormat } from '@shared/schema';

const CompressTool = () => {
  const { toast } = useToast();
  
  // Image state
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [tempFilePath, setTempFilePath] = useState<string | null>(null);
  const [outputFilePath, setOutputFilePath] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<{ original: number, compressed: number | null }>({ original: 0, compressed: null });
  
  // UI state
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Compression parameters
  const [compressionLevel, setCompressionLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [quality, setQuality] = useState(75); // 75% quality by default
  const [outputFormat, setOutputFormat] = useState<ImageFormat>('jpg');
  
  const qualityByLevel = {
    low: 90,
    medium: 75,
    high: 60
  };
  
  const handleCompressionLevelChange = (level: 'low' | 'medium' | 'high') => {
    setCompressionLevel(level);
    setQuality(qualityByLevel[level]);
  };
  
  const handleFileSelected = async (file: File) => {
    try {
      setIsUploading(true);
      setOriginalFile(file);
      
      // Create object URL for preview
      const objectUrl = URL.createObjectURL(file);
      setOriginalUrl(objectUrl);
      
      // Set file size
      setFileSize({ 
        original: file.size, 
        compressed: null 
      });
      
      // Determine best output format
      const fileName = file.name.toLowerCase();
      if (fileName.endsWith('.png')) {
        setOutputFormat('jpg'); // Usually better compression
      } else if (fileName.endsWith('.gif') || fileName.endsWith('.tiff') || fileName.endsWith('.tif')) {
        setOutputFormat('webp'); // Good compression with quality
      } else {
        // Keep same format for jpg/jpeg/webp
        const ext = fileName.split('.').pop() as ImageFormat;
        if (['jpg', 'jpeg', 'webp'].includes(ext)) {
          setOutputFormat(ext === 'jpeg' ? 'jpg' : ext);
        } else {
          setOutputFormat('jpg'); // Default to jpg
        }
      }
      
      // Upload the image to the server
      const uploadResponse = await imageProcessor.uploadImage(file);
      setTempFilePath(uploadResponse.tempFilePath);
      
      toast({
        title: "Image uploaded",
        description: "Your image is ready to compress"
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "There was an error uploading your image"
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleCompress = async () => {
    if (!tempFilePath) {
      toast({
        variant: "destructive",
        title: "No image to compress",
        description: "Please upload an image first"
      });
      return;
    }
    
    try {
      setIsProcessing(true);
      
      const transformation = {
        operation: 'compress' as const,
        params: {
          quality,
        }
      };
      
      const processResponse = await imageProcessor.processImage(
        tempFilePath,
        transformation,
        outputFormat
      );
      
      setOutputFilePath(processResponse.outputFilePath);
      
      // Update file size information
      setFileSize({
        original: fileSize.original,
        compressed: processResponse.size
      });
      
      // Get the processed image URL
      const filename = processResponse.outputFilePath.split('/').pop();
      if (filename) {
        const downloadUrl = imageProcessor.getDownloadUrl(filename);
        setPreviewUrl(downloadUrl);
      }
      
      toast({
        title: "Image compressed",
        description: `Image has been compressed by ${getSavingsPercent()}%`
      });
    } catch (error) {
      console.error('Error compressing image:', error);
      toast({
        variant: "destructive",
        title: "Compression failed",
        description: "There was an error processing your image"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleDownload = () => {
    if (!outputFilePath) {
      toast({
        variant: "destructive",
        title: "No image to download",
        description: "Please compress an image first"
      });
      return;
    }
    
    try {
      imageProcessor.downloadImage(outputFilePath);
      
      toast({
        title: "Download started",
        description: "Your compressed image is being downloaded"
      });
    } catch (error) {
      console.error('Error downloading image:', error);
      toast({
        variant: "destructive",
        title: "Download failed",
        description: "There was an error downloading your image"
      });
    }
  };
  
  const handleReset = () => {
    if (originalUrl) {
      URL.revokeObjectURL(originalUrl);
    }
    
    setOriginalFile(null);
    setOriginalUrl(null);
    setPreviewUrl(null);
    setTempFilePath(null);
    setOutputFilePath(null);
    setFileSize({ original: 0, compressed: null });
    setQuality(75);
    setCompressionLevel('medium');
  };
  
  // Helper function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) {
      return bytes + ' B';
    } else if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(1) + ' KB';
    } else {
      return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }
  };
  
  // Calculate size savings percentage
  const getSavingsPercent = (): number => {
    if (!fileSize.compressed || fileSize.original === 0) return 0;
    
    const savings = ((fileSize.original - fileSize.compressed) / fileSize.original) * 100;
    return Math.round(savings);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Link href="/tools" className="mr-4">
          <Button variant="outline" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tools
          </Button>
        </Link>
        <h1 className="text-3xl font-bold font-poppins text-textColor">
          <Zap className="inline-block mr-2 text-primary" />
          <span className="text-primary">Compress</span> Image
        </h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Upload & Settings */}
        <div className="lg:col-span-1">
          <Card className="mb-6">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Upload Image</h2>
              
              {!originalFile ? (
                <DragDropUpload 
                  onFileSelected={handleFileSelected} 
                  maxSize={50}
                />
              ) : (
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">
                    {originalFile.name}
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Size: {formatFileSize(fileSize.original)}
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={handleReset}
                    className="w-full"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Upload Another Image
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {originalFile && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Compression Settings</h2>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm text-gray-600 mb-2 block">Compression Level</Label>
                    <RadioGroup 
                      value={compressionLevel} 
                      onValueChange={(value) => handleCompressionLevelChange(value as 'low' | 'medium' | 'high')}
                    >
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <RadioGroupItem 
                            value="low" 
                            id="low" 
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor="low"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                          >
                            <span className="text-sm font-semibold">Low</span>
                            <span className="text-xs">90% quality</span>
                          </Label>
                        </div>
                        <div>
                          <RadioGroupItem 
                            value="medium" 
                            id="medium" 
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor="medium"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                          >
                            <span className="text-sm font-semibold">Medium</span>
                            <span className="text-xs">75% quality</span>
                          </Label>
                        </div>
                        <div>
                          <RadioGroupItem 
                            value="high" 
                            id="high" 
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor="high"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                          >
                            <span className="text-sm font-semibold">High</span>
                            <span className="text-xs">60% quality</span>
                          </Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div>
                    <div className="flex justify-between">
                      <Label htmlFor="quality" className="text-sm text-gray-600 mb-1">
                        Custom Quality: {quality}%
                      </Label>
                    </div>
                    <Slider
                      id="quality"
                      min={10}
                      max={100}
                      step={1}
                      value={[quality]}
                      onValueChange={(values) => {
                        setQuality(values[0]);
                        // Update compression level based on quality
                        if (values[0] >= 85) {
                          setCompressionLevel('low');
                        } else if (values[0] >= 65) {
                          setCompressionLevel('medium');
                        } else {
                          setCompressionLevel('high');
                        }
                      }}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Smaller file</span>
                      <span>Better quality</span>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Output Format:</span>
                      <span className="text-sm font-bold">{outputFormat.toUpperCase()}</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      We automatically select the best format for maximum compression while preserving quality.
                    </p>
                  </div>
                  
                  <Button
                    onClick={handleCompress}
                    disabled={isProcessing || !tempFilePath}
                    className="w-full"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Compressing...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-4 w-4" />
                        Compress Image
                      </>
                    )}
                  </Button>
                  
                  {fileSize.compressed && (
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h3 className="font-medium text-lg text-green-700 mb-2 flex items-center">
                        <Check className="mr-2 h-5 w-5" />
                        Compression Results
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Original size:</span>
                            <span className="text-sm font-medium">{formatFileSize(fileSize.original)}</span>
                          </div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">New size:</span>
                            <span className="text-sm font-medium">{formatFileSize(fileSize.compressed)}</span>
                          </div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Space saved:</span>
                            <span className="text-sm font-bold text-green-600">{getSavingsPercent()}%</span>
                          </div>
                        </div>
                        
                        <Progress value={getSavingsPercent()} className="h-2" />
                        
                        <Button
                          variant="default"
                          onClick={handleDownload}
                          className="w-full"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download Compressed Image
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Right Panel - Preview */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardContent className="p-6 h-full">
              <h2 className="text-xl font-semibold mb-4">Preview</h2>
              
              {isUploading ? (
                <div className="flex flex-col items-center justify-center h-96">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                  <p>Uploading image...</p>
                </div>
              ) : originalUrl ? (
                <div className="bg-gray-900 rounded-lg overflow-hidden h-full">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
                    <div className="flex flex-col">
                      <div className="text-white text-center py-2 bg-gray-800 rounded-t-lg">
                        Original ({formatFileSize(fileSize.original)})
                      </div>
                      <div className="flex-1 flex items-center justify-center bg-gray-700 p-4">
                        <img
                          src={originalUrl}
                          alt="Original"
                          className="max-h-[400px] object-contain"
                        />
                      </div>
                    </div>
                    
                    <div className="flex flex-col">
                      <div className="text-white text-center py-2 bg-gray-800 rounded-t-lg">
                        {previewUrl ? (
                          <>Compressed ({formatFileSize(fileSize.compressed || 0)})</>
                        ) : (
                          <>After Compression (Preview)</>
                        )}
                      </div>
                      <div className="flex-1 flex items-center justify-center bg-gray-700 p-4">
                        {previewUrl ? (
                          <img
                            src={previewUrl}
                            alt="Compressed"
                            className="max-h-[400px] object-contain"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-gray-300">
                            <ImageIcon className="h-16 w-16 mb-4 opacity-50" />
                            <p>Click "Compress Image" to see result</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-96 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                  <ImageIcon className="h-16 w-16 text-gray-400 mb-4" />
                  <p className="text-gray-500">
                    Upload an image to compress
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CompressTool;