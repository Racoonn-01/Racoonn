"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { client, appwriteConfig, storage } from '@/lib/appwrite/client';
import { Databases, ID } from 'appwrite';
import { Loader2, ArrowLeft, Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';

const databases = new Databases(client);

export default function NewActivityPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    duration: '',
    groupSize: '',
    price: '',
    category: '',
    description: ''
  });

  const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_ACTIVITIES_COLLECTION_ID || 'activities';
  const BUCKET_ID = '6a3e398000280b2b3d20'; // Reusing general images bucket

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setImageFiles(prev => [...prev, ...files]);
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (imageFiles.length === 0) {
      alert("Please select at least one image");
      return;
    }

    try {
      setSubmitting(true);
      
      // Upload all images to storage
      const uploadPromises = imageFiles.map(async (file) => {
        const uploadedFile = await storage.createFile(BUCKET_ID, ID.unique(), file);
        return `https://sgp.cloud.appwrite.io/v1/storage/buckets/${BUCKET_ID}/files/${uploadedFile.$id}/view?project=${appwriteConfig.projectId}`;
      });

      const imageUrls = await Promise.all(uploadPromises);

      // Create database document
      await databases.createDocument(
        appwriteConfig.databaseId,
        COLLECTION_ID,
        ID.unique(),
        {
            ...formData,
            image: imageUrls[0], // first image for backward compatibility
            images: imageUrls    // all images
        }
      );
      
      router.push('/admin/activities');
    } catch (error) {
      console.error('Error creating activity:', error);
      alert('Failed to create activity.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8 min-h-[calc(100vh-80px)]">
      <div className="flex items-center gap-4">
        <Link href="/admin/activities">
          <Button variant="outline" size="icon" className="rounded-full h-10 w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Add New Activity</h1>
          <p className="text-gray-500 mt-1">Create a new activity to offer your users.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Image Upload Section */}
          <div className="space-y-4">
            <Label>Activity Images</Label>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {imagePreviews.map((preview, idx) => (
                <div key={idx} className="relative h-32 rounded-xl overflow-hidden border border-gray-200 group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button type="button" variant="destructive" size="sm" onClick={() => removeImage(idx)}>
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
              
              <label htmlFor="image-upload" className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex flex-col items-center justify-center p-4 text-center">
                  <Upload className="w-6 h-6 text-brand-navy/60 mb-2" />
                  <span className="text-xs font-semibold text-brand-navy">Add Images</span>
                </div>
                <input id="image-upload" type="file" className="hidden" accept="image/*" multiple onChange={handleImageChange} />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" required value={formData.title} onChange={handleChange} placeholder="e.g. River Rafting" className="h-12" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" name="category" required value={formData.category} onChange={handleChange} placeholder="e.g. Water Sports" className="h-12" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" name="location" required value={formData.location} onChange={handleChange} placeholder="e.g. Rishikesh, Uttarakhand" className="h-12" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea 
              id="description" 
              name="description" 
              value={formData.description} 
              onChange={handleChange as any} 
              placeholder="Detailed description of the activity..." 
              className="min-h-30 resize-y" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Input id="duration" name="duration" required value={formData.duration} onChange={handleChange} placeholder="e.g. Half Day" className="h-12" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="groupSize">Group Size</Label>
              <Input id="groupSize" name="groupSize" required value={formData.groupSize} onChange={handleChange} placeholder="e.g. 4-8 People" className="h-12" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (Display Text)</Label>
              <Input id="price" name="price" required value={formData.price} onChange={handleChange} placeholder="e.g. ₹1,500" className="h-12" />
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end gap-4">
            <Link href="/admin/activities">
                <Button variant="outline" className="h-12 px-8" type="button">Cancel</Button>
            </Link>
            <Button type="submit" disabled={submitting} className="h-12 px-8">
              {submitting ? (
                <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving...
                </>
              ) : (
                  'Create Activity'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
