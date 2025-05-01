import { useState, useRef, useEffect } from 'react';
import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Loader2, Crop, ArrowLeft, Download, RefreshCw } from 'lucide-react';
import DragDropUpload from '@/components/DragDropUpload';
import { useToast } from '@/hooks/use-toast';
import { imageProcessor } from '@/lib/imageProcessor';
import { ImageFormat } from '@shared/schema';

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

const CropTool = () => {
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
  const [isCropping, setIsCropping] = useState(false);
  
  // Cropping state
  const [cropArea, setCropArea] = useState<CropArea | null>(null);
  const [outputFormat, setOutputFormat] = useState<ImageFormat>('jpg');
  const [quality, setQuality] = useState(80);
  
  // Refs
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const cropBoxRef = useRef<HTMLDivElement>(null);
  const dragStartPosRef = useRef<{ x: number, y: number } | null>(null);
  
  // Initialize crop area when image is loaded
  useEffect(() => {
    if (originalDimensions && imageRef.current) {
      const imageWidth = imageRef.current.width;
      const imageHeight = imageRef.current.height;
      
      // Start with a centered crop box at 80% of the image dimensions
      setCropArea({
        x: imageWidth * 0.1,
        y: imageHeight * 0.1,
        width: imageWidth * 0.8,
        height: imageHeight * 0.8
      });
    }
  }, [originalDimensions]);
  
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
      };
      img.src = objectUrl;
      
      // Upload the image to the server
      const uploadResponse = await imageProcessor.uploadImage(file);
      setTempFilePath(uploadResponse.tempFilePath);
      
      toast({
        title: "Image uploaded",
        description: "Your image is ready to crop"
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
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!cropBoxRef.current || !imageContainerRef.current) return;
    
    setIsCropping(true);
    
    const cropBox = cropBoxRef.current.getBoundingClientRect();
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    
    // Determine if we're dragging a handle or the whole box
    const isOnRightEdge = mouseX >= cropBox.right - 10 && mouseX <= cropBox.right + 10;
    const isOnLeftEdge = mouseX >= cropBox.left - 10 && mouseX <= cropBox.left + 10;
    const isOnTopEdge = mouseY >= cropBox.top - 10 && mouseY <= cropBox.top + 10;
    const isOnBottomEdge = mouseY >= cropBox.bottom - 10 && mouseY <= cropBox.bottom + 10;
    
    const isResizing = isOnRightEdge || isOnLeftEdge || isOnTopEdge || isOnBottomEdge;
    
    // If not resizing, we're moving the whole box
    if (!isResizing) {
      dragStartPosRef.current = { 
        x: mouseX - cropBox.left, 
        y: mouseY - cropBox.top 
      };
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isCropping || !cropBoxRef.current || !imageContainerRef.current || !cropArea) return;
    
    const containerRect = imageContainerRef.current.getBoundingClientRect();
    
    if (dragStartPosRef.current) {
      // Moving the whole box
      const newX = e.clientX - containerRect.left - dragStartPosRef.current.x;
      const newY = e.clientY - containerRect.top - dragStartPosRef.current.y;
      
      // Ensure crop box stays within the image
      const constrainedX = Math.max(0, Math.min(newX, containerRect.width - cropArea.width));
      const constrainedY = Math.max(0, Math.min(newY, containerRect.height - cropArea.height));
      
      setCropArea({
        ...cropArea,
        x: constrainedX,
        y: constrainedY
      });
    }
  };
  
  const handleMouseUp = () => {
    setIsCropping(false);
    dragStartPosRef.current = null;
  };
  
  const handleCrop = async () => {
    if (!tempFilePath || !cropArea || !originalDimensions || !imageRef.current) {
      toast({
        variant: "destructive",
        title: "Invalid crop area",
        description: "Please select a valid area to crop"
      });
      return;
    }
    
    try {
      setIsProcessing(true);
      
      // Calculate the actual crop coordinates relative to the original image dimensions
      const imageElement = imageRef.current;
      const displayWidth = imageElement.width;
      const displayHeight = imageElement.height;
      
      // Calculate scale factors between displayed image and original dimensions
      const scaleX = originalDimensions.width / displayWidth;
      const scaleY = originalDimensions.height / displayHeight;
      
      // Convert crop area to original image coordinates
      const originalCropArea = {
        left: Math.round(cropArea.x * scaleX),
        top: Math.round(cropArea.y * scaleY),
        width: Math.round(cropArea.width * scaleX),
        height: Math.round(cropArea.height * scaleY)
      };
      
      const transformation = {
        operation: 'crop' as const,
        params: {
          left: originalCropArea.left,
          top: originalCropArea.top,
          cropWidth: originalCropArea.width,
          cropHeight: originalCropArea.height
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
        title: "Image cropped",
        description: `New dimensions: ${processResponse.width}x${processResponse.height}`
      });
    } catch (error) {
      console.error('Error cropping image:', error);
      toast({
        variant: "destructive",
        title: "Crop failed",
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
        description: "Please crop an image first"
      });
      return;
    }
    
    try {
      imageProcessor.downloadImage(outputFilePath);
      
      toast({
        title: "Download started",
        description: "Your cropped image is being downloaded"
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
    setOriginalDimensions(null);
    setPreviewUrl(null);
    setTempFilePath(null);
    setOutputFilePath(null);
    setCropArea(null);
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
          <span className="text-primary">Crop</span> Image
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
                <h2 className="text-xl font-semibold mb-4">Crop Settings</h2>
                
                <div className="space-y-4">
                  {cropArea && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="crop-width" className="block text-sm text-gray-600 mb-1">Width (px)</Label>
                          <Input
                            id="crop-width"
                            type="number"
                            value={Math.round(cropArea.width)}
                            onChange={(e) => setCropArea({
                              ...cropArea,
                              width: Number(e.target.value)
                            })}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <Label htmlFor="crop-height" className="block text-sm text-gray-600 mb-1">Height (px)</Label>
                          <Input
                            id="crop-height"
                            type="number"
                            value={Math.round(cropArea.height)}
                            onChange={(e) => setCropArea({
                              ...cropArea,
                              height: Number(e.target.value)
                            })}
                            className="w-full"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="crop-x" className="block text-sm text-gray-600 mb-1">X Position</Label>
                          <Input
                            id="crop-x"
                            type="number"
                            value={Math.round(cropArea.x)}
                            onChange={(e) => setCropArea({
                              ...cropArea,
                              x: Number(e.target.value)
                            })}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <Label htmlFor="crop-y" className="block text-sm text-gray-600 mb-1">Y Position</Label>
                          <Input
                            id="crop-y"
                            type="number"
                            value={Math.round(cropArea.y)}
                            onChange={(e) => setCropArea({
                              ...cropArea,
                              y: Number(e.target.value)
                            })}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </>
                  )}
                  
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
                    <p className="text-xs text-gray-500 mt-1">
                      Higher quality = larger file size
                    </p>
                  </div>
                  
                  <Button
                    onClick={handleCrop}
                    disabled={isProcessing || !tempFilePath || !cropArea}
                    className="w-full"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Crop Image'
                    )}
                  </Button>
                  
                  {previewUrl && (
                    <Button
                      variant="outline"
                      onClick={handleDownload}
                      className="w-full"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Cropped Image
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
              ) : previewUrl ? (
                <div className="bg-gray-900 rounded-lg overflow-hidden flex justify-center items-center h-full">
                  <img
                    src={previewUrl}
                    alt="Cropped"
                    className="max-h-[600px] object-contain"
                  />
                </div>
              ) : originalUrl ? (
                <div 
                  ref={imageContainerRef}
                  className="bg-gray-900 rounded-lg overflow-hidden flex justify-center items-center h-full relative"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  <img
                    ref={imageRef}
                    src={originalUrl}
                    alt="Original"
                    className="max-h-[600px] object-contain"
                  />
                  
                  {cropArea && (
                    <div
                      ref={cropBoxRef}
                      className="absolute border-2 border-white border-dashed cursor-move"
                      style={{
                        left: cropArea.x,
                        top: cropArea.y,
                        width: cropArea.width,
                        height: cropArea.height
                      }}
                    >
                      {/* Resize handles */}
                      <div className="absolute top-0 left-0 w-3 h-3 bg-white cursor-nwse-resize"></div>
                      <div className="absolute top-0 right-0 w-3 h-3 bg-white cursor-nesw-resize"></div>
                      <div className="absolute bottom-0 left-0 w-3 h-3 bg-white cursor-nesw-resize"></div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-white cursor-nwse-resize"></div>
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

export default CropTool;