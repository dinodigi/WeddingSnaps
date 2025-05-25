import { 
  events, photos, likes, comments, albumOrders,
  type Event, type Photo, type Like, type Comment, type AlbumOrder,
  type InsertEvent, type InsertPhoto, type InsertLike, type InsertComment, type InsertAlbumOrder
} from "@shared/schema";

export interface IStorage {
  // Events
  createEvent(event: InsertEvent): Promise<Event>;
  getEvent(id: number): Promise<Event | undefined>;
  getEventByQrCode(qrCode: string): Promise<Event | undefined>;
  getAllEvents(): Promise<Event[]>;
  updateEvent(id: number, updates: Partial<Event>): Promise<Event | undefined>;
  
  // Photos
  createPhoto(photo: InsertPhoto): Promise<Photo>;
  getPhoto(id: number): Promise<Photo | undefined>;
  getPhotosByEvent(eventId: number): Promise<Photo[]>;
  deletePhoto(id: number): Promise<boolean>;
  updatePhotoLikes(id: number, likes: number): Promise<Photo | undefined>;
  
  // Likes
  createLike(like: InsertLike): Promise<Like>;
  getLikesByPhoto(photoId: number): Promise<Like[]>;
  deleteLike(photoId: number, guestName: string): Promise<boolean>;
  
  // Comments
  createComment(comment: InsertComment): Promise<Comment>;
  getCommentsByPhoto(photoId: number): Promise<Comment[]>;
  deleteComment(id: number): Promise<boolean>;
  
  // Album Orders
  createAlbumOrder(order: InsertAlbumOrder): Promise<AlbumOrder>;
  getAlbumOrdersByEvent(eventId: number): Promise<AlbumOrder[]>;
  updateAlbumOrderStatus(id: number, status: string): Promise<AlbumOrder | undefined>;
}

export class MemStorage implements IStorage {
  private events: Map<number, Event>;
  private photos: Map<number, Photo>;
  private likes: Map<number, Like>;
  private comments: Map<number, Comment>;
  private albumOrders: Map<number, AlbumOrder>;
  private currentEventId: number;
  private currentPhotoId: number;
  private currentLikeId: number;
  private currentCommentId: number;
  private currentAlbumOrderId: number;

  constructor() {
    this.events = new Map();
    this.photos = new Map();
    this.likes = new Map();
    this.comments = new Map();
    this.albumOrders = new Map();
    this.currentEventId = 1;
    this.currentPhotoId = 1;
    this.currentLikeId = 1;
    this.currentCommentId = 1;
    this.currentAlbumOrderId = 1;
  }

  // Events
  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = this.currentEventId++;
    const qrCode = `event-${id}-${Date.now()}`;
    const event: Event = {
      ...insertEvent,
      id,
      qrCode,
      isActive: true,
      createdAt: new Date(),
    };
    this.events.set(id, event);
    return event;
  }

  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async getEventByQrCode(qrCode: string): Promise<Event | undefined> {
    return Array.from(this.events.values()).find(event => event.qrCode === qrCode);
  }

  async getAllEvents(): Promise<Event[]> {
    return Array.from(this.events.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async updateEvent(id: number, updates: Partial<Event>): Promise<Event | undefined> {
    const event = this.events.get(id);
    if (!event) return undefined;
    
    const updatedEvent = { ...event, ...updates };
    this.events.set(id, updatedEvent);
    return updatedEvent;
  }

  // Photos
  async createPhoto(insertPhoto: InsertPhoto): Promise<Photo> {
    const id = this.currentPhotoId++;
    const photo: Photo = {
      id,
      eventId: insertPhoto.eventId,
      filename: insertPhoto.filename,
      originalName: insertPhoto.originalName,
      contributorName: insertPhoto.contributorName || null,
      caption: insertPhoto.caption || null,
      likes: 0,
      uploadedAt: new Date(),
    };
    this.photos.set(id, photo);
    return photo;
  }

  async getPhoto(id: number): Promise<Photo | undefined> {
    return this.photos.get(id);
  }

  async getPhotosByEvent(eventId: number): Promise<Photo[]> {
    return Array.from(this.photos.values())
      .filter(photo => photo.eventId === eventId)
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  }

  async deletePhoto(id: number): Promise<boolean> {
    return this.photos.delete(id);
  }

  async updatePhotoLikes(id: number, likes: number): Promise<Photo | undefined> {
    const photo = this.photos.get(id);
    if (!photo) return undefined;
    
    const updatedPhoto = { ...photo, likes };
    this.photos.set(id, updatedPhoto);
    return updatedPhoto;
  }

  // Likes
  async createLike(insertLike: InsertLike): Promise<Like> {
    const id = this.currentLikeId++;
    const like: Like = {
      ...insertLike,
      id,
      createdAt: new Date(),
    };
    this.likes.set(id, like);
    return like;
  }

  async getLikesByPhoto(photoId: number): Promise<Like[]> {
    return Array.from(this.likes.values()).filter(like => like.photoId === photoId);
  }

  async deleteLike(photoId: number, guestName: string): Promise<boolean> {
    const like = Array.from(this.likes.values()).find(
      l => l.photoId === photoId && l.guestName === guestName
    );
    if (!like) return false;
    return this.likes.delete(like.id);
  }

  // Comments
  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = this.currentCommentId++;
    const comment: Comment = {
      ...insertComment,
      id,
      createdAt: new Date(),
    };
    this.comments.set(id, comment);
    return comment;
  }

  async getCommentsByPhoto(photoId: number): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter(comment => comment.photoId === photoId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async deleteComment(id: number): Promise<boolean> {
    return this.comments.delete(id);
  }

  // Album Orders
  async createAlbumOrder(insertOrder: InsertAlbumOrder): Promise<AlbumOrder> {
    const id = this.currentAlbumOrderId++;
    const order: AlbumOrder = {
      ...insertOrder,
      id,
      status: "pending",
      createdAt: new Date(),
    };
    this.albumOrders.set(id, order);
    return order;
  }

  async getAlbumOrdersByEvent(eventId: number): Promise<AlbumOrder[]> {
    return Array.from(this.albumOrders.values())
      .filter(order => order.eventId === eventId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async updateAlbumOrderStatus(id: number, status: string): Promise<AlbumOrder | undefined> {
    const order = this.albumOrders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = { ...order, status };
    this.albumOrders.set(id, updatedOrder);
    return updatedOrder;
  }
}

export const storage = new MemStorage();
