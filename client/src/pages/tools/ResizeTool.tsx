import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Crop, ArrowLeft, Download, RefreshCw } from 'lucide-react';
import DragDropUpload from '@/components/DragDropUpload';
import SplitScreenPreview from '@/components/SplitScreenPreview';
import { useToast } from '@/hooks/use-toast';
import { imageProcessor } from '@/lib/imageProcessor';
import { ImageFormat } from '@shared/schema';

const ResizeTool = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Image state
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number, height: number } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [tempFilePath, setTempFilePath] = useState<string | null>(null);
  const [outputFilePath, setOutputFilePath] = useState<string | null>(null);
  
  // UI state
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Resize parameters
  const [width, setWidth] = useState<number | ''>('');
  const [height, setHeight] = useState<number | ''>('');
  const [maintainAspect, setMaintainAspect] = useState(true);
  const [fitMethod, setFitMethod] = useState('contain');
  const [outputFormat, setOutputFormat] = useState<ImageFormat>('jpg');
  const [quality, setQuality] = useState(80);
  
  // Update dimensions while maintaining aspect ratio
  useEffect(() => {
    if (!maintainAspect || !originalDimensions) return;
    
    const originalRatio = originalDimensions.width / originalDimensions.height;

    if (typeof width === 'number' && width > 0 && height !== originalDimensions.height) {
      const calculatedHeight = Math.round(width / originalRatio);
      setHeight(calculatedHeight);
    } else if (typeof height === 'number' && height > 0 && width !== originalDimensions.width) {
      const calculatedWidth = Math.round(height * originalRatio);
      setWidth(calculatedWidth);
    }
  }, [width, height, maintainAspect, originalDimensions]);
  
  const handleFileSelected = async (file: File) => {
    try {
      setIsUploading(true);
      setOriginalFile(file);
      
      // Create object URL for preview
      const objectUrl = URL.createObjectURL(file);
      setOriginalUrl(objectUrl);
      
      // Get image dimensions
      const img = new Image();
      img.onload = () => {
        setOriginalDimensions({ width: img.width, height: img.height });
        setWidth(img.width);
        setHeight(img.height);
      };
      img.src = objectUrl;
      
      // Upload the image to the server
      const uploadResponse = await imageProcessor.uploadImage(file);
      setTempFilePath(uploadResponse.tempFilePath);
      
      toast({
        title: "Image uploaded",
        description: "Your image is ready to resize"
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
  
  const handleResize = async () => {
    if (!tempFilePath || typeof width !== 'number' || typeof height !== 'number') {
      toast({
        variant: "destructive",
        title: "Invalid parameters",
        description: "Please provide valid width and height values"
      });
      return;
    }
    
    try {
      setIsProcessing(true);
      
      const transformation = {
        operation: 'resize' as const,
        params: {
          width,
          height,
          fit: fitMethod,
          maintainAspect
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
        title: "Image resized",
        description: `New dimensions: ${processResponse.width}x${processResponse.height}`
      });
    } catch (error) {
      console.error('Error resizing image:', error);
      toast({
        variant: "destructive",
        title: "Resize failed",
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
        description: "Please resize an image first"
      });
      return;
    }
    
    try {
      imageProcessor.downloadImage(outputFilePath);
      
      toast({
        title: "Download started",
        description: "Your resized image is being downloaded"
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
    if (previewUrl) {
      // For server URLs we don't need to revoke
    }
    
    setOriginalFile(null);
    setOriginalUrl(null);
    setOriginalDimensions(null);
    setPreviewUrl(null);
    setTempFilePath(null);
    setOutputFilePath(null);
    setWidth('');
    setHeight('');
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
          <Crop className="inline-block mr-2 text-primary" />
          <span className="text-primary">Resize</span> Image
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
                    {originalFile.name} ({Math.round(originalFile.size / 1024)} KB)
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Original: {originalDimensions?.width} × {originalDimensions?.height}
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
                <h2 className="text-xl font-semibold mb-4">Resize Settings</h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="width" className="block text-sm text-gray-600 mb-1">Width (px)</Label>
                      <Input
                        id="width"
                        type="number"
                        value={width === '' ? '' : width}
                        onChange={(e) => setWidth(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Label htmlFor="height" className="block text-sm text-gray-600 mb-1">Height (px)</Label>
                      <Input
                        id="height"
                        type="number"
                        value={height === '' ? '' : height}
                        onChange={(e) => setHeight(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Checkbox
                      id="maintain-aspect"
                      checked={maintainAspect}
                      onCheckedChange={(checked) => setMaintainAspect(!!checked)}
                    />
                    <Label htmlFor="maintain-aspect" className="ml-2 text-sm text-gray-600">
                      Maintain aspect ratio
                    </Label>
                  </div>
                  
                  <div>
                    <Label htmlFor="fit-method" className="block text-sm text-gray-600 mb-1">
                      Resize method
                    </Label>
                    <Select
                      value={fitMethod}
                      onValueChange={setFitMethod}
                    >
                      <SelectTrigger id="fit-method">
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="contain">Standard (good quality)</SelectItem>
                        <SelectItem value="cover">Cover (fill area)</SelectItem>
                        <SelectItem value="fill">Fill (stretch to fit)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="output-format" className="block text-sm text-gray-600 mb-1">
                      Output Format
                    </Label>
                    <Select
                      value={outputFormat}
                      onValueChange={(value) => setOutputFormat(value as ImageFormat)}
                    >
                      <SelectTrigger id="output-format">
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="jpg">JPG</SelectItem>
                        <SelectItem value="png">PNG</SelectItem>
                        <SelectItem value="webp">WebP</SelectItem>
                        <SelectItem value="gif">GIF</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="quality" className="block text-sm text-gray-600 mb-1">
                      Quality: {quality}%
                    </Label>
                    <Input
                      id="quality"
                      type="range"
                      min="1"
                      max="100"
                      value={quality}
                      onChange={(e) => setQuality(Number(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Higher quality = larger file size
                    </p>
                  </div>
                  
                  <Button
                    onClick={handleResize}
                    disabled={isProcessing || !tempFilePath}
                    className="w-full"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Resize Image'
                    )}
                  </Button>
                  
                  {previewUrl && (
                    <Button
                      variant="outline"
                      onClick={handleDownload}
                      className="w-full"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Resized Image
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
                <div className="bg-gray-900 rounded-lg overflow-hidden">
                  {previewUrl ? (
                    <SplitScreenPreview
                      originalImage={originalUrl}
                      previewImage={previewUrl}
                      alt={originalFile?.name || 'Preview'}
                    />
                  ) : (
                    <div className="flex justify-center p-4">
                      <img
                        src={originalUrl}
                        alt="Original"
                        className="max-h-[600px] object-contain"
                      />
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ResizeTool;