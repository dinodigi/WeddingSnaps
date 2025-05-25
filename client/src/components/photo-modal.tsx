import { useState, useEffect } from "react";
import { type Photo, type Comment } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Heart, Share, Send, X, User, Clock } from "lucide-react";

interface PhotoModalProps {
  photo: Photo;
  onClose: () => void;
  onPhotoLiked?: () => void;
}

export default function PhotoModal({ photo, onClose, onPhotoLiked }: PhotoModalProps) {
  const [newComment, setNewComment] = useState("");
  const [guestName, setGuestName] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const { toast } = useToast();

  // Get guest name from localStorage
  useEffect(() => {
    const storedName = localStorage.getItem('guestName') || "";
    setGuestName(storedName);
  }, []);

  const { data: comments = [] } = useQuery<Comment[]>({
    queryKey: [`/api/photos/${photo.id}/comments`],
  });

  const likeMutation = useMutation({
    mutationFn: async (guestName: string) => {
      const response = await apiRequest('POST', `/api/photos/${photo.id}/likes`, { guestName });
      return response.json();
    },
    onSuccess: (data) => {
      setIsLiked(data.liked);
      onPhotoLiked?.();
      queryClient.invalidateQueries({ queryKey: [`/api/events/${photo.eventId}/photos`] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const commentMutation = useMutation({
    mutationFn: async ({ content, guestName }: { content: string, guestName: string }) => {
      const response = await apiRequest('POST', `/api/photos/${photo.id}/comments`, {
        content,
        guestName,
      });
      return response.json();
    },
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: [`/api/photos/${photo.id}/comments`] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleLike = () => {
    if (!guestName.trim()) {
      toast({
        title: "Please enter your name",
        description: "We need your name to record your like",
        variant: "destructive",
      });
      return;
    }
    
    localStorage.setItem('guestName', guestName);
    likeMutation.mutate(guestName);
  };

  const handleComment = () => {
    if (!newComment.trim() || !guestName.trim()) {
      toast({
        title: "Please fill in all fields",
        description: "Both name and comment are required",
        variant: "destructive",
      });
      return;
    }
    
    localStorage.setItem('guestName', guestName);
    commentMutation.mutate({ content: newComment, guestName });
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: `Photo from ${photo.contributorName || "Anonymous"}`,
        text: photo.caption || "Check out this photo from the wedding!",
        url: window.location.href,
      });
    } catch (error) {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Photo link has been copied to clipboard",
      });
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "A";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0 gap-0">
        <div className="flex flex-col lg:flex-row h-full">
          {/* Image Section */}
          <div className="flex-1 bg-black flex items-center justify-center p-4">
            <img
              src={`/uploads/${photo.filename}`}
              alt={photo.originalName}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
          
          {/* Details Section */}
          <div className="w-full lg:w-80 border-l border-gray-100 flex flex-col bg-white">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-wedding-gold text-white text-sm">
                    {getInitials(photo.contributorName || "Anonymous")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-wedding-charcoal text-sm">
                    {photo.contributorName || "Anonymous"}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(photo.uploadedAt).toLocaleString()}</span>
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Actions */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <Button
                  variant="ghost"
                  onClick={handleLike}
                  disabled={likeMutation.isPending}
                  className={`flex items-center space-x-2 ${
                    isLiked ? "text-red-500 hover:text-red-600" : "text-gray-500 hover:text-red-500"
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
                  <span>{photo.likes}</span>
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleShare}
                  className="flex items-center space-x-2 text-gray-500 hover:text-wedding-charcoal"
                >
                  <Share className="w-4 h-4" />
                  <span>Share</span>
                </Button>
              </div>
              
              {photo.caption && (
                <p className="text-gray-600 text-sm leading-relaxed">{photo.caption}</p>
              )}
            </div>
            
            {/* Comments */}
            <div className="flex-1 flex flex-col">
              <div className="p-4">
                <h4 className="font-semibold text-wedding-charcoal mb-3">Comments</h4>
              </div>
              
              <ScrollArea className="flex-1 px-4">
                <div className="space-y-3 pb-4">
                  {comments.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">
                      No comments yet. Be the first to share your thoughts!
                    </p>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="flex space-x-2">
                        <Avatar className="w-6 h-6 flex-shrink-0">
                          <AvatarFallback className="bg-blue-500 text-white text-xs">
                            {getInitials(comment.guestName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">
                            <span className="font-medium text-wedding-charcoal">
                              {comment.guestName}
                            </span>{" "}
                            <span className="text-gray-600">{comment.content}</span>
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(comment.createdAt).toLocaleDateString()} at{" "}
                            {new Date(comment.createdAt).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
              
              {/* Add Comment */}
              <div className="p-4 border-t border-gray-100 space-y-3">
                <Input
                  placeholder="Your name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="text-sm"
                />
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleComment()}
                    className="flex-1 text-sm"
                  />
                  <Button
                    onClick={handleComment}
                    disabled={commentMutation.isPending || !newComment.trim() || !guestName.trim()}
                    size="icon"
                    className="bg-wedding-gold hover:bg-wedding-gold/90 text-white"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
