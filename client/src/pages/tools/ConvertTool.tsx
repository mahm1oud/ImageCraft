import { useState } from 'react';
import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileType, ArrowLeft, Download, RefreshCw, Check } from 'lucide-react';
import DragDropUpload from '@/components/DragDropUpload';
import { useToast } from '@/hooks/use-toast';
import { imageProcessor } from '@/lib/imageProcessor';
import { ImageFormat } from '@shared/schema';

const ConvertTool = () => {
  const { toast } = useToast();
  
  // Image state
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [originalFormat, setOriginalFormat] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [tempFilePath, setTempFilePath] = useState<string | null>(null);
  const [outputFilePath, setOutputFilePath] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<{ original: number, converted: number | null }>({ original: 0, converted: null });
  
  // UI state
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Conversion parameters
  const [outputFormat, setOutputFormat] = useState<ImageFormat>('png');
  const [quality, setQuality] = useState(80);

  const formatOptions: { value: ImageFormat, label: string, description: string }[] = [
    { value: 'png', label: 'PNG', description: 'Lossless compression with transparency support' },
    { value: 'jpg', label: 'JPG', description: 'Smaller file size, good for photos' },
    { value: 'webp', label: 'WebP', description: 'Modern format with excellent compression' },
    { value: 'gif', label: 'GIF', description: 'Supports animation, limited colors' },
    { value: 'tiff', label: 'TIFF', description: 'High quality for print, larger files' }
  ];
  
  const handleFileSelected = async (file: File) => {
    try {
      setIsUploading(true);
      setOriginalFile(file);
      
      // Create object URL for preview
      const objectUrl = URL.createObjectURL(file);
      setOriginalUrl(objectUrl);
      
      // Get file extension
      const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
      setOriginalFormat(fileExt);
      
      // Set initial output format different from the original
      const currentFormat = fileExt as ImageFormat;
      const newFormat = currentFormat === 'png' ? 'jpg' : 'png';
      setOutputFormat(newFormat);
      
      // Set file size
      setFileSize({ 
        original: file.size, 
        converted: null 
      });
      
      // Upload the image to the server
      const uploadResponse = await imageProcessor.uploadImage(file);
      setTempFilePath(uploadResponse.tempFilePath);
      
      toast({
        title: "Image uploaded",
        description: `Ready to convert from ${fileExt.toUpperCase()}`
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
  
  const handleConvert = async () => {
    if (!tempFilePath) {
      toast({
        variant: "destructive",
        title: "No image to convert",
        description: "Please upload an image first"
      });
      return;
    }
    
    try {
      setIsProcessing(true);
      
      // For conversion, we use a simple operation that doesn't modify the image content
      const transformation = {
        operation: 'convert' as const,
        params: {
          quality
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
        converted: processResponse.size
      });
      
      // Get the processed image URL
      const filename = processResponse.outputFilePath.split('/').pop();
      if (filename) {
        const downloadUrl = imageProcessor.getDownloadUrl(filename);
        setPreviewUrl(downloadUrl);
      }
      
      toast({
        title: "Format converted",
        description: `Converted to ${outputFormat.toUpperCase()} format`
      });
    } catch (error) {
      console.error('Error converting image:', error);
      toast({
        variant: "destructive",
        title: "Conversion failed",
        description: "There was an error converting your image"
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
        description: "Please convert an image first"
      });
      return;
    }
    
    try {
      imageProcessor.downloadImage(outputFilePath);
      
      toast({
        title: "Download started",
        description: "Your converted image is being downloaded"
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
    setOriginalFormat(null);
    setPreviewUrl(null);
    setTempFilePath(null);
    setOutputFilePath(null);
    setFileSize({ original: 0, converted: null });
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
  
  // Calculate size reduction percentage
  const getSizeReduction = (): number | null => {
    if (!fileSize.converted || fileSize.original === 0) return null;
    
    const reduction = ((fileSize.original - fileSize.converted) / fileSize.original) * 100;
    return Math.round(reduction);
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
          <FileType className="inline-block mr-2 text-primary" />
          <span className="text-primary">Convert</span> Format
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
                    {originalFile.name} ({formatFileSize(fileSize.original)})
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Current format: <Badge variant="outline" className="ml-1">{originalFormat?.toUpperCase()}</Badge>
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
                <h2 className="text-xl font-semibold mb-4">Conversion Settings</h2>
                
                <div className="space-y-4">
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
                        {formatOptions.map(format => (
                          <SelectItem key={format.value} value={format.value}>
                            <div className="flex flex-col">
                              <span>{format.label}</span>
                              <span className="text-xs text-gray-500">{format.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {(outputFormat === 'jpg' || outputFormat === 'webp' || outputFormat === 'tiff') && (
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
                  )}
                  
                  <Button
                    onClick={handleConvert}
                    disabled={isProcessing || !tempFilePath}
                    className="w-full"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Converting...
                      </>
                    ) : (
                      `Convert to ${outputFormat.toUpperCase()}`
                    )}
                  </Button>
                  
                  {fileSize.converted && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-medium text-primary mb-2">Conversion Results</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Original size:</div>
                        <div className="text-right font-medium">{formatFileSize(fileSize.original)}</div>
                        
                        <div>New size:</div>
                        <div className="text-right font-medium">{formatFileSize(fileSize.converted)}</div>
                        
                        {getSizeReduction() !== null && getSizeReduction()! > 0 && (
                          <>
                            <div>Size reduction:</div>
                            <div className="text-right font-medium text-green-600">
                              {getSizeReduction()}% <Check className="inline h-4 w-4" />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {previewUrl && (
                    <Button
                      variant="outline"
                      onClick={handleDownload}
                      className="w-full"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Converted Image
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
                  <img
                    src={previewUrl || originalUrl}
                    alt={previewUrl ? "Converted" : "Original"}
                    className="max-h-[600px] object-contain"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-96 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                  <p className="text-gray-500">
                    Upload an image to see preview
                  </p>
                </div>
              )}
              
              {previewUrl && (
                <div className="mt-4 bg-green-50 p-3 rounded-lg text-center text-green-700 text-sm">
                  <Check className="inline-block mr-1 h-4 w-4" />
                  Successfully converted to {outputFormat.toUpperCase()} format
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ConvertTool;