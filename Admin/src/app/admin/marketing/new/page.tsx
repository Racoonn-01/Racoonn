"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { client, appwriteConfig, storage } from '@/lib/appwrite/client';
import { Databases, ID } from 'appwrite';
import { Loader2, ArrowLeft, Upload, Zap, Building2, Package, Globe, Eye, EyeOff, ShieldCheck, Tag } from 'lucide-react';
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
    applicableTo: 'rooms' as 'rooms' | 'packages' | 'all',
    isPublic: true,
    discountType: 'percentage' as 'percentage' | 'flat',
    discountValue: 15,
    maxDiscountCap: '',
    minOrderValue: 500,
    usageLimitType: 'unlimited' as 'unlimited' | 'one_time_per_user' | 'total_limit',
    totalLimit: '',
    firstBookingOnly: false,
    validUntil: '',
    status: 'Active',
    description: '',
    assignedUserEmail: ''
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
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        [name]: name === 'discountValue' || name === 'minOrderValue' ? Number(value) : value 
      }));
    }
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
    if (formData.isPublic && !imageFile) {
      alert("Please upload a cover banner image so this offer looks great on the public User Offers page.");
      return;
    }

    try {
      setSubmitting(true);
      
      let imageUrl = "";
      if (imageFile) {
        const uploadedFile = await storage.createFile(BUCKET_ID, ID.unique(), imageFile);
        imageUrl = `https://sgp.cloud.appwrite.io/v1/storage/buckets/${BUCKET_ID}/files/${uploadedFile.$id}/preview?project=${appwriteConfig.projectId}&output=webp`;
      }

      // Create database document
      const docData: any = {
        name: formData.name.trim(),
        code: formData.code.toUpperCase().trim(),
        type: formData.type,
        applicableTo: formData.applicableTo,
        isPublic: Boolean(formData.isPublic),
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        minOrderValue: Number(formData.minOrderValue || 0),
        usageLimitType: formData.usageLimitType,
        firstBookingOnly: Boolean(formData.firstBookingOnly),
        usedCount: 0,
        status: formData.status,
        validUntil: formData.validUntil || undefined,
        description: formData.description || "",
        image: imageUrl
      };

      if (formData.maxDiscountCap && Number(formData.maxDiscountCap) > 0) {
        docData.maxDiscountCap = Number(formData.maxDiscountCap);
      }

      if (formData.usageLimitType === 'total_limit' && formData.totalLimit && Number(formData.totalLimit) > 0) {
        docData.totalLimit = Number(formData.totalLimit);
      }

      if (formData.assignedUserEmail && formData.assignedUserEmail.trim() !== '') {
        docData.assignedUserEmail = formData.assignedUserEmail.trim();
      }

      await databases.createDocument(
        DATABASE_ID,
        COLLECTION_ID,
        ID.unique(),
        docData
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
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/marketing">
          <Button variant="outline" size="icon" className="rounded-full h-8 w-8 border-slate-200">
            <ArrowLeft className="h-4 w-4 text-slate-600" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Create Promotional Offer</h1>
          <p className="text-xs text-slate-500 mt-0.5">Set discount terms, target applicability, and visibility rules.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Applicability Segmented Control */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-700">Where can this coupon be redeemed?</Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'rooms', label: 'Hotel Rooms Only', desc: 'Stays only' },
                { id: 'packages', label: 'Holiday Packages', desc: 'Tours only' },
                { id: 'all', label: 'Sitewide', desc: 'Rooms & tours' },
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, applicableTo: opt.id as any }))}
                  className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                    formData.applicableTo === opt.id 
                      ? 'border-slate-900 bg-slate-900 text-white' 
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <p className="text-xs font-medium leading-tight">{opt.label}</p>
                  <p className={`text-[11px] mt-0.5 ${formData.applicableTo === opt.id ? 'text-slate-300' : 'text-slate-400'}`}>
                    {opt.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Visibility Row */}
          <div className="p-3.5 rounded-lg border border-slate-200/70 bg-slate-50/50 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-slate-800">
                {formData.isPublic ? "Display on User /offers Page (Public)" : "Secret Promo Code (Hidden from Web)"}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {formData.isPublic 
                  ? "Visible to all website visitors on the Special Offers directory." 
                  : "Hidden from website browsing. Only guests you share this code with can use it."}
              </p>
            </div>
            
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, isPublic: !prev.isPublic }))}
              className="text-xs px-3 py-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-medium transition-colors cursor-pointer shrink-0"
            >
              {formData.isPublic ? "Make Secret" : "Make Public"}
            </button>
          </div>

          {/* Cover image (required only if public) */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-700">
              Banner Image {formData.isPublic ? <span className="text-rose-500">*</span> : <span className="text-slate-400 font-normal">(Optional for secret codes)</span>}
            </Label>
            
            {imagePreview ? (
              <div className="relative h-36 rounded-lg overflow-hidden border border-slate-200 group max-w-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button type="button" variant="destructive" size="sm" onClick={removeImage} className="h-7 text-xs">
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <label htmlFor="image-upload" className="flex items-center justify-center h-24 border border-dashed border-slate-200 rounded-lg cursor-pointer bg-slate-50/50 hover:bg-slate-100/60 transition-colors max-w-sm">
                <div className="text-center p-2">
                  <Upload className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                  <span className="text-xs font-medium text-slate-600">Upload banner image</span>
                </div>
                <input id="image-upload" type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
            )}
          </div>

          {/* Name & Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-medium text-slate-700">Offer Name</Label>
              <Input id="name" name="name" required value={formData.name} onChange={handleChange} placeholder="e.g. Summer Getaway 15% Off" className="h-9 text-xs rounded-lg" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="code" className="text-xs font-medium text-slate-700">Promo Code</Label>
              <Input 
                id="code" 
                name="code" 
                required 
                value={formData.code} 
                onChange={(e) => {
                  setIsCodeManuallyEdited(true);
                  setFormData({...formData, code: e.target.value.toUpperCase()});
                }} 
                placeholder="e.g. SUMMER15" 
                className="h-9 text-xs rounded-lg font-mono uppercase" 
              />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs font-medium text-slate-700">Description</Label>
            <Textarea 
              id="description" 
              name="description" 
              required
              value={formData.description} 
              onChange={handleChange} 
              placeholder="Brief details about terms or eligibility..." 
              className="min-h-18 text-xs rounded-lg resize-y" 
            />
          </div>

          {/* Discount values */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="discountType" className="text-xs font-medium text-slate-700">Discount Type</Label>
              <select 
                id="discountType"
                name="discountType"
                value={formData.discountType}
                onChange={handleChange}
                className="flex h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs shadow-xs focus-visible:outline-none"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat Amount (₹)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="discountValue" className="text-xs font-medium text-slate-700">
                Value {formData.discountType === 'percentage' ? '(%)' : '(₹)'}
              </Label>
              <Input id="discountValue" name="discountValue" type="number" min="1" required value={formData.discountValue} onChange={handleChange} className="h-9 text-xs rounded-lg" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="maxDiscountCap" className="text-xs font-medium text-slate-700">Max Discount Cap (₹)</Label>
              <Input 
                id="maxDiscountCap" 
                name="maxDiscountCap" 
                type="number" 
                min="0" 
                value={formData.maxDiscountCap} 
                onChange={handleChange} 
                placeholder="e.g. 1500 (Optional)" 
                className="h-9 text-xs rounded-lg" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="minOrderValue" className="text-xs font-medium text-slate-700">Min Booking Amount (₹)</Label>
              <Input id="minOrderValue" name="minOrderValue" type="number" min="0" required value={formData.minOrderValue} onChange={handleChange} className="h-9 text-xs rounded-lg" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="validUntil" className="text-xs font-medium text-slate-700">Expiry Date</Label>
              <Input id="validUntil" name="validUntil" type="date" required value={formData.validUntil} onChange={handleChange} className="h-9 text-xs rounded-lg" />
            </div>
          </div>

          {/* Rules */}
          <div className="p-3.5 rounded-lg border border-slate-200/70 bg-slate-50/40 space-y-3">
            <p className="text-xs font-medium text-slate-800">Usage Rules</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="usageLimitType" className="text-[11px] text-slate-600">Redemption Limit</Label>
                <select 
                  id="usageLimitType"
                  name="usageLimitType"
                  value={formData.usageLimitType}
                  onChange={handleChange}
                  className="flex h-8.5 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs shadow-xs focus-visible:outline-none"
                >
                  <option value="unlimited">Unlimited (Can be used multiple times)</option>
                  <option value="one_time_per_user">One-Time Per Guest</option>
                  <option value="total_limit">Total Global Claims Limit</option>
                </select>
              </div>

              {formData.usageLimitType === 'total_limit' && (
                <div className="space-y-1.5">
                  <Label htmlFor="totalLimit" className="text-[11px] text-slate-600">Total Uses Cap</Label>
                  <Input 
                    id="totalLimit" 
                    name="totalLimit" 
                    type="number" 
                    min="1" 
                    value={formData.totalLimit} 
                    onChange={handleChange} 
                    placeholder="e.g. 100" 
                    className="h-8.5 text-xs rounded-lg bg-white" 
                  />
                </div>
              )}
            </div>

            <div className="pt-1 flex items-center gap-2">
              <input 
                type="checkbox" 
                id="firstBookingOnly"
                name="firstBookingOnly" 
                checked={formData.firstBookingOnly} 
                onChange={handleChange}
                className="h-3.5 w-3.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900" 
              />
              <label htmlFor="firstBookingOnly" className="text-xs text-slate-700 cursor-pointer">
                First-time guests only (Valid only on guest&apos;s initial booking)
              </label>
            </div>
          </div>

          {/* Optional specific guest */}
          <div className="space-y-1.5">
            <Label htmlFor="assignedUserEmail" className="text-xs font-medium text-slate-700">Specific Guest Email (Optional)</Label>
            <Input 
              id="assignedUserEmail" 
              name="assignedUserEmail" 
              type="email" 
              value={formData.assignedUserEmail} 
              onChange={handleChange} 
              placeholder="Leave blank for any guest" 
              className="h-9 text-xs rounded-lg" 
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Link href="/admin/marketing">
              <Button variant="outline" className="h-9 px-4 text-xs font-medium rounded-lg" type="button">Cancel</Button>
            </Link>
            <Button type="submit" disabled={submitting} className="h-9 px-5 text-xs font-medium rounded-lg bg-slate-900 hover:bg-slate-800 text-white cursor-pointer">
              {submitting ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Publishing...
                </>
              ) : (
                "Publish Offer"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}


