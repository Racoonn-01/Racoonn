"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Eye, EyeOff, Image as ImageIcon, Check, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { storage } from "@/lib/appwrite/client";
import { ID } from "appwrite";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";

export interface HeroImage {
  id: string;
  url: string;
  isActive: boolean;
  order: number;
}

export default function HeroSectionCMSPage() {
  const [images, setImages] = useState<HeroImage[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<HeroImage | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Form State
  const [urlInput, setUrlInput] = useState("");

  // Fetch CMS images from API
  useEffect(() => {
    async function loadCMSImages() {
      try {
        const res = await fetch(`/api/cms/hero?t=${Date.now()}`, { cache: 'no-store' });
        const json = await res.json();
        if (json.success && Array.isArray(json.images)) {
          setImages(json.images);
        }
      } catch (err) {
        console.error("Failed to load CMS hero images:", err);
      }
    }
    loadCMSImages();
  }, []);

  // Save to DB
  const saveImages = async (newImages: HeroImage[]) => {
    const previousImages = images;
    setImages(newImages);
    try {
      const res = await fetch("/api/cms/hero", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: newImages }),
      });
      
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save to database");
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Failed to save images:", error);
      alert("Failed to save images: " + (error.message || "Unknown error"));
      setImages(previousImages); // Rollback
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (!file) return;

    setIsUploading(true);
    try {
      const BUCKET_ID = "6a3e398000280b2b3d20";
      const PROJECT_ID = "6a3bce6900381359c3ce";
      const uploadedFile = await storage.createFile(BUCKET_ID, ID.unique(), file);
      const url = `https://sgp.cloud.appwrite.io/v1/storage/buckets/${BUCKET_ID}/files/${uploadedFile.$id}/view?project=${PROJECT_ID}`;
      setUrlInput(url);
    } catch (error) {
      console.error("Image upload failed", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleOpenAdd = () => {
    setUrlInput("");
    setIsAddOpen(true);
  };

  const handleCreate = () => {
    if (!urlInput.trim()) return;

    const newImg: HeroImage = {
      id: `img-${Date.now()}`,
      url: urlInput.trim(),
      isActive: true,
      order: images.length + 1,
    };

    saveImages([...images, newImg]);
    setIsAddOpen(false);
  };

  const handleOpenEdit = (img: HeroImage) => {
    setEditingImage(img);
    setUrlInput(img.url);
    setIsEditOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingImage || !urlInput.trim()) return;

    const updated = images.map((img) =>
      img.id === editingImage.id
        ? {
            ...img,
            url: urlInput.trim(),
          }
        : img
    );

    saveImages(updated);
    setIsEditOpen(false);
    setEditingImage(null);
  };

  const handleToggleActive = (id: string) => {
    const updated = images.map((img) =>
      img.id === id ? { ...img, isActive: !img.isActive } : img
    );
    saveImages(updated);
  };

  const handleDelete = () => {
    if (!deletingId) return;
    const updated = images.filter((img) => img.id !== deletingId);
    saveImages(updated);
    setDeletingId(null);
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <ImageIcon className="text-rose-500" size={28} /> Hero Section CMS
          </h1>
          <p className="text-gray-500 mt-1">
            Manage the slider images on the homepage hero section.
            <br />
            <span className="text-xs text-gray-400 mt-1 inline-block">
              Recommended image size: <strong>1920x1080px (16:9)</strong> or larger for best quality.
            </span>
          </p>
        </div>
        <Button
          onClick={handleOpenAdd}
          className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md gap-2 font-semibold"
        >
          <Plus size={18} /> Add New Image
        </Button>
      </div>

      {/* Images List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {images.map((img, index) => (
          <Card
            key={img.id}
            className={`border rounded-2xl shadow-sm transition-all overflow-hidden ${
              img.isActive ? "border-gray-200 bg-white" : "border-gray-200 bg-gray-50/70 opacity-75"
            }`}
          >
            <CardHeader className="bg-gray-50/50 pb-4 border-b border-gray-100 flex flex-row items-start justify-between">
              <div>
                <Badge variant={img.isActive ? "default" : "secondary"} className="rounded-md">
                  Slide #{index + 1}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={img.isActive}
                  onCheckedChange={() => handleToggleActive(img.id)}
                  title={img.isActive ? "Hide Image" : "Show Image"}
                />
              </div>
            </CardHeader>

            <CardContent className="p-0 flex flex-col bg-white">
              <div className="relative w-full h-48 bg-gray-100">
                <Image src={img.url} alt={`Slide ${index + 1}`} fill className="object-cover" unoptimized />
              </div>
              <div className="p-4 flex flex-col gap-3">
                <p className="text-xs text-gray-500 truncate" title={img.url}>{img.url}</p>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                    {img.isActive ? (
                      <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                        <Eye size={14} /> Visible
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-gray-400 font-semibold">
                        <EyeOff size={14} /> Hidden
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(img)}
                      className="rounded-lg gap-1 hover:bg-gray-100 text-gray-700 font-semibold"
                    >
                      <Edit2 size={14} /> Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeletingId(img.id)}
                      className="rounded-lg gap-1 font-semibold"
                    >
                      <Trash2 size={14} /> Delete
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {images.length === 0 && (
          <div className="col-span-full border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center bg-gray-50">
            <ImageIcon className="mx-auto text-gray-400 mb-3" size={36} />
            <h3 className="text-lg font-bold text-gray-700">No Hero Images Found</h3>
            <p className="text-sm text-gray-500 mt-1 mb-4">
              Click &quot;Add New Image&quot; above to add images to the homepage slider.
            </p>
            <Button
              onClick={handleOpenAdd}
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow"
            >
              Add New Image
            </Button>
          </div>
        )}
      </div>

      {/* Modal: Upload / Create Image */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] flex flex-col rounded-3xl p-0 overflow-hidden">
          <DialogHeader className="p-6 border-b border-gray-100 bg-gray-50/50">
            <DialogTitle className="text-xl font-bold">Add Hero Image</DialogTitle>
            <DialogDescription>
              Provide an image URL to add a new slide to the Hero Section.
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 overflow-y-auto space-y-5 flex-1 text-gray-900">
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                Upload Image *
              </label>
              
              {!urlInput ? (
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors bg-white relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mb-3">
                    <Upload className="text-rose-500" size={24} />
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900">
                    {isUploading ? "Uploading..." : "Click to upload an image"}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    JPEG, PNG, JPG or WebP (max 5MB)
                  </p>
                </div>
              ) : (
                <div className="relative w-full h-48 bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                  <Image src={urlInput} alt="Preview" fill className="object-cover" unoptimized />
                  <button
                    type="button"
                    onClick={() => setUrlInput("")}
                    className="absolute top-2 right-2 bg-white/80 backdrop-blur border border-gray-200 text-gray-700 hover:text-rose-600 rounded-full p-1.5 shadow-sm transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="p-4 px-6 border-t border-gray-100 bg-gray-50/50 gap-2">
            <Button variant="ghost" onClick={() => setIsAddOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!urlInput.trim()}
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md"
            >
              Add Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Edit Image */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] flex flex-col rounded-3xl p-0 overflow-hidden">
          <DialogHeader className="p-6 border-b border-gray-100 bg-gray-50/50">
            <DialogTitle className="text-xl font-bold">Edit Hero Image</DialogTitle>
            <DialogDescription>Update the image URL.</DialogDescription>
          </DialogHeader>

          <div className="p-6 overflow-y-auto space-y-5 flex-1 text-gray-900">
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                Upload Image *
              </label>
              
              {!urlInput ? (
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors bg-white relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mb-3">
                    <Upload className="text-rose-500" size={24} />
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900">
                    {isUploading ? "Uploading..." : "Click to upload an image"}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    JPEG, PNG, JPG or WebP (max 5MB)
                  </p>
                </div>
              ) : (
                <div className="relative w-full h-48 bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                  <Image src={urlInput} alt="Preview" fill className="object-cover" unoptimized />
                  <button
                    type="button"
                    onClick={() => setUrlInput("")}
                    className="absolute top-2 right-2 bg-white/80 backdrop-blur border border-gray-200 text-gray-700 hover:text-rose-600 rounded-full p-1.5 shadow-sm transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="p-4 px-6 border-t border-gray-100 bg-gray-50/50 gap-2">
            <Button variant="ghost" onClick={() => setIsEditOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={!urlInput.trim()}
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Delete Section */}
      <Dialog open={Boolean(deletingId)} onOpenChange={() => setDeletingId(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-rose-600 flex items-center gap-2">
               Delete Image?
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this Hero Image? It will be removed from the homepage.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0 pt-4">
            <Button variant="ghost" onClick={() => setDeletingId(null)} className="rounded-xl">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} className="rounded-xl">
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
