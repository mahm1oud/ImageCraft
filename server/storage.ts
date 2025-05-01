import { images, type Image, type InsertImage, users, type User, type InsertUser } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Image operations
  saveImage(imageData: InsertImage): Promise<Image>;
  getImage(id: number): Promise<Image | undefined>;
  getUserImages(userId: number): Promise<Image[]>;
}

// Use this class for database storage
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async saveImage(imageData: InsertImage): Promise<Image> {
    // Remove userId from imageData if it's undefined or null
    const { userId, ...imageDataWithoutUserId } = imageData;
    
    const [image] = await db
      .insert(images)
      .values({
        ...imageDataWithoutUserId,
        ...(userId ? { userId } : {})
      })
      .returning();
    return image;
  }

  async getImage(id: number): Promise<Image | undefined> {
    const [image] = await db.select().from(images).where(eq(images.id, id));
    return image || undefined;
  }

  async getUserImages(userId: number): Promise<Image[]> {
    return await db.select().from(images).where(eq(images.userId, userId));
  }
}

// Memory storage for development/testing (keeping for reference)
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private images: Map<number, Image>;
  private userIdCounter: number;
  private imageIdCounter: number;

  constructor() {
    this.users = new Map();
    this.images = new Map();
    this.userIdCounter = 1;
    this.imageIdCounter = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async saveImage(imageData: InsertImage): Promise<Image> {
    const id = this.imageIdCounter++;
    const now = new Date();
    
    // Extract userId handling nulls
    const { userId, ...rest } = imageData;
    
    const image: Image = { 
      ...rest, 
      id, 
      createdAt: now,
      userId: userId || null
    };
    this.images.set(id, image);
    return image;
  }

  async getImage(id: number): Promise<Image | undefined> {
    return this.images.get(id);
  }

  async getUserImages(userId: number): Promise<Image[]> {
    return Array.from(this.images.values()).filter(
      (image) => image.userId === userId
    );
  }
}

// Use DatabaseStorage instead of MemStorage
export const storage = new DatabaseStorage();
