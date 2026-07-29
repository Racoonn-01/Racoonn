"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { client, appwriteConfig, storage } from '@/lib/appwrite/client';
import { Databases, ID } from 'appwrite';
import { Loader2, ArrowLeft, Upload, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';

const databases = new Databases(client);

export default function NewMarketingOfferPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCodeManuallyEdited, setIsCodeManuallyEdited] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'Promo Code',
    discountType: 'percentage' as 'percentage' | 'flat',
    discountValue: 15,
    minOrderValue: 500,
    validUntil: '',
    status: 'Active',
    description: ''
  });

  useEffect(() => {
    if (!isCodeManuallyEdited) {
      if (formData.name) {
        const firstWord = formData.name.split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '');
        const autoCode = firstWord ? firstWord + (formData.discountValue || '') : '';
        setFormData(prev => ({ ...prev, code: autoCode }));
      } else {
        setFormData(prev => ({ ...prev, code: '' }));
      }
    }
  }, [formData.name, formData.discountValue, isCodeManuallyEdited]);

  const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '6a3cec630035d63ea963';
  const COLLECTION_ID = 'promotions';
  const BUCKET_ID = '6a3e398000280b2b3d20'; // Reusing general images bucket

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'discountValue' || name === 'minOrderValue' ? Number(value) : value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      alert("Please select a cover image for the offer");
      return;
    }

    try {
      setSubmitting(true);
      
      // Upload image
      const uploadedFile = await storage.createFile(BUCKET_ID, ID.unique(), imageFile);
      const imageUrl = `https://sgp.cloud.appwrite.io/v1/storage/buckets/${BUCKET_ID}/files/${uploadedFile.$id}/view?project=${appwriteConfig.projectId}`;

      // Create database document
      await databases.createDocument(
        DATABASE_ID,
        COLLECTION_ID,
        ID.unique(),
        {
            name: formData.name,
            code: formData.code.toUpperCase(),
            type: formData.type,
            discountType: formData.discountType,
            discountValue: formData.discountValue,
            minOrderValue: formData.minOrderValue,
            status: formData.status,
            validUntil: formData.validUntil || undefined,
            description: formData.description,
            image: imageUrl
        }
      );
      
      router.push('/admin/marketing');
    } catch (error) {
      console.error('Error creating offer:', error);
      alert('Failed to create offer: ' + ((error as Error).message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8 min-h-[calc(100vh-80px)]">
      <div className="flex items-center gap-4">
        <Link href="/admin/marketing">
          <Button variant="outline" size="icon" className="rounded-full h-10 w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
             <Sparkles className="h-6 w-6 text-[#E86A70]" /> Create Promotional Offer
          </h1>
          <p className="text-gray-500 mt-1">Configure a new special offer or discount code to display to users.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Image Upload Section */}
          <div className="space-y-4">
            <Label>Offer Cover Image</Label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {imagePreview ? (
                <div className="relative h-48 rounded-xl overflow-hidden border border-gray-200 group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button type="button" variant="destructive" size="sm" onClick={removeImage}>
                      Remove Image
                    </Button>
                  </div>
                </div>
              ) : (
                <label htmlFor="image-upload" className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex flex-col items-center justify-center p-4 text-center">
                    <Upload className="w-8 h-8 text-brand-navy/60 mb-2" />
                    <span className="text-sm font-semibold text-brand-navy">Click to upload cover image</span>
                    <span className="text-xs text-gray-400 mt-1">Recommended size: 800x600</span>
                  </div>
                  <input id="image-upload" type="file" className="hidden" accept="image/*" onChange={handleImageChange} required />
                </label>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Campaign / Offer Name</Label>
              <Input id="name" name="name" required value={formData.name} onChange={handleChange} placeholder="e.g. Monsoon Escape 20% Off" className="h-11 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Promo Code</Label>
              <Input 
                id="code" 
                name="code" 
                required 
                value={formData.code} 
                onChange={(e) => {
                  setIsCodeManuallyEdited(true);
                  setFormData({...formData, code: e.target.value.toUpperCase()});
                }} 
                placeholder="e.g. MONSOON20" 
                className="h-11 rounded-xl font-mono uppercase" 
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Offer Description</Label>
            <Textarea 
              id="description" 
              name="description" 
              required
              value={formData.description} 
              onChange={handleChange} 
              placeholder="Detailed description of the offer..." 
              className="min-h-25 resize-y rounded-xl" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="type">Offer Type</Label>
              <select 
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="flex h-11 w-full rounded-xl border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="Promo Code">Promo Code</option>
                <option value="Discount">Discount Coupon</option>
                <option value="Referral">Referral Program</option>
                <option value="Email">Email Special</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="discountType">Discount Type</Label>
              <select 
                id="discountType"
                name="discountType"
                value={formData.discountType}
                onChange={handleChange}
                className="flex h-11 w-full rounded-xl border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat Amount (₹)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="discountValue">Discount Value {formData.discountType === 'percentage' ? '(%)' : '(₹)'}</Label>
              <Input id="discountValue" name="discountValue" type="number" min="1" required value={formData.discountValue} onChange={handleChange} className="h-11 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minOrderValue">Min Order Tariff (₹)</Label>
              <Input id="minOrderValue" name="minOrderValue" type="number" min="0" required value={formData.minOrderValue} onChange={handleChange} className="h-11 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="validUntil">Valid Until Date</Label>
              <Input id="validUntil" name="validUntil" type="date" required value={formData.validUntil} onChange={handleChange} className="h-11 rounded-xl" />
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end gap-4">
            <Link href="/admin/marketing">
                <Button variant="outline" className="h-12 px-8 rounded-xl" type="button">Cancel</Button>
            </Link>
            <Button type="submit" disabled={submitting} className="h-12 px-8 rounded-xl bg-[#E86A70] hover:bg-[#d5585e] text-white">
              {submitting ? (
                <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Publishing...
                </>
              ) : (
                <>
                    <Sparkles className="mr-2 h-5 w-5" /> Publish Offer
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
