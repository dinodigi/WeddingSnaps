import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Heart, Calendar, MapPin, Plus } from "lucide-react";
import { insertEventSchema, type Event } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { z } from "zod";

const createEventSchema = insertEventSchema.extend({
  coupleName: z.string().min(1, "Couple name is required"),
  date: z.string().min(1, "Date is required"),
  venue: z.string().min(1, "Venue is required"),
});

export default function Home() {
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ['/api/events'],
  });

  const form = useForm<z.infer<typeof createEventSchema>>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      coupleName: "",
      date: "",
      venue: "",
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: z.infer<typeof createEventSchema>) => {
      const response = await apiRequest('POST', '/api/events', data);
      return response.json();
    },
    onSuccess: () => {
      form.reset();
      setShowCreateForm(false);
      // Invalidate and refetch events
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
    },
  });

  const onSubmit = (data: z.infer<typeof createEventSchema>) => {
    createEventMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-wedding-primary via-white to-wedding-beige">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <Heart className="text-wedding-gold text-4xl" />
            <h1 className="text-4xl md:text-5xl font-bold text-wedding-charcoal">WeddingShare</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Create beautiful photo galleries for your wedding day. Let guests share their memories instantly with QR code access.
          </p>
        </div>

        {/* Create Event Button */}
        {!showCreateForm && (
          <div className="text-center mb-8">
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-wedding-gold hover:bg-wedding-gold/90 text-white px-8 py-3 text-lg"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Wedding Event
            </Button>
          </div>
        )}

        {/* Create Event Form */}
        {showCreateForm && (
          <Card className="max-w-md mx-auto mb-12">
            <CardHeader>
              <CardTitle className="text-center text-wedding-charcoal">Create Wedding Event</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="coupleName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Couple Names</FormLabel>
                        <FormControl>
                          <Input placeholder="Sarah & Michael" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wedding Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="venue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Venue</FormLabel>
                        <FormControl>
                          <Input placeholder="Rosewood Manor Gardens" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex space-x-3">
                    <Button
                      type="submit"
                      className="flex-1 bg-wedding-gold hover:bg-wedding-gold/90 text-white"
                      disabled={createEventMutation.isPending}
                    >
                      {createEventMutation.isPending ? "Creating..." : "Create Event"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateForm(false)}
                      className="border-wedding-gold text-wedding-gold hover:bg-wedding-gold hover:text-white"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Events List */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-wedding-charcoal mb-6 text-center">Wedding Events</h2>
          
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
                <Card key={event.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <Link href={`/event/${event.qrCode}`}>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-2 mb-3">
                        <Heart className="text-wedding-gold text-lg" />
                        <h3 className="font-semibold text-wedding-charcoal group-hover:text-wedding-gold transition-colors">
                          {event.coupleName}
                        </h3>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4" />
                          <span>{event.venue}</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-green-600 font-medium">
                            Active Event
                          </span>
                          <Link href={`/admin`} className="text-xs text-wedding-gold hover:underline">
                            Manage →
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No events yet</h3>
                <p className="text-gray-500 mb-6">Create your first wedding event to get started</p>
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-wedding-gold hover:bg-wedding-gold/90 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Wedding Event
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
