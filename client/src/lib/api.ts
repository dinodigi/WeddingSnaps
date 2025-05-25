import { apiRequest } from "./queryClient";
import type { InsertEvent, InsertPhoto, InsertLike, InsertComment, InsertAlbumOrder } from "@shared/schema";

export const api = {
  // Events
  createEvent: async (event: InsertEvent) => {
    const response = await apiRequest('POST', '/api/events', event);
    return response.json();
  },

  getEvents: async () => {
    const response = await apiRequest('GET', '/api/events');
    return response.json();
  },

  getEvent: async (id: number) => {
    const response = await apiRequest('GET', `/api/events/${id}`);
    return response.json();
  },

  getEventByQrCode: async (qrCode: string) => {
    const response = await apiRequest('GET', `/api/events/qr/${qrCode}`);
    return response.json();
  },

  // Photos
  uploadPhotos: async (eventId: number, files: File[], contributorName: string, caption: string) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('photos', file);
    });
    formData.append('contributorName', contributorName);
    formData.append('caption', caption);

    const response = await fetch(`/api/events/${eventId}/photos`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    return response.json();
  },

  getPhotos: async (eventId: number) => {
    const response = await apiRequest('GET', `/api/events/${eventId}/photos`);
    return response.json();
  },

  deletePhoto: async (photoId: number) => {
    const response = await apiRequest('DELETE', `/api/photos/${photoId}`);
    return response.json();
  },

  // Likes
  toggleLike: async (photoId: number, guestName: string) => {
    const response = await apiRequest('POST', `/api/photos/${photoId}/likes`, { guestName });
    return response.json();
  },

  // Comments
  addComment: async (photoId: number, comment: Omit<InsertComment, 'photoId'>) => {
    const response = await apiRequest('POST', `/api/photos/${photoId}/comments`, comment);
    return response.json();
  },

  getComments: async (photoId: number) => {
    const response = await apiRequest('GET', `/api/photos/${photoId}/comments`);
    return response.json();
  },

  // Album Orders
  createAlbumOrder: async (eventId: number, order: Omit<InsertAlbumOrder, 'eventId'>) => {
    const response = await apiRequest('POST', `/api/events/${eventId}/album-orders`, order);
    return response.json();
  },

  getAlbumOrders: async (eventId: number) => {
    const response = await apiRequest('GET', `/api/events/${eventId}/album-orders`);
    return response.json();
  },

  // Stats
  getEventStats: async (eventId: number) => {
    const response = await apiRequest('GET', `/api/events/${eventId}/stats`);
    return response.json();
  },
};
