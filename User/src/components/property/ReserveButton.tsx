'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import AuthModal from '@/components/auth/AuthModal';

interface ReserveButtonProps {
  roomName: string;
  price: number;
}

export default function ReserveButton({ roomName, price }: ReserveButtonProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleReserve = () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
    } else {
      router.push(`/checkout?roomName=${encodeURIComponent(roomName)}&price=${price}`);
    }
  };

  return (
    <>
      <button 
        onClick={handleReserve}
        className="w-full py-3 bg-brand-navy text-white rounded-xl font-bold hover:bg-opacity-90 transition-all"
      >
        Reserve
      </button>

      {/* Auth Modal for Unauthenticated Users */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialView="signin" 
      />
    </>
  );
}
