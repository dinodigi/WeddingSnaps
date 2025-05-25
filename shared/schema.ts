import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  coupleName: text("couple_name").notNull(),
  date: text("date").notNull(),
  venue: text("venue").notNull(),
  qrCode: text("qr_code").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const photos = pgTable("photos", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  contributorName: text("contributor_name"),
  caption: text("caption"),
  likes: integer("likes").notNull().default(0),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const likes = pgTable("likes", {
  id: serial("id").primaryKey(),
  photoId: integer("photo_id").notNull(),
  guestName: text("guest_name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  photoId: integer("photo_id").notNull(),
  guestName: text("guest_name").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const albumOrders = pgTable("album_orders", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  albumType: text("album_type").notNull(),
  selectedPhotos: text("selected_photos").notNull(), // JSON array of photo IDs
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  qrCode: true,
  isActive: true,
  createdAt: true,
});

export const insertPhotoSchema = createInsertSchema(photos).omit({
  id: true,
  likes: true,
  uploadedAt: true,
});

export const insertLikeSchema = createInsertSchema(likes).omit({
  id: true,
  createdAt: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
});

export const insertAlbumOrderSchema = createInsertSchema(albumOrders).omit({
  id: true,
  status: true,
  createdAt: true,
});

export type Event = typeof events.$inferSelect;
export type Photo = typeof photos.$inferSelect;
export type Like = typeof likes.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type AlbumOrder = typeof albumOrders.$inferSelect;

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type InsertPhoto = z.infer<typeof insertPhotoSchema>;
export type InsertLike = z.infer<typeof insertLikeSchema>;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type InsertAlbumOrder = z.infer<typeof insertAlbumOrderSchema>;
