"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Clock, Users, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { databases, appwriteConfig } from '@/lib/appwrite/config';
import { Query } from 'appwrite';

interface Activity {
  $id: string;
  title: string;
  location: string;
  duration: string;
  groupSize: string;
  price: string;
  image: string;
  images?: string[];
  description?: string;
  category: string;
}

const ActivityCard = ({ activity }: { activity: Activity }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = activity.images && activity.images.length > 0 ? activity.images : (activity.image ? [activity.image] : []);

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col">
      {/* Image Container */}
      <div className="relative h-64 overflow-hidden bg-gray-100">
        {images.length > 0 && (
          <Image
            src={images[currentImageIndex]}
            alt={activity.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        )}
        
        {/* Slider Controls */}
        {images.length > 1 && (
          <>
            <button 
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-brand-navy p-1.5 rounded-full shadow-md transition-colors z-10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-brand-navy p-1.5 rounded-full shadow-md transition-colors z-10"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            
            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {images.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`w-1.5 h-1.5 rounded-full ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                />
              ))}
            </div>
          </>
        )}

        <div className="absolute top-4 left-4 bg-white/95 text-brand-navy px-3 py-1 text-sm font-bold rounded-full shadow-md backdrop-blur-sm z-10">
          {activity.category}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col grow">
        <h3 className="text-xl font-bold text-brand-navy mb-1 group-hover:text-brand-coral transition-colors line-clamp-1">
          {activity.title}
        </h3>
        
        {activity.description && (
          <p className="text-gray-500 text-sm mb-3 line-clamp-2">
            {activity.description}
          </p>
        )}
        
        <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-5">
          <MapPin size={16} className="text-brand-coral flex-none" />
          <span className="truncate">{activity.location}</span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-gray-400" />
            <span className="truncate">
              {activity.duration}
              {!/[a-zA-Z]/.test(activity.duration) ? ' Days' : ''}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={16} className="text-gray-400" />
            <span className="truncate">
              {activity.groupSize}
              {!activity.groupSize.toLowerCase().includes('people') && !activity.groupSize.toLowerCase().includes('person') ? ' People' : ''}
            </span>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Starting from</span>
            <span className="text-xl font-bold text-brand-navy">
              {activity.price.startsWith('₹') || activity.price.startsWith('Rs') ? activity.price : `₹${activity.price}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.activitiesCollectionId,
          [Query.orderDesc('$createdAt')]
        );
        setActivities(res.documents as unknown as Activity[]);
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-10">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-brand-navy mb-4">
            Discover <span className="text-brand-coral">Activities</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Elevate your travel experience with curated adventures and memorable local activities.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-brand-coral" />
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            No activities available at the moment. Please check back later.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activities.map((activity) => (
              <ActivityCard key={activity.$id} activity={activity} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
