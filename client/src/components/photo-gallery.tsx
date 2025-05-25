import { useState } from "react";
import { type Photo } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import PhotoModal from "./photo-modal";
import { Grid, Heart, User, Clock, Loader2 } from "lucide-react";

interface PhotoGalleryProps {
  photos: Photo[];
  isLoading: boolean;
  onPhotoLiked?: () => void;
}

export default function PhotoGallery({ photos, isLoading, onPhotoLiked }: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [sortBy, setSortBy] = useState("recent");
  const [visibleCount, setVisibleCount] = useState(20);

  const sortedPhotos = [...photos].sort((a, b) => {
    switch (sortBy) {
      case "likes":
        return b.likes - a.likes;
      case "contributor":
        return (a.contributorName || "").localeCompare(b.contributorName || "");
      case "recent":
      default:
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
    }
  });

  const visiblePhotos = sortedPhotos.slice(0, visibleCount);
  const contributors = new Set(photos.map(photo => photo.contributorName).filter(Boolean)).size;

  const loadMore = () => {
    setVisibleCount(prev => prev + 20);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-wedding-gold" />
          <p className="text-gray-600">Loading photos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h3 className="text-2xl font-bold text-wedding-charcoal mb-2">Wedding Gallery</h3>
          <p className="text-gray-600">
            <span className="font-medium">{photos.length}</span> photos • 
            <span className="font-medium ml-1">{contributors}</span> contributors
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="likes">Most Liked</SelectItem>
              <SelectItem value="contributor">By Contributor</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="icon"
            className="border-gray-300 hover:bg-white"
          >
            <Grid className="w-4 h-4 text-gray-600" />
          </Button>
        </div>
      </div>
      
      {photos.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-xl font-semibold text-gray-600 mb-2">No photos yet</h4>
            <p className="text-gray-500">Be the first to share a memory from this special day!</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Photo Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {visiblePhotos.map((photo) => (
              <div
                key={photo.id}
                className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedPhoto(photo)}
              >
                <img
                  src={`/uploads/${photo.filename}`}
                  alt={photo.originalName}
                  className="w-full h-32 sm:h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center justify-between text-white text-xs">
                    <div className="flex items-center space-x-1 truncate">
                      <User className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{photo.contributorName || "Anonymous"}</span>
                    </div>
                    <div className="flex items-center space-x-1 flex-shrink-0">
                      <Heart className="w-3 h-3 text-red-400" />
                      <span>{photo.likes}</span>
                    </div>
                  </div>
                </div>
                
                {/* Timestamp overlay */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-black/50 text-white text-xs px-2 py-1 rounded flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(photo.uploadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Load More Button */}
          {visibleCount < sortedPhotos.length && (
            <div className="text-center mt-8">
              <Button
                onClick={loadMore}
                variant="outline"
                className="border-2 border-wedding-gold text-wedding-gold hover:bg-wedding-gold hover:text-white px-8 py-3 rounded-xl font-semibold transition-all"
              >
                Load More Photos ({sortedPhotos.length - visibleCount} remaining)
              </Button>
            </div>
          )}
        </>
      )}
      
      {/* Photo Modal */}
      {selectedPhoto && (
        <PhotoModal
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          onPhotoLiked={onPhotoLiked}
        />
      )}
    </div>
  );
}
