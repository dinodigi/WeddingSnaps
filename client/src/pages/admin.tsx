import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type Event } from "@shared/schema";
import AdminDashboard from "@/components/admin-dashboard";
import QRDisplay from "@/components/qr-display";
import { Crown, Heart, Calendar, MapPin, QrCode, Settings } from "lucide-react";

export default function Admin() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ['/api/events'],
  });

  if (selectedEvent) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-wedding-charcoal to-gray-700 text-white p-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Crown className="text-wedding-gold text-2xl" />
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="opacity-90">{selectedEvent.coupleName}</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setSelectedEvent(null)}
              className="border-white text-white hover:bg-white hover:text-wedding-charcoal"
            >
              Back to Events
            </Button>
          </div>
        </div>
        
        <AdminDashboard event={selectedEvent} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-wedding-charcoal to-gray-700 text-white p-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Crown className="text-wedding-gold text-3xl" />
            <h1 className="text-3xl font-bold">Wedding Admin</h1>
          </div>
          <p className="text-lg opacity-90">Manage your wedding events and photo galleries</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-wedding-charcoal mb-2">Your Events</h2>
          <p className="text-gray-600">Select an event to view its admin dashboard</p>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : events && events.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-wedding-charcoal flex items-center space-x-2">
                      <Heart className="text-wedding-gold text-xl" />
                      <span>{event.coupleName}</span>
                    </CardTitle>
                    <Badge 
                      variant={event.isActive ? "default" : "secondary"}
                      className={event.isActive ? "bg-green-100 text-green-800" : ""}
                    >
                      {event.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span>{event.venue}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <QrCode className="w-4 h-4" />
                      <span className="font-mono text-xs break-all">{event.qrCode}</span>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100 space-y-3">
                    <Button
                      onClick={() => setSelectedEvent(event)}
                      className="w-full bg-wedding-gold hover:bg-wedding-gold/90 text-white"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Manage Event
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full border-wedding-gold text-wedding-gold hover:bg-wedding-gold hover:text-white"
                      onClick={() => window.open(`/event/${event.qrCode}`, '_blank')}
                    >
                      <QrCode className="w-4 h-4 mr-2" />
                      View Guest Page
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <Crown className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No events to manage</h3>
              <p className="text-gray-500 mb-6">Create your first wedding event to start managing galleries</p>
              <Button className="bg-wedding-gold hover:bg-wedding-gold/90 text-white">
                Create New Event
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
