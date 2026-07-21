'use client';

import { useState } from 'react';
import { Share, Heart } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface PropertyHeaderActionsProps {
  propertyId: string;
  propertyTitle: string;
}

export default function PropertyHeaderActions({ propertyId, propertyTitle }: PropertyHeaderActionsProps) {
  const { profile, toggleSavedHotel, isAuthenticated } = useAuthStore();
  const [isSharing, setIsSharing] = useState(false);

  const isSaved = profile?.savedHotels?.includes(propertyId) || false;

  const handleShare = async () => {
    if (isSharing) return;
    
    const shareData = {
      title: propertyTitle,
      text: `Check out ${propertyTitle} on Racoonn!`,
      url: window.location.href,
    };

    try {
      setIsSharing(true);
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Error sharing:', err);
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handleSave = () => {
    if (!isAuthenticated) {
      alert("Please sign in to save properties.");
      return;
    }
    toggleSavedHotel(propertyId);
  };

  return (
    <div className="flex items-center gap-4 text-[14px] md:text-[15px] font-medium">
      <button 
        onClick={handleShare}
        className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
      >
        <Share size={16} /> <span className="underline underline-offset-4">Share</span>
      </button>
      <button 
        onClick={handleSave}
        className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
      >
        <Heart 
          size={16} 
          className={isSaved ? "fill-brand-coral text-brand-coral" : ""} 
        /> 
        <span className="underline underline-offset-4">{isSaved ? 'Saved' : 'Save'}</span>
      </button>
    </div>
  );
}
