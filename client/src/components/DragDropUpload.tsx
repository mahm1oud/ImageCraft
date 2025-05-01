import { useState, useRef } from 'react';
import { Upload, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isValidImageFile } from '@/lib/imageProcessor';

interface DragDropUploadProps {
  onFileSelected: (file: File) => void;
  maxSize?: number; // in MB
}

const DragDropUpload = ({
  onFileSelected,
  maxSize = 50 // 50MB default
}: DragDropUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size exceeds ${maxSize}MB limit`);
      return false;
    }

    // Check file type
    if (!isValidImageFile(file)) {
      setError('Unsupported file format. Please use JPG, PNG, GIF, WebP, SVG or TIFF.');
      return false;
    }

    return true;
  };

  const processFile = (file: File) => {
    setError(null);
    
    if (validateFile(file)) {
      onFileSelected(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div 
      className={`border-2 ${isDragging ? 'border-primary border-dashed bg-blue-50' : 'border-gray-300 border-dashed'} 
                 rounded-lg p-6 text-center transition-colors duration-300 cursor-pointer`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleButtonClick}
    >
      <input 
        ref={fileInputRef}
        type="file" 
        className="hidden" 
        accept="image/*" 
        onChange={handleFileInputChange}
      />
      
      <div className="flex flex-col items-center justify-center py-4">
        {isDragging ? (
          <Upload className="h-16 w-16 text-primary mb-4" />
        ) : (
          <Image className="h-16 w-16 text-gray-400 mb-4" />
        )}
        
        <p className="text-lg font-medium mb-2">
          {isDragging ? 'Drop your image here' : 'Drag & drop your image here'}
        </p>
        
        <p className="text-sm text-gray-500 mb-4">
          or click to browse files
        </p>
        
        <Button variant="outline" type="button" className="mb-2">
          Select image
        </Button>
        
        <p className="text-xs text-gray-500">
          Supported formats: JPG, PNG, GIF, WebP, SVG, TIFF
        </p>
        <p className="text-xs text-gray-500">
          Max file size: {maxSize}MB
        </p>
        
        {error && (
          <div className="mt-4 p-2 bg-red-100 text-red-700 rounded text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default DragDropUpload;