"use client";

import React, { useState, useEffect } from 'react';
import { client, appwriteConfig } from '@/lib/appwrite/client';
import { Databases, Query } from 'appwrite';
import { Plus, Trash2, Loader2, MapPin, Clock, Users, ChevronLeft, ChevronRight, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Tent } from 'lucide-react';

const databases = new Databases(client);

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

const ActivityCardAdmin = ({ activity, handleDelete }: { activity: Activity, handleDelete: (id: string) => void }) => {
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
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col group hover:shadow-md transition-shadow">
      <div className="relative h-48 bg-gray-100">
        {images.length > 0 && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={images[currentImageIndex]} alt={activity.title} className="w-full h-full object-cover" />
          </>
        )}
        
        {/* Slider Controls */}
        {images.length > 1 && (
          <>
            <button 
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-brand-navy p-1 rounded-full shadow-md transition-colors z-10"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-brand-navy p-1 rounded-full shadow-md transition-colors z-10"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            
            {/* Dots */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
              {images.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`w-1.5 h-1.5 rounded-full ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                />
              ))}
            </div>
          </>
        )}
        
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-sm font-semibold px-2.5 py-1 rounded-full text-gray-800 z-10">
          {activity.category}
        </div>
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <Link href={`/admin/activities/edit/${activity.$id}`}>
            <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full shadow-lg bg-white/90 hover:bg-white text-gray-700 hover:text-brand-navy">
              <Edit2 className="h-4 w-4" />
            </Button>
          </Link>
          <Button size="icon" variant="destructive" className="h-8 w-8 rounded-full shadow-lg" onClick={() => handleDelete(activity.$id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-bold text-lg text-gray-900 line-clamp-1 mb-1">{activity.title}</h3>
        
        {activity.description && (
          <p className="text-gray-500 text-sm mb-3 line-clamp-2">
            {activity.description}
          </p>
        )}

        <div className="flex items-center text-sm text-gray-500 mb-4 gap-1.5">
          <MapPin className="h-4 w-4" /> <span className="line-clamp-1">{activity.location}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="truncate">
              {activity.duration}
              {!/[a-zA-Z]/.test(activity.duration) ? ' Days' : ''}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-gray-400" />
            <span className="truncate">
              {activity.groupSize}
              {!activity.groupSize.toLowerCase().includes('people') && !activity.groupSize.toLowerCase().includes('person') ? ' People' : ''}
            </span>
          </div>
        </div>

        <div className="mt-auto flex justify-between items-end pt-2 border-t border-gray-100">
          <span className="text-xs text-gray-500 uppercase font-semibold">Starting from</span>
          <span className="font-bold text-lg text-brand-navy">
            {activity.price.startsWith('₹') || activity.price.startsWith('Rs') ? activity.price : `₹${activity.price}`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_ACTIVITIES_COLLECTION_ID || 'activities';

  useEffect(() => {
    const loadActivities = async () => {
      try {
        setLoading(true);
        const res = await databases.listDocuments(
          appwriteConfig.databaseId,
          COLLECTION_ID,
          [Query.orderDesc('$createdAt')]
        );
        setActivities(res.documents as unknown as Activity[]);
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    };
    loadActivities();
  }, [COLLECTION_ID]);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this activity?')) {
      try {
        await databases.deleteDocument(appwriteConfig.databaseId, COLLECTION_ID, id);
        // Quick local reload function for delete
        setLoading(true);
        const res = await databases.listDocuments(
          appwriteConfig.databaseId,
          COLLECTION_ID,
          [Query.orderDesc('$createdAt')]
        );
        setActivities(res.documents as unknown as Activity[]);
        setLoading(false);
      } catch (error) {
        console.error('Error deleting activity:', error);
      }
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-8 bg-gray-50/50 min-h-[calc(100vh-80px)]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Activities Management</h1>
          <p className="text-gray-500 mt-1">Manage and add activities for the User panel.</p>
        </div>

        <Link href="/admin/activities/new">
            <Button className="gap-2">
            <Plus className="h-4 w-4" /> Add Activity
            </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-xl border border-dashed border-gray-300">
          <Tent className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No activities found</h3>
          <p className="text-gray-500 mt-1">Get started by creating a new activity.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity) => (
            <ActivityCardAdmin key={activity.$id} activity={activity} handleDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
