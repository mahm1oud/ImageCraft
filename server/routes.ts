import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import sharp from "sharp";
import { 
  imageUploadSchema, 
  imageProcessingSchema, 
  IMAGE_FORMAT_SCHEMA,
  IMAGE_OPERATION_SCHEMA
} from "@shared/schema";
import { z } from "zod";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (_req, file, cb) => {
    // Accept image files only
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Temporary directory for processed images
const tmpDir = path.join(process.cwd(), 'tmp');
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // API endpoint to upload an image
  app.post('/api/upload', upload.single('image'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No image file provided' });
      }

      const file = req.file;
      const originalExtension = path.extname(file.originalname).slice(1).toLowerCase();

      // Validate file format
      const parseResult = IMAGE_FORMAT_SCHEMA.safeParse(originalExtension);
      if (!parseResult.success) {
        return res.status(400).json({ message: 'Unsupported image format' });
      }

      // Get basic image info using Sharp
      const imageInfo = await sharp(file.buffer).metadata();

      // Generate a unique filename
      const tempFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      const tempFilePath = path.join(tmpDir, tempFileName);

      // Save file temporarily
      await fs.promises.writeFile(tempFilePath, file.buffer);

      // Return image details and temporary path
      res.json({
        originalName: file.originalname,
        originalFormat: originalExtension,
        size: file.size,
        width: imageInfo.width,
        height: imageInfo.height,
        tempFilePath: tempFilePath
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      res.status(500).json({ message: 'Failed to upload image' });
    }
  });

  // API endpoint to process an image
  app.post('/api/process', async (req: Request, res: Response) => {
    try {
      // Validate the processing request
      const { operation, params, tempFilePath, outputFormat } = req.body;

      if (!tempFilePath || !fs.existsSync(tempFilePath)) {
        return res.status(400).json({ message: 'Invalid file path' });
      }

      // Validate operation
      const operationResult = IMAGE_OPERATION_SCHEMA.safeParse(operation);
      if (!operationResult.success) {
        return res.status(400).json({ message: 'Invalid operation' });
      }

      // Validate output format
      const formatResult = IMAGE_FORMAT_SCHEMA.safeParse(outputFormat);
      if (!formatResult.success) {
        return res.status(400).json({ message: 'Invalid output format' });
      }

      // Read the image from the temporary file
      const imageBuffer = await fs.promises.readFile(tempFilePath);
      
      // Process the image based on the operation
      let processedImageBuffer: Buffer;
      let sharpInstance = sharp(imageBuffer);

      switch (operation) {
        case 'resize':
          const { width, height, fit } = params;
          sharpInstance = sharpInstance.resize({
            width: Number(width) || undefined,
            height: Number(height) || undefined,
            fit: fit || 'contain'
          });
          break;
          
        case 'rotate':
          const { angle } = params;
          sharpInstance = sharpInstance.rotate(Number(angle) || 0);
          break;
          
        case 'compress':
          const { quality } = params;
          // Quality will be applied in the toFormat step
          break;
          
        case 'crop':
          const { left, top, cropWidth, cropHeight } = params;
          sharpInstance = sharpInstance.extract({
            left: Number(left) || 0,
            top: Number(top) || 0,
            width: Number(cropWidth) || 100,
            height: Number(cropHeight) || 100
          });
          break;
          
        case 'adjustBrightness':
          const { brightness } = params;
          sharpInstance = sharpInstance.modulate({
            brightness: Number(brightness) || 1.0
          });
          break;
          
        case 'adjustContrast':
          const { contrast } = params;
          // Sharp doesn't support contrast in modulate, use linear method instead
          sharpInstance = sharpInstance.linear(
            Number(contrast) || 1.0, // multiply (increase contrast)
            0 // offset (no change in brightness)
          );
          break;
          
        case 'adjustSaturation':
          const { saturation } = params;
          sharpInstance = sharpInstance.modulate({
            saturation: Number(saturation) || 1.0
          });
          break;
          
        default:
          // For operations that can't be directly handled by Sharp
          // just pass through the image
          break;
      }

      // Convert to the requested format
      const qualityValue = params.quality ? Number(params.quality) : undefined;
      
      if (outputFormat === 'png') {
        processedImageBuffer = await sharpInstance.png({ quality: qualityValue }).toBuffer();
      } else if (outputFormat === 'jpg' || outputFormat === 'jpeg') {
        processedImageBuffer = await sharpInstance.jpeg({ quality: qualityValue || 80 }).toBuffer();
      } else if (outputFormat === 'webp') {
        processedImageBuffer = await sharpInstance.webp({ quality: qualityValue || 80 }).toBuffer();
      } else if (outputFormat === 'gif') {
        processedImageBuffer = await sharpInstance.gif().toBuffer();
      } else if (outputFormat === 'tiff' || outputFormat === 'tif') {
        processedImageBuffer = await sharpInstance.tiff({ quality: qualityValue || 80 }).toBuffer();
      } else {
        // Default to JPEG if format not supported
        processedImageBuffer = await sharpInstance.jpeg({ quality: qualityValue || 80 }).toBuffer();
      }

      // Generate a unique filename for the processed image
      const outputFileName = `processed-${Date.now()}.${outputFormat}`;
      const outputFilePath = path.join(tmpDir, outputFileName);
      
      // Save the processed image
      await fs.promises.writeFile(outputFilePath, processedImageBuffer);
      
      // Get metadata of processed image
      const processedInfo = await sharp(processedImageBuffer).metadata();
      
      // Save image processing details to database
      try {
        await storage.saveImage({
          originalName: path.basename(tempFilePath),
          originalFormat: path.extname(tempFilePath).slice(1) || 'unknown',
          processedFormat: outputFormat,
          size: processedImageBuffer.length,
          width: processedInfo.width || 0,
          height: processedInfo.height || 0,
          userId: null, // Anonymous user for now
          processingOptions: { 
            operation, 
            params, 
            outputFormat 
          }
        });
      } catch (dbError) {
        console.error('Error saving image to database:', dbError);
        // Continue even if database save fails
      }

      res.json({
        outputFilePath,
        outputFormat,
        width: processedInfo.width,
        height: processedInfo.height,
        size: processedImageBuffer.length
      });
      
    } catch (error) {
      console.error('Error processing image:', error);
      res.status(500).json({ message: 'Failed to process image' });
    }
  });

  // API endpoint to download a processed image
  app.get('/api/download/:filename', (req: Request, res: Response) => {
    try {
      const { filename } = req.params;
      const filePath = path.join(tmpDir, filename);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'File not found' });
      }
      
      res.download(filePath);
    } catch (error) {
      console.error('Error downloading image:', error);
      res.status(500).json({ message: 'Failed to download image' });
    }
  });

  // Clean up temporary files periodically (every hour)
  setInterval(() => {
    try {
      const files = fs.readdirSync(tmpDir);
      const now = Date.now();
      
      files.forEach(file => {
        const filePath = path.join(tmpDir, file);
        const stats = fs.statSync(filePath);
        
        // Remove files older than 24 hours
        if (now - stats.mtimeMs > 24 * 60 * 60 * 1000) {
          fs.unlinkSync(filePath);
        }
      });
    } catch (error) {
      console.error('Error cleaning up temporary files:', error);
    }
  }, 60 * 60 * 1000);

  const httpServer = createServer(app);
  return httpServer;
}
