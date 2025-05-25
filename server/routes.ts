import express, { type Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import QRCode from "qrcode";
import { storage } from "./storage";
import { insertEventSchema, insertPhotoSchema, insertLikeSchema, insertCommentSchema, insertAlbumOrderSchema } from "@shared/schema";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded files
  app.use('/uploads', express.static(uploadDir));

  // Events
  app.post('/api/events', async (req, res) => {
    try {
      const eventData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(eventData);
      
      // Generate QR code
      const qrCodeUrl = `${process.env.REPLIT_DOMAINS?.split(',')[0] || 'localhost:5000'}/event/${event.qrCode}`;
      const qrCodeDataUrl = await QRCode.toDataURL(qrCodeUrl);
      
      res.json({ ...event, qrCodeDataUrl });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({ error: message });
    }
  });

  app.get('/api/events', async (req, res) => {
    try {
      const events = await storage.getAllEvents();
      res.json(events);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: message });
    }
  });

  app.get('/api/events/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const event = await storage.getEvent(id);
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
      res.json(event);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: message });
    }
  });

  app.get('/api/events/qr/:qrCode', async (req, res) => {
    try {
      const event = await storage.getEventByQrCode(req.params.qrCode);
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
      res.json(event);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: message });
    }
  });

  // Photos
  app.post('/api/events/:eventId/photos', upload.array('photos', 10), async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }

      const contributorName = req.body.contributorName || 'Anonymous';
      const caption = req.body.caption || '';

      const photos = [];
      for (const file of files) {
        const photoData = {
          eventId,
          filename: file.filename,
          originalName: file.originalname,
          contributorName,
          caption,
        };
        
        const photo = await storage.createPhoto(photoData);
        photos.push(photo);
      }

      res.json(photos);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({ error: message });
    }
  });

  app.get('/api/events/:eventId/photos', async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const photos = await storage.getPhotosByEvent(eventId);
      res.json(photos);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: message });
    }
  });

  app.delete('/api/photos/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const photo = await storage.getPhoto(id);
      
      if (!photo) {
        return res.status(404).json({ error: 'Photo not found' });
      }

      // Delete file from filesystem
      const filePath = path.join(uploadDir, photo.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      await storage.deletePhoto(id);
      res.json({ success: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: message });
    }
  });

  // Likes
  app.post('/api/photos/:photoId/likes', async (req, res) => {
    try {
      const photoId = parseInt(req.params.photoId);
      const { guestName } = req.body;
      
      if (!guestName) {
        return res.status(400).json({ error: 'Guest name is required' });
      }

      // Check if already liked
      const existingLikes = await storage.getLikesByPhoto(photoId);
      const alreadyLiked = existingLikes.some(like => like.guestName === guestName);
      
      if (alreadyLiked) {
        // Unlike
        await storage.deleteLike(photoId, guestName);
        const newLikeCount = existingLikes.length - 1;
        await storage.updatePhotoLikes(photoId, newLikeCount);
        res.json({ liked: false, count: newLikeCount });
      } else {
        // Like
        await storage.createLike({ photoId, guestName });
        const newLikeCount = existingLikes.length + 1;
        await storage.updatePhotoLikes(photoId, newLikeCount);
        res.json({ liked: true, count: newLikeCount });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({ error: message });
    }
  });

  // Comments
  app.post('/api/photos/:photoId/comments', async (req, res) => {
    try {
      const photoId = parseInt(req.params.photoId);
      const commentData = insertCommentSchema.parse({ ...req.body, photoId });
      const comment = await storage.createComment(commentData);
      res.json(comment);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({ error: message });
    }
  });

  app.get('/api/photos/:photoId/comments', async (req, res) => {
    try {
      const photoId = parseInt(req.params.photoId);
      const comments = await storage.getCommentsByPhoto(photoId);
      res.json(comments);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: message });
    }
  });

  // Album Orders
  app.post('/api/events/:eventId/album-orders', async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const orderData = insertAlbumOrderSchema.parse({ ...req.body, eventId });
      const order = await storage.createAlbumOrder(orderData);
      res.json(order);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({ error: message });
    }
  });

  app.get('/api/events/:eventId/album-orders', async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const orders = await storage.getAlbumOrdersByEvent(eventId);
      res.json(orders);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: message });
    }
  });

  // Admin stats
  app.get('/api/events/:eventId/stats', async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const photos = await storage.getPhotosByEvent(eventId);
      const orders = await storage.getAlbumOrdersByEvent(eventId);
      
      const totalLikes = photos.reduce((sum, photo) => sum + photo.likes, 0);
      const contributors = new Set(photos.map(photo => photo.contributorName)).size;
      
      res.json({
        totalPhotos: photos.length,
        totalLikes,
        contributors,
        albumOrders: orders.length,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}