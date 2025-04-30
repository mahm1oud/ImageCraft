import axios from 'axios';
import { ImageFormat, ImageOperation } from '@shared/schema';

interface UploadResponse {
  originalName: string;
  originalFormat: string;
  size: number;
  width: number;
  height: number;
  tempFilePath: string;
}

interface ProcessResponse {
  outputFilePath: string;
  outputFormat: string;
  width: number;
  height: number;
  size: number;
}

export interface ImageTransformation {
  operation: ImageOperation;
  params: Record<string, string | number | boolean>;
}

export const imageProcessor = {
  async uploadImage(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await axios.post<UploadResponse>('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },
  
  async processImage(
    tempFilePath: string,
    transformation: ImageTransformation,
    outputFormat: ImageFormat
  ): Promise<ProcessResponse> {
    const response = await axios.post<ProcessResponse>('/api/process', {
      tempFilePath,
      operation: transformation.operation,
      params: transformation.params,
      outputFormat,
    });
    
    return response.data;
  },
  
  getDownloadUrl(filename: string): string {
    return `/api/download/${filename}`;
  },
  
  downloadImage(outputFilePath: string): void {
    // Extract filename from path
    const filename = outputFilePath.split('/').pop();
    
    if (!filename) {
      throw new Error('Invalid file path');
    }
    
    // Create a link and trigger download
    const downloadUrl = this.getDownloadUrl(filename);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Helper function to get file extension from filename
export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2).toLowerCase();
}

// Helper function to check if a file is an acceptable image
export function isValidImageFile(file: File): boolean {
  const acceptableTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/tiff'
  ];
  
  return acceptableTypes.includes(file.type);
}
