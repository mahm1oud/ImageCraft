import { useState } from 'react';
import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { 
  Loader2, 
  RotateCw, 
  RotateCcw, 
  ArrowLeft, 
  Download, 
  RefreshCw, 
  FlipHorizontal, 
  FlipVertical 
} from 'lucide-react';
import DragDropUpload from '@/components/DragDropUpload';
import { useToast } from '@/hooks/use-toast';
import { imageProcessor } from '@/lib/imageProcessor';
import { ImageFormat } from '@shared/schema';

const RotateTool = () => {
  const { toast } = useToast();
  
  // Image state
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [tempFilePath, setTempFilePath] = useState<string | null>(null);
  const [outputFilePath, setOutputFilePath] = useState<string | null>(null);
  
  // UI state
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Rotation parameters
  const [angle, setAngle] = useState(0);
  const [flipX, setFlipX] = useState(false);
  const [flipY, setFlipY] = useState(false);
  const [outputFormat, setOutputFormat] = useState<ImageFormat>('jpg');
  const [quality, setQuality] = useState(90);
  
  const handleFileSelected = async (file: File) => {
    try {
      setIsUploading(true);
      setOriginalFile(file);
      
      // Create object URL for preview
      const objectUrl = URL.createObjectURL(file);
      setOriginalUrl(objectUrl);
      
      // Upload the image to the server
      const uploadResponse = await imageProcessor.uploadImage(file);
      setTempFilePath(uploadResponse.tempFilePath);
      
      toast({
        title: "Image uploaded",
        description: "Your image is ready to rotate"
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
  
  const handleRotate90CW = () => {
    setAngle(prevAngle => (prevAngle + 90) % 360);
  };
  
  const handleRotate90CCW = () => {
    setAngle(prevAngle => (prevAngle - 90) % 360);
  };
  
  const handleFlipHorizontal = () => {
    setFlipX(prev => !prev);
  };
  
  const handleFlipVertical = () => {
    setFlipY(prev => !prev);
  };
  
  const handleProcessImage = async () => {
    if (!tempFilePath) {
      toast({
        variant: "destructive",
        title: "No image to process",
        description: "Please upload an image first"
      });
      return;
    }
    
    try {
      setIsProcessing(true);
      
      // Calculate the combined angle based on rotation and flips
      let effectiveAngle = angle;
      
      // For the Sharp library, we need to handle flips separately from rotation
      // Here we adjust the parameters that will be sent to the backend
      
      const transformation = {
        operation: 'rotate' as const,
        params: {
          angle: effectiveAngle,
          flipX,
          flipY,
          quality
        }
      };
      
      const processResponse = await imageProcessor.processImage(
        tempFilePath,
        transformation,
        outputFormat
      );
      
      setOutputFilePath(processResponse.outputFilePath);
      
      // Get the processed image URL
      const filename = processResponse.outputFilePath.split('/').pop();
      if (filename) {
        const downloadUrl = imageProcessor.getDownloadUrl(filename);
        setPreviewUrl(downloadUrl);
      }
      
      toast({
        title: "Image rotated",
        description: `Applied ${angle}° rotation`
      });
    } catch (error) {
      console.error('Error rotating image:', error);
      toast({
        variant: "destructive",
        title: "Rotation failed",
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
        description: "Please rotate an image first"
      });
      return;
    }
    
    try {
      imageProcessor.downloadImage(outputFilePath);
      
      toast({
        title: "Download started",
        description: "Your rotated image is being downloaded"
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
    setAngle(0);
    setFlipX(false);
    setFlipY(false);
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
          <RotateCw className="inline-block mr-2 text-primary" />
          <span className="text-primary">Rotate</span> Image
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
                  <p className="text-sm text-gray-500 mb-4">
                    {originalFile.name} ({Math.round(originalFile.size / 1024)} KB)
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
                <h2 className="text-xl font-semibold mb-4">Rotation Settings</h2>
                
                <div className="space-y-4">
                  <div className="flex justify-center space-x-2 mb-6">
                    <Button onClick={handleRotate90CCW} variant="outline" size="icon" className="h-10 w-10">
                      <RotateCcw className="h-5 w-5" />
                    </Button>
                    <Button onClick={handleRotate90CW} variant="outline" size="icon" className="h-10 w-10">
                      <RotateCw className="h-5 w-5" />
                    </Button>
                    <Button onClick={handleFlipHorizontal} variant="outline" size="icon" className="h-10 w-10">
                      <FlipHorizontal className="h-5 w-5" />
                    </Button>
                    <Button onClick={handleFlipVertical} variant="outline" size="icon" className="h-10 w-10">
                      <FlipVertical className="h-5 w-5" />
                    </Button>
                  </div>
                  
                  <div>
                    <Label htmlFor="angle" className="block text-sm text-gray-600 mb-1">
                      Angle: {angle}°
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="angle"
                        type="number"
                        value={angle}
                        onChange={(e) => setAngle(parseInt(e.target.value) || 0)}
                        className="w-full"
                        min={-360}
                        max={360}
                        step={1}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="angle-slider" className="block text-sm text-gray-600 mb-1">
                      Fine-tune angle
                    </Label>
                    <Slider
                      id="angle-slider"
                      min={-180}
                      max={180}
                      step={1}
                      value={[angle]}
                      onValueChange={(values) => setAngle(values[0])}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="py-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm text-gray-600">Horizontal Flip</Label>
                      <div className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer ${flipX ? 'bg-primary' : 'bg-gray-300'}`} onClick={handleFlipHorizontal}>
                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${flipX ? 'translate-x-5' : ''}`}></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm text-gray-600">Vertical Flip</Label>
                      <div className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer ${flipY ? 'bg-primary' : 'bg-gray-300'}`} onClick={handleFlipVertical}>
                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${flipY ? 'translate-x-5' : ''}`}></div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="quality" className="block text-sm text-gray-600 mb-1">
                      Quality: {quality}%
                    </Label>
                    <Slider
                      id="quality"
                      min={1}
                      max={100}
                      step={1}
                      value={[quality]}
                      onValueChange={(values) => setQuality(values[0])}
                      className="w-full"
                    />
                  </div>
                  
                  <Button
                    onClick={handleProcessImage}
                    disabled={isProcessing || !tempFilePath}
                    className="w-full"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Apply Rotation'
                    )}
                  </Button>
                  
                  {previewUrl && (
                    <Button
                      variant="outline"
                      onClick={handleDownload}
                      className="w-full"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Rotated Image
                    </Button>
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
                <div className="bg-gray-900 rounded-lg overflow-hidden h-full flex justify-center items-center">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Rotated"
                      className="max-h-[600px] object-contain"
                    />
                  ) : (
                    <div className="relative inline-block">
                      <img
                        src={originalUrl}
                        alt="Original"
                        className="max-h-[600px] object-contain"
                        style={{
                          transform: `rotate(${angle}deg) scaleX(${flipX ? -1 : 1}) scaleY(${flipY ? -1 : 1})`,
                          transformOrigin: 'center center'
                        }}
                      />
                      {/* Live preview overlay with "Preview" text */}
                      <div className="absolute top-4 right-4 bg-black bg-opacity-60 text-white text-xs py-1 px-2 rounded">
                        Preview (Live)
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-96 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                  <p className="text-gray-500">
                    Upload an image to see preview
                  </p>
                </div>
              )}
              
              {angle !== 0 || flipX || flipY ? (
                <div className="mt-4 bg-blue-50 p-3 rounded-lg text-center text-blue-700 text-sm">
                  Applied: {angle !== 0 ? `${angle}° rotation` : ''}
                  {angle !== 0 && (flipX || flipY) ? ', ' : ''}
                  {flipX && 'horizontal flip'}
                  {flipX && flipY ? ', ' : ''}
                  {flipY && 'vertical flip'}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RotateTool;