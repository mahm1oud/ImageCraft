import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import EditorToolbar from '@/components/EditorToolbar';
import EditorSidebar from '@/components/EditorSidebar';
import SplitScreenPreview from '@/components/SplitScreenPreview';
import { useToast } from '@/hooks/use-toast';
import { useImageEditor } from '@/hooks/useImageEditor';
import { ImageOperation } from '@shared/schema';
import { Loader2 } from 'lucide-react';

const Editor = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [loadingImage, setLoadingImage] = useState(true);
  const [filename, setFilename] = useState('image.jpg');
  
  const {
    originalImageUrl,
    previewImageUrl,
    operation,
    transformParams,
    outputFormat,
    quality,
    history,
    isProcessing,
    isApplied,
    setOperation,
    setTransformParams,
    setOutputFormat,
    setQuality,
    applyTransformation,
    undoTransformation,
    resetTransformations,
    downloadImage
  } = useImageEditor();

  // Check if there's an image to edit, otherwise redirect to home
  useEffect(() => {
    const storedFilename = sessionStorage.getItem('editingFile');
    if (!storedFilename) {
      toast({
        variant: "destructive",
        title: "No image to edit",
        description: "Please upload an image first"
      });
      navigate('/');
      return;
    }
    
    setFilename(storedFilename);
    
    // Simulate loading the image
    const timer = setTimeout(() => {
      setLoadingImage(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  // Handle quality change
  const handleQualityChange = (value: string) => {
    let qualityValue: number;
    
    switch (value) {
      case 'max':
        qualityValue = 100;
        break;
      case 'high':
        qualityValue = 80;
        break;
      case 'medium':
        qualityValue = 60;
        break;
      case 'low':
        qualityValue = 40;
        break;
      default:
        qualityValue = 80;
    }
    
    setQuality(qualityValue);
  };

  // Render different controls based on the selected operation
  const renderOperationControls = () => {
    switch (operation) {
      case 'resize':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="block text-sm text-gray-600 mb-1">Width (px)</Label>
              <Input 
                type="number" 
                value={transformParams.width?.toString() || ''} 
                onChange={(e) => 
                  setTransformParams({
                    ...transformParams,
                    width: Number(e.target.value)
                  })
                }
                className="border rounded p-2 w-full focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <Label className="block text-sm text-gray-600 mb-1">Height (px)</Label>
              <Input 
                type="number" 
                value={transformParams.height?.toString() || ''} 
                onChange={(e) => 
                  setTransformParams({
                    ...transformParams,
                    height: Number(e.target.value)
                  })
                }
                className="border rounded p-2 w-full focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
            <div className="col-span-2">
              <div className="flex items-center">
                <Checkbox 
                  id="maintain-aspect" 
                  checked={transformParams.maintainAspect as boolean || true}
                  onCheckedChange={(checked) => 
                    setTransformParams({
                      ...transformParams,
                      maintainAspect: !!checked
                    })
                  }
                />
                <Label 
                  htmlFor="maintain-aspect"
                  className="ml-2 text-sm text-gray-600"
                >
                  Maintain aspect ratio
                </Label>
              </div>
            </div>
            <div className="col-span-2">
              <Label className="block text-sm text-gray-600 mb-1">Resize method</Label>
              <Select 
                defaultValue="contain"
                onValueChange={(value) => 
                  setTransformParams({
                    ...transformParams,
                    fit: value
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contain">Standard (good quality)</SelectItem>
                  <SelectItem value="cover">Cover (fill area)</SelectItem>
                  <SelectItem value="fill">Fill (stretch to fit)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
        
      case 'rotate':
        return (
          <div className="space-y-4">
            <div>
              <Label className="block text-sm text-gray-600 mb-1">
                Rotation angle: {transformParams.angle || 0}°
              </Label>
              <Slider 
                min={0}
                max={360}
                step={90}
                value={[transformParams.angle as number || 0]}
                onValueChange={(values) => 
                  setTransformParams({
                    ...transformParams,
                    angle: values[0]
                  })
                }
              />
            </div>
            <div className="flex space-x-4">
              <button 
                className="bg-gray-100 hover:bg-gray-200 rounded p-2 flex-1 text-center"
                onClick={() => 
                  setTransformParams({
                    ...transformParams,
                    angle: 90
                  })
                }
              >
                Rotate 90°
              </button>
              <button 
                className="bg-gray-100 hover:bg-gray-200 rounded p-2 flex-1 text-center"
                onClick={() => 
                  setTransformParams({
                    ...transformParams,
                    angle: 180
                  })
                }
              >
                Rotate 180°
              </button>
              <button 
                className="bg-gray-100 hover:bg-gray-200 rounded p-2 flex-1 text-center"
                onClick={() => 
                  setTransformParams({
                    ...transformParams,
                    angle: 270
                  })
                }
              >
                Rotate 270°
              </button>
            </div>
          </div>
        );
        
      case 'compress':
        return (
          <div className="space-y-4">
            <div>
              <Label className="block text-sm text-gray-600 mb-1">
                Compression level: {quality}%
              </Label>
              <Slider 
                min={10}
                max={100}
                step={5}
                value={[quality]}
                onValueChange={(values) => setQuality(values[0])}
              />
              <p className="text-xs text-gray-500 mt-1">
                Higher values preserve quality but result in larger file sizes.
              </p>
            </div>
          </div>
        );
        
      case 'adjustBrightness':
        return (
          <div className="space-y-4">
            <div>
              <Label className="block text-sm text-gray-600 mb-1">
                Brightness: {transformParams.brightness || 1}
              </Label>
              <Slider 
                min={0.1}
                max={2}
                step={0.1}
                value={[transformParams.brightness as number || 1]}
                onValueChange={(values) => 
                  setTransformParams({
                    ...transformParams,
                    brightness: values[0]
                  })
                }
              />
            </div>
          </div>
        );
        
      case 'adjustContrast':
        return (
          <div className="space-y-4">
            <div>
              <Label className="block text-sm text-gray-600 mb-1">
                Contrast: {transformParams.contrast || 1}
              </Label>
              <Slider 
                min={0.1}
                max={2}
                step={0.1}
                value={[transformParams.contrast as number || 1]}
                onValueChange={(values) => 
                  setTransformParams({
                    ...transformParams,
                    contrast: values[0]
                  })
                }
              />
            </div>
          </div>
        );
        
      case 'adjustSaturation':
        return (
          <div className="space-y-4">
            <div>
              <Label className="block text-sm text-gray-600 mb-1">
                Saturation: {transformParams.saturation || 1}
              </Label>
              <Slider 
                min={0}
                max={2}
                step={0.1}
                value={[transformParams.saturation as number || 1]}
                onValueChange={(values) => 
                  setTransformParams({
                    ...transformParams,
                    saturation: values[0]
                  })
                }
              />
            </div>
          </div>
        );
        
      case 'convert':
        return (
          <div className="space-y-4">
            <div>
              <Label className="block text-sm text-gray-600 mb-1">
                Output Format
              </Label>
              <Select 
                value={outputFormat}
                onValueChange={setOutputFormat}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jpg">JPG</SelectItem>
                  <SelectItem value="png">PNG</SelectItem>
                  <SelectItem value="webp">WEBP</SelectItem>
                  <SelectItem value="gif">GIF</SelectItem>
                  <SelectItem value="tif">TIFF</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                Different formats are suitable for different use cases. 
                WebP generally offers the best compression.
              </p>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="p-4 text-center text-gray-500">
            <p>Select an operation from the sidebar to start editing.</p>
          </div>
        );
    }
  };

  // If still loading the image, show a loading indicator
  if (loadingImage) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h2 className="text-xl font-semibold">Loading Image Editor...</h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-0 md:px-4 py-4">
      <Card className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Editor Toolbar */}
        <EditorToolbar 
          filename={filename}
          canUndo={history.length > 0}
          outputFormat={outputFormat}
          onUndo={undoTransformation}
          onReset={resetTransformations}
          onApply={applyTransformation}
          onFormatChange={setOutputFormat}
          onQualityChange={handleQualityChange}
          onDownload={downloadImage}
          isPending={isProcessing}
          isApplied={isApplied}
        />

        {/* Editor Main Area */}
        <div className="flex flex-col md:flex-row">
          {/* Tools Sidebar */}
          <EditorSidebar 
            activeOperation={operation}
            onSelectOperation={setOperation}
          />

          {/* Preview & Controls Area */}
          <div className="flex-1 flex flex-col">
            {/* Tool Controls */}
            <div className="border-b p-4">
              <h3 className="font-medium text-textColor mb-3">
                {operation ? `${operation.charAt(0).toUpperCase() + operation.slice(1)} Options` : 'Select a Tool'}
              </h3>
              {renderOperationControls()}
            </div>

            {/* Preview Area */}
            <div className="flex-1 relative overflow-hidden bg-gray-900 flex items-center justify-center">
              {isProcessing ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <Loader2 className="h-12 w-12 animate-spin text-white mb-4" />
                  <h3 className="text-white">Processing Image...</h3>
                </div>
              ) : (
                <SplitScreenPreview 
                  originalImage={originalImageUrl}
                  previewImage={previewImageUrl || originalImageUrl}
                  alt={filename}
                />
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Editor;
