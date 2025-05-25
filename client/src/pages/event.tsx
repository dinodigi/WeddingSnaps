import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { type Event, type Photo } from "@shared/schema";
import MobileHeader from "@/components/mobile-header";
import PhotoUpload from "@/components/photo-upload";
import PhotoGallery from "@/components/photo-gallery";
import QRDisplay from "@/components/qr-display";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Camera, Images, Loader2 } from "lucide-react";

export default function Event() {
  const { qrCode } = useParams();

  const { data: event, isLoading: eventLoading, error: eventError } = useQuery<Event>({
    queryKey: [`/api/events/qr/${qrCode}`],
    enabled: !!qrCode,
  });

  const { data: photos = [], isLoading: photosLoading, refetch: refetchPhotos } = useQuery<Photo[]>({
    queryKey: [`/api/events/${event?.id}/photos`],
    enabled: !!event?.id,
  });

  if (eventLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-wedding-gold" />
          <p className="text-gray-600">Loading wedding event...</p>
        </div>
      </div>
    );
  }

  if (eventError || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Event Not Found</h2>
            <p className="text-gray-600 mb-4">
              We couldn't find the wedding event you're looking for. Please check the QR code or link.
            </p>
            <Button className="bg-wedding-gold hover:bg-wedding-gold/90 text-white">
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader event={event} />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-wedding-primary via-white to-wedding-beige py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Hero Image */}
            <div className="relative mb-8 rounded-2xl overflow-hidden shadow-2xl mx-auto max-w-2xl">
              <img 
                src="https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
                alt="Wedding ceremony"
                className="w-full h-48 sm:h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h2 className="text-xl sm:text-2xl font-bold mb-1">{event.coupleName}'s Wedding</h2>
                <p className="text-sm opacity-90">{event.venue}</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="text-left">
                <h3 className="text-2xl sm:text-3xl font-bold text-wedding-charcoal mb-4">Share Your Memories</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Capture and share the magic of this special day. Upload your photos instantly and browse everyone's beautiful moments from the celebration.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    className="bg-wedding-gold hover:bg-wedding-gold/90 text-white px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
                    onClick={() => document.getElementById('upload')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    <Camera className="w-4 h-4" />
                    <span>Upload Photos</span>
                  </Button>
                  <Button 
                    variant="outline"
                    className="border-2 border-wedding-gold text-wedding-gold hover:bg-wedding-gold hover:text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2"
                    onClick={() => document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    <Images className="w-4 h-4" />
                    <span>View Gallery</span>
                  </Button>
                </div>
              </div>
              
              <QRDisplay event={event} />
            </div>
          </div>
        </div>
      </section>

      {/* Photo Upload Section */}
      <section id="upload" className="py-12 bg-white">
        <PhotoUpload eventId={event.id} onUploadSuccess={refetchPhotos} />
      </section>

      {/* Photo Gallery Section */}
      <section id="gallery" className="py-12 bg-gray-50">
        <PhotoGallery 
          photos={photos} 
          isLoading={photosLoading}
          onPhotoLiked={refetchPhotos}
        />
      </section>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button 
          className="bg-wedding-gold hover:bg-wedding-gold/90 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          onClick={() => document.getElementById('upload')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <Camera className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}
