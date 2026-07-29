"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Save, Image as ImageIcon, UploadCloud } from "lucide-react";
import { updateBlog, getBlogById } from "../../actions";
import { storage } from "@/lib/appwrite/client";
import { ID } from "appwrite";
import RichTextEditor from "@/components/ui/RichTextEditor";

const BUCKET_ID = "6a3e398000280b2b3d20";
const PROJECT_ID = "6a3bce6900381359c3ce";

export default function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [id, setId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    excerpt: "",
    content: "",
    images: [] as string[],
    status: "Draft" as "Published" | "Draft" | "Archived"
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const resolvedParams = await params;
        const blogId = resolvedParams.id;
        setId(blogId);

        const blog = await getBlogById(blogId);
        if (blog) {
          const blogImages = blog.images && blog.images.length > 0 ? blog.images : (blog.imageId ? [blog.imageId] : []);
          setFormData({
            title: blog.title,
            category: blog.category,
            excerpt: blog.excerpt,
            content: blog.content || "",
            images: blogImages,
            status: blog.status as any
          });
          setPreviewUrls(blogImages);
        }
      } catch (error) {
        console.error("Failed to load blog:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBlog();
  }, [params]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedFiles(prev => [...prev, ...files]);
      const newUrls = files.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...newUrls]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files || []).filter(f => f.type.startsWith("image/"));
    if (files.length > 0) {
      setSelectedFiles(prev => [...prev, ...files]);
      const newUrls = files.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...newUrls]);
    }
  };

  const removeImage = (index: number) => {
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    // If it's a newly selected file (exists in selectedFiles based on diff logic), we'd ideally match them,
    // but a simpler approach is to rely on previewUrls as the source of truth for existing vs new.
    // However, it's safer to just let the user delete from preview, but we need to track which ones are existing vs new.
    // For simplicity, we just clear everything if they want to change, or just allow adding.
    // A robust solution:
    const removedUrl = previewUrls[index];
    if (formData.images.includes(removedUrl)) {
        // It was an existing image
        setFormData(prev => ({ ...prev, images: prev.images.filter(url => url !== removedUrl) }));
    } else {
        // It's a newly selected file
        // To accurately remove from selectedFiles, we need to find the correct index in selectedFiles.
        // Assuming the new files are appended at the end of previewUrls...
        const existingCount = formData.images.length;
        const fileIndex = index - existingCount;
        if (fileIndex >= 0) {
            setSelectedFiles(prev => prev.filter((_, i) => i !== fileIndex));
        }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    setIsSubmitting(true);
    try {
      const finalImages = [...formData.images];

      for (const file of selectedFiles) {
        const uploadedFile = await storage.createFile(BUCKET_ID, ID.unique(), file);
        const url = `https://sgp.cloud.appwrite.io/v1/storage/buckets/${BUCKET_ID}/files/${uploadedFile.$id}/view?project=${PROJECT_ID}`;
        finalImages.push(url);
      }

      await updateBlog(id, {
        ...formData,
        images: finalImages,
        image: finalImages.length > 0 ? finalImages[0] : ""
      });
      router.push("/cms/blogs");
      router.refresh();
    } catch (error) {
      console.error("Failed to update blog", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button 
          type="button"
          variant="ghost" 
          onClick={() => router.push("/cms/blogs")}
          className="text-slate-500"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <h1 className="text-3xl font-bold text-slate-900">Edit Blog</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Blog Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Title</label>
              <Input 
                required
                placeholder="Enter blog title" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Category</label>
              <Input 
                required
                placeholder="e.g. Travel Guide" 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Excerpt</label>
              <Textarea 
                required
                placeholder="A short summary of the blog post" 
                value={formData.excerpt}
                onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Content</label>
              <div className="rounded-md overflow-hidden border border-input focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                <RichTextEditor 
                  value={formData.content}
                  onChange={(val) => setFormData({...formData, content: val})}
                  placeholder="Start writing your amazing article here..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Images</label>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                multiple
                className="hidden"
              />
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="border-2 border-dashed border-input rounded-md p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 hover:border-slate-300 transition-colors mb-4"
              >
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                  <UploadCloud className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-sm font-semibold text-slate-700">Click or drag images to upload</p>
                <p className="text-xs text-slate-500 mt-1">SVG, PNG, JPG (max 2MB each)</p>
              </div>

              {previewUrls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative aspect-video rounded-md overflow-hidden group border border-slate-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(index);
                          }}
                          className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                        >
                          <UploadCloud className="w-4 h-4 rotate-45" /> {/* Quick delete icon workaround */}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Status</label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => router.push("/cms/blogs")}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-[#E86A70] hover:bg-[#d65b61] text-white">
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                ) : (
                  <><Save className="w-4 h-4 mr-2" /> Save Changes</>
                )}
              </Button>
            </div>

          </CardContent>
        </Card>
      </form>
    </div>
  );
}
