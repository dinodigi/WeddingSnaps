import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { CloudUpload, Camera, Images, X, Check } from "lucide-react";

interface PhotoUploadProps {
  eventId: number;
  onUploadSuccess?: () => void;
}

interface UploadFile extends File {
  id: string;
  preview: string;
}

export default function PhotoUpload({ eventId, onUploadSuccess }: PhotoUploadProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [contributorName, setContributorName] = useState("");
  const [caption, setCaption] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async ({ files, contributorName, caption }: { 
      files: UploadFile[], 
      contributorName: string, 
      caption: string 
    }) => {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('photos', file);
      });
      formData.append('contributorName', contributorName || 'Anonymous');
      formData.append('caption', caption);

      // Simulate upload progress
      const response = await fetch(`/api/events/${eventId}/photos`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Photos uploaded successfully!",
        description: `${files.length} photo(s) have been added to the gallery.`,
      });
      setFiles([]);
      setCaption("");
      setUploadProgress(0);
      onUploadSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
      setUploadProgress(0);
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      ...file,
      id: Math.random().toString(36).substr(2, 9),
      preview: URL.createObjectURL(file),
    }));
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 10,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const removeFile = (id: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  const handleUpload = () => {
    if (files.length === 0) return;
    
    setUploadProgress(0);
    uploadMutation.mutate({ files, contributorName, caption });
    
    // Simulate progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleCameraCapture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.multiple = true;
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files) {
        onDrop(Array.from(target.files));
      }
    };
    input.click();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-wedding-charcoal mb-2">Upload Your Photos</h3>
        <p className="text-gray-600">Share your favorite moments from the celebration</p>
      </div>
      
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`bg-gray-50 border-2 border-dashed rounded-2xl p-8 text-center transition-colors cursor-pointer ${
          isDragActive ? 'border-wedding-gold bg-wedding-gold/5' : 'border-gray-300 hover:border-wedding-gold'
        }`}
      >
        <input {...getInputProps()} />
        <div className="max-w-sm mx-auto">
          <CloudUpload className="text-4xl text-wedding-gold mb-4 mx-auto" />
          <h4 className="text-lg font-semibold text-wedding-charcoal mb-2">
            {isDragActive ? "Drop photos here..." : "Drop photos here or click to browse"}
          </h4>
          <p className="text-gray-500 text-sm mb-6">Support for JPG, PNG up to 10MB each</p>
          
          <div className="space-y-3">
            <Button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleCameraCapture();
              }}
              className="w-full bg-wedding-gold hover:bg-wedding-gold/90 text-white py-3 px-6 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2"
            >
              <Camera className="w-4 h-4" />
              <span>Take Photo</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full border-2 border-wedding-gold text-wedding-gold hover:bg-wedding-gold hover:text-white py-3 px-6 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2"
            >
              <Images className="w-4 h-4" />
              <span>Choose from Gallery</span>
            </Button>
          </div>
        </div>
      </div>
      
      {/* File Preview */}
      {files.length > 0 && (
        <Card className="mt-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-wedding-charcoal">Selected Photos ({files.length})</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  files.forEach(file => URL.revokeObjectURL(file.preview));
                  setFiles([]);
                }}
                className="text-gray-500 hover:text-red-500"
              >
                Clear All
              </Button>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-4">
              {files.map((file) => (
                <div key={file.id} className="relative group">
                  <img
                    src={file.preview}
                    alt={file.name}
                    className="w-full h-20 object-cover rounded-lg"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="contributorName">Your Name (Optional)</Label>
                <Input
                  id="contributorName"
                  value={contributorName}
                  onChange={(e) => setContributorName(e.target.value)}
                  placeholder="Enter your name"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="caption">Caption (Optional)</Label>
                <Input
                  id="caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Add a caption to your photos"
                  className="mt-1"
                />
              </div>
              
              <Button
                onClick={handleUpload}
                disabled={uploadMutation.isPending}
                className="w-full bg-wedding-gold hover:bg-wedding-gold/90 text-white py-3 font-semibold"
              >
                {uploadMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <CloudUpload className="w-4 h-4 mr-2" />
                    Upload {files.length} Photo{files.length > 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Upload Progress */}
      {uploadMutation.isPending && uploadProgress > 0 && (
        <Card className="mt-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-wedding-charcoal">Uploading photos...</span>
              <span className="text-sm text-gray-500">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
