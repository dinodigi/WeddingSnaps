import { useState } from "react";
import { type Event } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Menu, Images, Camera, Gift, Settings } from "lucide-react";

interface MobileHeaderProps {
  event: Event;
}

export default function MobileHeader({ event }: MobileHeaderProps) {
  const [showMenu, setShowMenu] = useState(false);

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    setShowMenu(false);
  };

  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Heart className="text-wedding-gold text-xl" />
              <div>
                <h1 className="text-lg font-semibold text-wedding-charcoal">
                  {event.coupleName}
                </h1>
                <p className="text-xs text-gray-500">{event.date}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="hidden sm:inline-flex bg-green-100 text-green-800 hover:bg-green-100">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                Live Event
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMenu(!showMenu)}
                className="text-gray-400 hover:text-wedding-charcoal"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {showMenu && (
        <div className="bg-white border-b border-gray-100 sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <nav className="space-y-3">
              <button
                onClick={() => scrollToSection('gallery')}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors w-full text-left"
              >
                <Images className="text-wedding-gold w-5 h-5" />
                <span className="text-wedding-charcoal font-medium">Photo Gallery</span>
              </button>
              
              <button
                onClick={() => scrollToSection('upload')}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors w-full text-left"
              >
                <Camera className="text-wedding-gold w-5 h-5" />
                <span className="text-wedding-charcoal font-medium">Upload Photos</span>
              </button>
              
              <button
                onClick={() => scrollToSection('albums')}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors w-full text-left"
              >
                <Gift className="text-wedding-gold w-5 h-5" />
                <span className="text-wedding-charcoal font-medium">Order Albums</span>
              </button>
              
              <div className="border-t border-gray-100 pt-3 mt-3">
                <button
                  onClick={() => window.open('/admin', '_blank')}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-sm w-full text-left"
                >
                  <Settings className="text-gray-400 w-5 h-5" />
                  <span className="text-gray-600">Admin Dashboard</span>
                </button>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
