import { useState, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Upload, AlertCircle } from 'lucide-react';
import { isValidImageFile } from '@/lib/imageProcessor';

interface DragDropUploadProps {
  onFileSelected: (file: File) => void;
  maxSize?: number; // in MB
}

const DragDropUpload = ({ 
  onFileSelected, 
  maxSize = 50 
}: DragDropUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setIsError(true);
      setErrorMessage(`File size exceeds the maximum limit of ${maxSize}MB.`);
      toast({
        variant: "destructive",
        title: "File too large",
        description: `Maximum file size is ${maxSize}MB.`
      });
      return false;
    }

    // Check file type
    if (!isValidImageFile(file)) {
      setIsError(true);
      setErrorMessage('Invalid file type. Only image files are allowed.');
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload an image file (JPG, PNG, GIF, etc.)."
      });
      return false;
    }

    setIsError(false);
    setErrorMessage('');
    return true;
  };

  const processFile = (file: File) => {
    if (validateFile(file)) {
      onFileSelected(file);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  }, [onFileSelected]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div 
      className={`drag-area flex flex-col items-center justify-center rounded-lg p-8 mb-6 cursor-pointer ${isDragging ? 'active bg-blue-50' : ''} ${isError ? 'border-red-500' : ''}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleBrowseClick}
    >
      {isError ? (
        <AlertCircle className="text-red-500 text-5xl mb-4" />
      ) : (
        <Upload className="text-primary text-5xl mb-4" />
      )}
      
      <h3 className="text-xl font-medium text-textColor mb-2">
        {isError ? 'Upload Error' : 'Drag & Drop Your Image Here'}
      </h3>
      
      {isError ? (
        <p className="text-red-500 mb-4 text-center">{errorMessage}</p>
      ) : (
        <p className="text-gray-500 mb-4 text-center">Supports JPG, PNG, WEBP, GIF, SVG and more</p>
      )}
      
      <p className="text-sm text-gray-400 mb-6">or</p>
      
      <Button 
        className="bg-primary text-white hover:bg-blue-600 px-6 py-3 rounded-lg font-medium"
      >
        Browse Files
      </Button>
      
      <input 
        type="file" 
        id="file-upload" 
        className="hidden" 
        accept="image/*" 
        ref={fileInputRef}
        onChange={handleFileInput}
      />
      
      <p className="text-sm text-gray-500 mt-4">Maximum file size: {maxSize}MB</p>
    </div>
  );
};

export default DragDropUpload;
