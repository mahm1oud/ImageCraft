import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, 
  ArrowLeft, 
  Download, 
  RefreshCw, 
  Filter, 
  SunMedium, 
  Contrast, 
  Palette, 
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import DragDropUpload from '@/components/DragDropUpload';
import SplitScreenPreview from '@/components/SplitScreenPreview';
import { useToast } from '@/hooks/use-toast';
import { imageProcessor } from '@/lib/imageProcessor';
import { ImageFormat } from '@shared/schema';

const AdjustTool = () => {
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
  const [activeTab, setActiveTab] = useState('brightness');
  
  // Adjustment parameters
  const [brightness, setBrightness] = useState(1.0);
  const [contrast, setContrast] = useState(1.0);
  const [saturation, setSaturation] = useState(1.0);
  const [outputFormat, setOutputFormat] = useState<ImageFormat>('jpg');
  const [quality, setQuality] = useState(90);
  
  // Track changes for the reset button
  const [hasChanges, setHasChanges] = useState(false);
  
  // Check if any parameter has been changed
  useEffect(() => {
    if (brightness !== 1.0 || contrast !== 1.0 || saturation !== 1.0) {
      setHasChanges(true);
    } else {
      setHasChanges(false);
    }
  }, [brightness, contrast, saturation]);
  
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
        description: "Your image is ready to adjust"
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
  
  const handleReset = () => {
    setBrightness(1.0);
    setContrast(1.0);
    setSaturation(1.0);
    setHasChanges(false);
    
    if (previewUrl) {
      setPreviewUrl(null);
      setOutputFilePath(null);
    }
  };
  
  const handleNewImage = () => {
    if (originalUrl) {
      URL.revokeObjectURL(originalUrl);
    }
    
    setOriginalFile(null);
    setOriginalUrl(null);
    setPreviewUrl(null);
    setTempFilePath(null);
    setOutputFilePath(null);
    handleReset();
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
      
      // Determine which operation to use based on which parameter changed the most
      let operation: 'adjustBrightness' | 'adjustContrast' | 'adjustSaturation';
      const brightnessChange = Math.abs(brightness - 1.0);
      const contrastChange = Math.abs(contrast - 1.0);
      const saturationChange = Math.abs(saturation - 1.0);
      
      // In a real app, you'd combine all parameters in one operation
      // Here we're sending them as separate operations for demonstration
      
      if (brightnessChange >= contrastChange && brightnessChange >= saturationChange) {
        operation = 'adjustBrightness';
      } else if (contrastChange >= brightnessChange && contrastChange >= saturationChange) {
        operation = 'adjustContrast';
      } else {
        operation = 'adjustSaturation';
      }
      
      const transformation = {
        operation,
        params: {
          brightness,
          contrast,
          saturation,
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
        title: "Image adjusted",
        description: "Image adjustments have been applied"
      });
    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        variant: "destructive",
        title: "Processing failed",
        description: "There was an error adjusting your image"
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
        description: "Please adjust and process an image first"
      });
      return;
    }
    
    try {
      imageProcessor.downloadImage(outputFilePath);
      
      toast({
        title: "Download started",
        description: "Your adjusted image is being downloaded"
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
  
  const getValueLabel = (value: number) => {
    // Convert 0-2 scale to percentage where 1.0 is 0%
    const percentage = Math.round((value - 1.0) * 100);
    return percentage >= 0 ? `+${percentage}%` : `${percentage}%`;
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
          <Filter className="inline-block mr-2 text-primary" />
          <span className="text-primary">Adjust</span> Image
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
                    onClick={handleNewImage}
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
                <h2 className="text-xl font-semibold mb-4">Adjustment Settings</h2>
                
                <Tabs defaultValue="brightness" onValueChange={setActiveTab} value={activeTab}>
                  <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value="brightness" className="flex items-center">
                      <SunMedium className="h-4 w-4 mr-2" />
                      Brightness
                    </TabsTrigger>
                    <TabsTrigger value="contrast" className="flex items-center">
                      <Contrast className="h-4 w-4 mr-2" />
                      Contrast
                    </TabsTrigger>
                    <TabsTrigger value="saturation" className="flex items-center">
                      <Palette className="h-4 w-4 mr-2" />
                      Saturation
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="brightness" className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <Label htmlFor="brightness" className="text-sm text-gray-600">
                          Brightness
                        </Label>
                        <span className="text-sm font-medium">
                          {getValueLabel(brightness)}
                        </span>
                      </div>
                      <Slider
                        id="brightness"
                        min={0.1}
                        max={2.0}
                        step={0.05}
                        value={[brightness]}
                        onValueChange={(values) => setBrightness(values[0])}
                        className="w-full"
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="contrast" className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <Label htmlFor="contrast" className="text-sm text-gray-600">
                          Contrast
                        </Label>
                        <span className="text-sm font-medium">
                          {getValueLabel(contrast)}
                        </span>
                      </div>
                      <Slider
                        id="contrast"
                        min={0.1}
                        max={2.0}
                        step={0.05}
                        value={[contrast]}
                        onValueChange={(values) => setContrast(values[0])}
                        className="w-full"
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="saturation" className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <Label htmlFor="saturation" className="text-sm text-gray-600">
                          Saturation
                        </Label>
                        <span className="text-sm font-medium">
                          {getValueLabel(saturation)}
                        </span>
                      </div>
                      <Slider
                        id="saturation"
                        min={0}
                        max={2.0}
                        step={0.05}
                        value={[saturation]}
                        onValueChange={(values) => setSaturation(values[0])}
                        className="w-full"
                      />
                    </div>
                  </TabsContent>
                </Tabs>
                
                <div className="pt-4 space-y-4">
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
                  
                  <div className="flex space-x-2 pt-2">
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      disabled={!hasChanges}
                      className="flex-1"
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Reset
                    </Button>
                    
                    <Button
                      onClick={handleProcessImage}
                      disabled={isProcessing || !tempFilePath || !hasChanges}
                      className="flex-1"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Apply Changes
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {previewUrl && (
                    <Button
                      variant="outline"
                      onClick={handleDownload}
                      className="w-full"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Adjusted Image
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
                    <SplitScreenPreview
                      originalImage={originalUrl}
                      previewImage={previewUrl}
                      alt={originalFile?.name || 'Preview'}
                    />
                  ) : (
                    <img
                      src={originalUrl}
                      alt="Original"
                      className="max-h-[600px] object-contain"
                    />
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-96 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                  <p className="text-gray-500">
                    Upload an image to see preview
                  </p>
                </div>
              )}
              
              {hasChanges && !previewUrl && (
                <div className="mt-4 bg-blue-50 p-3 rounded-lg text-center text-blue-700 text-sm">
                  Brightness: {getValueLabel(brightness)}, 
                  Contrast: {getValueLabel(contrast)}, 
                  Saturation: {getValueLabel(saturation)}
                  <p className="text-xs mt-1">Click "Apply Changes" to see the result</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdjustTool;