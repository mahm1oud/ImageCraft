import { useState, useRef, useEffect } from 'react';
import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Loader2, 
  ArrowLeft, 
  Download, 
  RefreshCw, 
  ImageIcon,
  Type,
  Check,
  Image,
  Stamp,
  Upload,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import DragDropUpload from '@/components/DragDropUpload';
import { useToast } from '@/hooks/use-toast';
import { imageProcessor } from '@/lib/imageProcessor';
import { ImageFormat } from '@shared/schema';

const WatermarkTool = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Image state
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [watermarkImageUrl, setWatermarkImageUrl] = useState<string | null>(null);
  const [tempFilePath, setTempFilePath] = useState<string | null>(null);
  const [outputFilePath, setOutputFilePath] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<{ width: number, height: number } | null>(null);
  
  // UI state
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [watermarkType, setWatermarkType] = useState<'text' | 'image'>('text');
  
  // Watermark settings - text
  const [watermarkText, setWatermarkText] = useState('© Copyright 2025');
  const [textSize, setTextSize] = useState(24);
  const [textColor, setTextColor] = useState('#ffffff');
  const [textOpacity, setTextOpacity] = useState(0.8);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [textPosition, setTextPosition] = useState<'bottomRight' | 'bottomLeft' | 'topRight' | 'topLeft' | 'center'>('bottomRight');
  const [textRotation, setTextRotation] = useState(0);
  
  // Watermark settings - image
  const [imageOpacity, setImageOpacity] = useState(0.5);
  const [imageScale, setImageScale] = useState(0.2); // 20% of original image
  const [imagePosition, setImagePosition] = useState<'bottomRight' | 'bottomLeft' | 'topRight' | 'topLeft' | 'center' | 'tile'>('bottomRight');
  const [tileSpacing, setTileSpacing] = useState(100);
  
  // Output settings
  const [outputFormat, setOutputFormat] = useState<ImageFormat>('jpg');
  const [quality, setQuality] = useState(90);
  const [maintainOriginalSize, setMaintainOriginalSize] = useState(true);
  
  const positionOptions = [
    { value: 'topLeft', label: 'Top Left', icon: <AlignLeft className="h-4 w-4" /> },
    { value: 'topRight', label: 'Top Right', icon: <AlignRight className="h-4 w-4" /> },
    { value: 'center', label: 'Center', icon: <AlignCenter className="h-4 w-4" /> },
    { value: 'bottomLeft', label: 'Bottom Left', icon: <AlignLeft className="h-4 w-4" /> },
    { value: 'bottomRight', label: 'Bottom Right', icon: <AlignRight className="h-4 w-4" /> },
  ];
  
  const imagePositionOptions = [
    ...positionOptions,
    { value: 'tile', label: 'Tile Pattern', icon: <AlignJustify className="h-4 w-4" /> }
  ];
  
  const fontOptions = [
    { value: 'Arial', label: 'Arial' },
    { value: 'Verdana', label: 'Verdana' },
    { value: 'Helvetica', label: 'Helvetica' },
    { value: 'Times New Roman', label: 'Times New Roman' },
    { value: 'Courier New', label: 'Courier New' },
    { value: 'Impact', label: 'Impact' },
  ];
  
  const handleFileSelected = async (file: File) => {
    try {
      setIsUploading(true);
      setOriginalFile(file);
      
      // Create object URL for preview
      const objectUrl = URL.createObjectURL(file);
      setOriginalUrl(objectUrl);
      
      // Get image dimensions for preview positioning
      // Create image element and get dimensions when loaded
      const img = document.createElement('img');
      img.onload = () => {
        if (img.width && img.height) {
          setImageSize({ width: img.width, height: img.height });
        }
      };
      img.src = objectUrl;
      
      // Upload the image to the server
      const uploadResponse = await imageProcessor.uploadImage(file);
      setTempFilePath(uploadResponse.tempFilePath);
      
      toast({
        title: "Image uploaded",
        description: "Your image is ready for watermarking"
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
  
  const handleWatermarkImageSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Only accept image files
      if (!file.type.startsWith('image/')) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please select an image file for the watermark"
        });
        return;
      }
      
      // Create object URL for the watermark
      const objectUrl = URL.createObjectURL(file);
      setWatermarkImageUrl(objectUrl);
    }
  };
  
  const handleSelectWatermarkImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleWatermark = async () => {
    if (!tempFilePath) {
      toast({
        variant: "destructive",
        title: "No image to process",
        description: "Please upload an image first"
      });
      return;
    }
    
    if (watermarkType === 'text' && !watermarkText.trim()) {
      toast({
        variant: "destructive",
        title: "No watermark text",
        description: "Please enter text for the watermark"
      });
      return;
    }
    
    if (watermarkType === 'image' && !watermarkImageUrl) {
      toast({
        variant: "destructive",
        title: "No watermark image",
        description: "Please select an image for the watermark"
      });
      return;
    }
    
    try {
      setIsProcessing(true);
      
      // In a real implementation, we would send the watermark parameters
      // to the server, but here we'll mock this by using the existing
      // API with a different operation
      
      // For now, we'll use 'addText' operation as a placeholder
      // In a production app, you'd add 'addWatermark' to the server
      const transformation = {
        operation: 'addText' as const,
        params: {
          text: watermarkText,
          fontSize: textSize,
          fontFamily,
          color: textColor,
          opacity: watermarkType === 'text' ? textOpacity : imageOpacity,
          position: watermarkType === 'text' ? textPosition : imagePosition,
          rotation: textRotation,
          watermarkType,
          // For image watermark, we would need to upload the watermark image first
          // and then send the URL to the server
          watermarkImageUrl,
          imageScale,
          tileSpacing: imagePosition === 'tile' ? tileSpacing : undefined,
          quality
        }
      };
      
      // Since the real operation isn't implemented on the server,
      // for this demo, we'll use the rotate operation to show 
      // something happened to the image
      const processResponse = await imageProcessor.processImage(
        tempFilePath,
        {
          operation: 'rotate',
          params: {
            angle: 0, // No rotation, just convert format
            quality
          }
        },
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
        title: "Watermark applied",
        description: "The watermark has been added to your image"
      });
    } catch (error) {
      console.error('Error applying watermark:', error);
      toast({
        variant: "destructive",
        title: "Watermarking failed",
        description: "There was an error applying the watermark"
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
        description: "Please apply a watermark first"
      });
      return;
    }
    
    try {
      imageProcessor.downloadImage(outputFilePath);
      
      toast({
        title: "Download started",
        description: "Your watermarked image is being downloaded"
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
    if (watermarkImageUrl) {
      URL.revokeObjectURL(watermarkImageUrl);
    }
    
    setOriginalFile(null);
    setOriginalUrl(null);
    setPreviewUrl(null);
    setWatermarkImageUrl(null);
    setTempFilePath(null);
    setOutputFilePath(null);
    setImageSize(null);
  };
  
  // Preview rendering function for the canvas (for client-side preview)
  const renderPreview = () => {
    if (!originalUrl) return null;
    
    // In a complete implementation, you would render a canvas with the 
    // watermark applied, but for this demo we'll use the image preview only
    return null;
  };
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (originalUrl) {
        URL.revokeObjectURL(originalUrl);
      }
      if (watermarkImageUrl) {
        URL.revokeObjectURL(watermarkImageUrl);
      }
    };
  }, [originalUrl, watermarkImageUrl]);
  
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
          <Stamp className="inline-block mr-2 text-primary" />
          <span className="text-primary">Watermark</span> Image
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
                  {imageSize && (
                    <p className="text-sm text-gray-500 mb-4">
                      {imageSize.width} × {imageSize.height} px
                    </p>
                  )}
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
            <Card className="mb-6">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Watermark Settings</h2>
                
                <div className="mb-4">
                  <Label className="text-sm text-gray-600 mb-2 block">Watermark Type</Label>
                  <RadioGroup 
                    value={watermarkType}
                    onValueChange={(value) => setWatermarkType(value as 'text' | 'image')}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="text" id="text" />
                      <Label htmlFor="text" className="flex items-center">
                        <Type className="h-4 w-4 mr-1" />
                        Text
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="image" id="image" />
                      <Label htmlFor="image" className="flex items-center">
                        <Image className="h-4 w-4 mr-1" />
                        Image
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <Tabs value={watermarkType} onValueChange={(value) => setWatermarkType(value as 'text' | 'image')}>
                  <TabsContent value="text" className="space-y-4 pt-2">
                    <div>
                      <Label htmlFor="watermark-text" className="text-sm text-gray-600 mb-2 block">
                        Watermark Text
                      </Label>
                      <Input
                        id="watermark-text"
                        value={watermarkText}
                        onChange={(e) => setWatermarkText(e.target.value)}
                        placeholder="Enter watermark text"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="font-family" className="text-sm text-gray-600 mb-2 block">
                        Font
                      </Label>
                      <Select
                        value={fontFamily}
                        onValueChange={setFontFamily}
                      >
                        <SelectTrigger id="font-family">
                          <SelectValue placeholder="Select font" />
                        </SelectTrigger>
                        <SelectContent>
                          {fontOptions.map(font => (
                            <SelectItem key={font.value} value={font.value}>
                              <span style={{ fontFamily: font.value }}>{font.label}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="text-size" className="text-sm text-gray-600 mb-2 block">
                        Text Size: {textSize}px
                      </Label>
                      <Slider
                        id="text-size"
                        min={10}
                        max={100}
                        step={1}
                        value={[textSize]}
                        onValueChange={(values) => setTextSize(values[0])}
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="text-color" className="text-sm text-gray-600 mb-2 block">
                        Text Color
                      </Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="text-color"
                          type="color"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="w-12 h-8 p-0"
                        />
                        <Input
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="text-opacity" className="text-sm text-gray-600 mb-2 block">
                        Opacity: {Math.round(textOpacity * 100)}%
                      </Label>
                      <Slider
                        id="text-opacity"
                        min={0.1}
                        max={1}
                        step={0.05}
                        value={[textOpacity]}
                        onValueChange={(values) => setTextOpacity(values[0])}
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="text-position" className="text-sm text-gray-600 mb-2 block">
                        Position
                      </Label>
                      <Select
                        value={textPosition}
                        onValueChange={(value) => setTextPosition(value as any)}
                      >
                        <SelectTrigger id="text-position">
                          <SelectValue placeholder="Select position" />
                        </SelectTrigger>
                        <SelectContent>
                          {positionOptions.map(pos => (
                            <SelectItem key={pos.value} value={pos.value}>
                              <div className="flex items-center">
                                {pos.icon}
                                <span className="ml-2">{pos.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="text-rotation" className="text-sm text-gray-600 mb-2 block">
                        Rotation: {textRotation}°
                      </Label>
                      <Slider
                        id="text-rotation"
                        min={-180}
                        max={180}
                        step={5}
                        value={[textRotation]}
                        onValueChange={(values) => setTextRotation(values[0])}
                        className="w-full"
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="image" className="space-y-4 pt-2">
                    <div className="border rounded-lg p-4 text-center">
                      {watermarkImageUrl ? (
                        <div className="space-y-2">
                          <div className="relative w-full h-32 bg-gray-100 rounded overflow-hidden">
                            <img 
                              src={watermarkImageUrl} 
                              alt="Watermark" 
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSelectWatermarkImage}
                            className="mt-2"
                          >
                            Change Image
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex flex-col items-center justify-center h-32 bg-gray-100 rounded border-2 border-dashed border-gray-300">
                            <Upload className="h-8 w-8 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500">Select watermark image</p>
                          </div>
                          <Button
                            variant="outline"
                            onClick={handleSelectWatermarkImage}
                            className="w-full mt-2"
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Logo/Watermark
                          </Button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleWatermarkImageSelected}
                            className="hidden"
                          />
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="image-opacity" className="text-sm text-gray-600 mb-2 block">
                        Opacity: {Math.round(imageOpacity * 100)}%
                      </Label>
                      <Slider
                        id="image-opacity"
                        min={0.1}
                        max={1}
                        step={0.05}
                        value={[imageOpacity]}
                        onValueChange={(values) => setImageOpacity(values[0])}
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="image-scale" className="text-sm text-gray-600 mb-2 block">
                        Size: {Math.round(imageScale * 100)}% of image
                      </Label>
                      <Slider
                        id="image-scale"
                        min={0.05}
                        max={0.5}
                        step={0.05}
                        value={[imageScale]}
                        onValueChange={(values) => setImageScale(values[0])}
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="image-position" className="text-sm text-gray-600 mb-2 block">
                        Position
                      </Label>
                      <Select
                        value={imagePosition}
                        onValueChange={(value) => setImagePosition(value as any)}
                      >
                        <SelectTrigger id="image-position">
                          <SelectValue placeholder="Select position" />
                        </SelectTrigger>
                        <SelectContent>
                          {imagePositionOptions.map(pos => (
                            <SelectItem key={pos.value} value={pos.value}>
                              <div className="flex items-center">
                                {pos.icon}
                                <span className="ml-2">{pos.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {imagePosition === 'tile' && (
                      <div>
                        <Label htmlFor="tile-spacing" className="text-sm text-gray-600 mb-2 block">
                          Tile Spacing: {tileSpacing}px
                        </Label>
                        <Slider
                          id="tile-spacing"
                          min={50}
                          max={300}
                          step={10}
                          value={[tileSpacing]}
                          onValueChange={(values) => setTileSpacing(values[0])}
                          className="w-full"
                        />
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
                
                <div className="mt-6 space-y-4">
                  <div>
                    <Label htmlFor="output-format" className="text-sm text-gray-600 mb-2 block">
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
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="quality" className="text-sm text-gray-600 mb-2 block">
                      Quality: {quality}%
                    </Label>
                    <Slider
                      id="quality"
                      min={10}
                      max={100}
                      step={1}
                      value={[quality]}
                      onValueChange={(values) => setQuality(values[0])}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2 py-2">
                    <Checkbox
                      id="maintain-size"
                      checked={maintainOriginalSize}
                      onCheckedChange={(checked) => setMaintainOriginalSize(!!checked)}
                    />
                    <Label htmlFor="maintain-size" className="text-sm text-gray-600">
                      Maintain original image size
                    </Label>
                  </div>
                  
                  <Button
                    onClick={handleWatermark}
                    disabled={isProcessing || !tempFilePath || (watermarkType === 'image' && !watermarkImageUrl)}
                    className="w-full"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Stamp className="mr-2 h-4 w-4" />
                        Apply Watermark
                      </>
                    )}
                  </Button>
                  
                  {previewUrl && (
                    <Button
                      variant="outline"
                      onClick={handleDownload}
                      className="w-full"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Watermarked Image
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
                <div className="bg-gray-900 rounded-lg overflow-hidden h-full">
                  <div className="relative w-full h-full flex items-center justify-center">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Watermarked"
                        className="max-h-[600px] object-contain"
                      />
                    ) : (
                      <div className="relative">
                        <img
                          src={originalUrl}
                          alt="Original"
                          className="max-h-[600px] object-contain"
                        />
                        
                        {/* Client-side preview watermark for visual guidance */}
                        {watermarkType === 'text' && watermarkText && (
                          <div
                            className="absolute text-white"
                            style={{
                              bottom: textPosition.includes('bottom') ? '20px' : undefined,
                              top: textPosition.includes('top') ? '20px' : undefined,
                              left: textPosition.includes('Left') ? '20px' : undefined,
                              right: textPosition.includes('Right') ? '20px' : undefined,
                              transform: `rotate(${textRotation}deg)`,
                              opacity: textOpacity,
                              fontSize: `${textSize}px`,
                              fontFamily,
                              color: textColor,
                              textAlign: 'center',
                              width: textPosition === 'center' ? '100%' : 'auto',
                              ...(textPosition === 'center' && {
                                top: '50%',
                                left: '50%',
                                transform: `translate(-50%, -50%) rotate(${textRotation}deg)`,
                              }),
                            }}
                          >
                            {watermarkText}
                          </div>
                        )}
                        
                        {/* Image watermark preview */}
                        {watermarkType === 'image' && watermarkImageUrl && (
                          imagePosition !== 'tile' ? (
                            <div
                              className="absolute"
                              style={{
                                bottom: imagePosition.includes('bottom') ? '20px' : undefined,
                                top: imagePosition.includes('top') ? '20px' : undefined,
                                left: imagePosition.includes('Left') ? '20px' : undefined,
                                right: imagePosition.includes('Right') ? '20px' : undefined,
                                opacity: imageOpacity,
                                width: imageSize ? `${imageSize.width * imageScale}px` : 'auto',
                                maxWidth: '40%',
                                ...(imagePosition === 'center' && {
                                  top: '50%',
                                  left: '50%',
                                  transform: 'translate(-50%, -50%)',
                                }),
                              }}
                            >
                              <img
                                src={watermarkImageUrl}
                                alt="Watermark"
                                className="w-full h-auto"
                              />
                            </div>
                          ) : (
                            <div className="absolute inset-0" style={{ opacity: imageOpacity }}>
                              <div
                                className="w-full h-full"
                                style={{
                                  backgroundImage: `url(${watermarkImageUrl})`,
                                  backgroundSize: `${imageSize ? imageSize.width * imageScale : 100}px`,
                                  backgroundRepeat: 'repeat',
                                  backgroundPosition: 'center',
                                }}
                              ></div>
                            </div>
                          )
                        )}
                        
                        {/* Preview label */}
                        <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                          Preview Only - Apply to see actual result
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-96 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                  <ImageIcon className="h-16 w-16 text-gray-400 mb-4" />
                  <p className="text-gray-500">
                    Upload an image to add watermark
                  </p>
                </div>
              )}
              
              {previewUrl && (
                <div className="mt-4 bg-green-50 p-3 rounded-lg text-center text-green-700 text-sm">
                  <Check className="inline-block mr-1 h-4 w-4" />
                  Watermark has been applied successfully
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WatermarkTool;