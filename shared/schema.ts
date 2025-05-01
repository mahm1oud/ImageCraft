import { pgTable, text, serial, integer, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema from the original file
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Images table to store processed images
export const images = pgTable("images", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id), // Nullable by default
  originalName: text("original_name").notNull(),
  originalFormat: text("original_format").notNull(),
  processedFormat: text("processed_format").notNull(),
  size: integer("size").notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  processingOptions: json("processing_options").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertImageSchema = createInsertSchema(images).omit({
  id: true,
  createdAt: true,
});

// Define the accepted image formats
export const IMAGE_FORMATS = ["jpg", "jpeg", "png", "gif", "webp", "svg", "tif", "tiff"] as const;
export const IMAGE_FORMAT_SCHEMA = z.enum(IMAGE_FORMATS);

// Define image processing operations
export const IMAGE_OPERATIONS = [
  "resize", 
  "rotate", 
  "compress", 
  "crop", 
  "addText", 
  "addFrame", 
  "removeBackground", 
  "addWatermark", 
  "blurFaces", 
  "adjustBrightness", 
  "adjustContrast", 
  "adjustSaturation", 
  "convert"
] as const;
export const IMAGE_OPERATION_SCHEMA = z.enum(IMAGE_OPERATIONS);

// Image processing options schema
export const imageProcessingSchema = z.object({
  operation: IMAGE_OPERATION_SCHEMA,
  params: z.record(z.union([z.string(), z.number(), z.boolean()])),
});

export const imageUploadSchema = z.object({
  originalName: z.string(),
  originalFormat: IMAGE_FORMAT_SCHEMA,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertImage = z.infer<typeof insertImageSchema>;
export type Image = typeof images.$inferSelect;
export type ImageFormat = z.infer<typeof IMAGE_FORMAT_SCHEMA>;
export type ImageOperation = z.infer<typeof IMAGE_OPERATION_SCHEMA>;
export type ImageProcessingOptions = z.infer<typeof imageProcessingSchema>;
