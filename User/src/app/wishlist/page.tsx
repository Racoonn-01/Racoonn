'use client';

import React from 'react';
import SavedHotelsGrid from '@/components/profile/sections/SavedHotelsGrid';

export default function WishlistPage() {
  return (
    <div className="min-h-screen bg-gray-50/50 py-12">
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
        <SavedHotelsGrid />
      </div>
    </div>
  );
}
