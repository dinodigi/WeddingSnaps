import { useState, useEffect } from "react";
import { type Event } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { QrCode, Copy, Share } from "lucide-react";

interface QRDisplayProps {
  event: Event;
}

export default function QRDisplay({ event }: QRDisplayProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    // Generate QR code on client side
    const generateQRCode = async () => {
      try {
        const QRCode = (await import('qrcode')).default;
        const domains = process.env.REPLIT_DOMAINS || 'localhost:5000';
        const domain = domains.split(',')[0];
        const url = `https://${domain}/event/${event.qrCode}`;
        const qrDataUrl = await QRCode.toDataURL(url, {
          width: 200,
          margin: 2,
          color: {
            dark: '#2D2D2D',
            light: '#FFFFFF'
          }
        });
        setQrCodeDataUrl(qrDataUrl);
      } catch (error) {
        console.error('Failed to generate QR code:', error);
      }
    };

    generateQRCode();
  }, [event.qrCode]);

  const handleCopyLink = async () => {
    try {
      const domains = process.env.REPLIT_DOMAINS || 'localhost:5000';
      const domain = domains.split(',')[0];
      const url = `https://${domain}/event/${event.qrCode}`;
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied!",
        description: "The wedding gallery link has been copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    try {
      const domains = process.env.REPLIT_DOMAINS || 'localhost:5000';
      const domain = domains.split(',')[0];
      const url = `https://${domain}/event/${event.qrCode}`;
      
      if (navigator.share) {
        await navigator.share({
          title: `${event.coupleName}'s Wedding Photos`,
          text: "Join us in sharing memories from this special day!",
          url: url,
        });
      } else {
        // Fallback to copying
        await navigator.clipboard.writeText(url);
        toast({
          title: "Link copied!",
          description: "Share this link with wedding guests",
        });
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  return (
    <div className="flex justify-center">
      <Card className="bg-white shadow-lg border border-gray-100">
        <CardContent className="p-6">
          <h4 className="text-lg font-semibold text-wedding-charcoal mb-3 text-center">
            Share with Guests
          </h4>
          
          <div className="flex justify-center mb-4">
            {qrCodeDataUrl ? (
              <img
                src={qrCodeDataUrl}
                alt="QR Code for wedding event"
                className="w-32 h-32 border-2 border-gray-200 rounded-lg"
              />
            ) : (
              <div className="w-32 h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                <QrCode className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>
          
          <p className="text-sm text-gray-600 text-center mb-4">
            Scan to access<br/>
            <span className="font-medium text-wedding-charcoal break-all">
              {window.location.origin}/event/{event.qrCode}
            </span>
          </p>
          
          <div className="space-y-2">
            <Button
              onClick={handleShare}
              className="w-full bg-wedding-gold hover:bg-wedding-gold/90 text-white text-sm"
              size="sm"
            >
              <Share className="w-3 h-3 mr-2" />
              Share Link
            </Button>
            <Button
              onClick={handleCopyLink}
              variant="outline"
              className="w-full border-wedding-gold text-wedding-gold hover:bg-wedding-gold hover:text-white text-sm"
              size="sm"
            >
              <Copy className="w-3 h-3 mr-2" />
              Copy Link
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
