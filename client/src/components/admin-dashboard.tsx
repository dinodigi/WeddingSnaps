import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { type Event, type Photo, type AlbumOrder } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import QRDisplay from "./qr-display";
import {
  Images,
  Users,
  Heart,
  ShoppingCart,
  QrCode,
  Shield,
  Download,
  Wand2,
  List,
  BarChart3,
  Trash2,
  Eye,
} from "lucide-react";

interface AdminDashboardProps {
  event: Event;
}

interface EventStats {
  totalPhotos: number;
  totalLikes: number;
  contributors: number;
  albumOrders: number;
}

export default function AdminDashboard({ event }: AdminDashboardProps) {
  const [showPhotos, setShowPhotos] = useState(false);
  const { toast } = useToast();

  const { data: stats } = useQuery<EventStats>({
    queryKey: [`/api/events/${event.id}/stats`],
  });

  const { data: photos = [] } = useQuery<Photo[]>({
    queryKey: [`/api/events/${event.id}/photos`],
    enabled: showPhotos,
  });

  const { data: orders = [] } = useQuery<AlbumOrder[]>({
    queryKey: [`/api/events/${event.id}/album-orders`],
  });

  const deletePhotoMutation = useMutation({
    mutationFn: async (photoId: number) => {
      await apiRequest('DELETE', `/api/photos/${photoId}`);
    },
    onSuccess: () => {
      toast({
        title: "Photo deleted",
        description: "The photo has been removed from the gallery",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/events/${event.id}/photos`] });
      queryClient.invalidateQueries({ queryKey: [`/api/events/${event.id}/stats`] });
    },
    onError: (error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleExportPhotos = () => {
    // In a real implementation, this would trigger a download of all photos
    toast({
      title: "Export started",
      description: "Your photo export will be ready shortly",
    });
  };

  const handleGenerateQR = () => {
    toast({
      title: "QR Code ready",
      description: "Use the QR code below to share with guests",
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <Images className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-wedding-charcoal">
              {stats?.totalPhotos || 0}
            </p>
            <p className="text-sm text-gray-600">Total Photos</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="bg-wedding-gold/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-wedding-gold" />
            </div>
            <p className="text-2xl font-bold text-wedding-charcoal">
              {stats?.contributors || 0}
            </p>
            <p className="text-sm text-gray-600">Contributors</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <Heart className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-wedding-charcoal">
              {stats?.totalLikes || 0}
            </p>
            <p className="text-sm text-gray-600">Total Likes</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <ShoppingCart className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-wedding-charcoal">
              {stats?.albumOrders || 0}
            </p>
            <p className="text-sm text-gray-600">Album Orders</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Event Management */}
        <Card>
          <CardHeader>
            <CardTitle className="text-wedding-charcoal">Event Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleGenerateQR}
              className="w-full bg-wedding-gold hover:bg-wedding-gold/90 text-white"
            >
              <QrCode className="w-4 h-4 mr-2" />
              Generate New QR Code
            </Button>

            <Button
              onClick={() => setShowPhotos(!showPhotos)}
              variant="outline"
              className="w-full border-gray-300 hover:bg-gray-50"
            >
              <Shield className="w-4 h-4 mr-2" />
              {showPhotos ? "Hide Photos" : "Moderate Photos"}
            </Button>

            <Button
              onClick={handleExportPhotos}
              variant="outline"
              className="w-full border-gray-300 hover:bg-gray-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Export All Photos
            </Button>
          </CardContent>
        </Card>

        {/* Album Management */}
        <Card>
          <CardHeader>
            <CardTitle className="text-wedding-charcoal">Album Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full bg-wedding-charcoal hover:bg-wedding-charcoal/90 text-white"
            >
              <Wand2 className="w-4 h-4 mr-2" />
              Create Curated Album
            </Button>

            <Button
              variant="outline"
              className="w-full border-gray-300 hover:bg-gray-50"
            >
              <List className="w-4 h-4 mr-2" />
              View Album Orders ({orders.length})
            </Button>

            <Button
              variant="outline"
              className="w-full border-gray-300 hover:bg-gray-50"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics Report
            </Button>
          </CardContent>
        </Card>

        {/* QR Code Display */}
        <div>
          <QRDisplay event={event} />
        </div>
      </div>

      {/* Album Orders */}
      {orders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-wedding-charcoal">Recent Album Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium text-wedding-charcoal">{order.customerName}</p>
                    <p className="text-sm text-gray-600">{order.albumType}</p>
                    <p className="text-xs text-gray-500">{order.customerEmail}</p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={order.status === "pending" ? "secondary" : "default"}
                      className={order.status === "pending" ? "bg-yellow-100 text-yellow-800" : ""}
                    >
                      {order.status}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Photo Moderation */}
      {showPhotos && (
        <Card>
          <CardHeader>
            <CardTitle className="text-wedding-charcoal">Photo Moderation</CardTitle>
          </CardHeader>
          <CardContent>
            {photos.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No photos to moderate</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {photos.map((photo) => (
                  <div key={photo.id} className="group relative">
                    <img
                      src={`/uploads/${photo.filename}`}
                      alt={photo.originalName}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-white hover:bg-white/20"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deletePhotoMutation.mutate(photo.id)}
                        disabled={deletePhotoMutation.isPending}
                        className="text-red-400 hover:bg-red-500/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="mt-2">
                      <p className="text-xs text-gray-600 truncate">
                        {photo.contributorName || "Anonymous"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {photo.likes} {photo.likes === 1 ? "like" : "likes"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
