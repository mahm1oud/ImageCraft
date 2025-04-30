import { images, type Image, type InsertImage, users, type User, type InsertUser } from "@shared/schema";

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
    const image: Image = { 
      ...imageData, 
      id, 
      createdAt: now 
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

export const storage = new MemStorage();
