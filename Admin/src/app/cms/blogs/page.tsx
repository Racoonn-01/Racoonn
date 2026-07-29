"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileText,
  Eye,
  Plus,
  Loader2,
  Trash2,
  Calendar,
  CheckCircle2,
  Clock,
  PenSquare
} from "lucide-react";
import {
  getBlogsData,
  createBlog,
  deleteBlog,
  BlogItem
} from "./actions";
import { client, appwriteConfig } from "@/lib/appwrite/client";

export default function BlogsPage() {
  const [data, setData] = useState<{
    totalBlogs: number;
    publishedCount: number;
    totalViews: number;
    blogs: BlogItem[];
  }>({
    totalBlogs: 0,
    publishedCount: 0,
    totalViews: 0,
    blogs: []
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Blog Form State
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    category: "",
    status: "Draft" as "Published" | "Draft" | "Archived"
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const response = await getBlogsData();
      setData(response);
    } catch (error) {
      console.error("Failed to load blogs", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Appwrite Realtime Subscribe for Views
    const unsubscribe = client.subscribe(
      `databases.${appwriteConfig.databaseId}.collections.blogs.documents`, 
      (response) => {
        if (response.events.some((e: string) => e.includes('.update'))) {
          const updatedDoc = response.payload as any;
          setData(prev => {
            let updated = false;
            const updatedBlogs = prev.blogs.map(blog => {
              if (blog.id === updatedDoc.$id) {
                updated = true;
                return { ...blog, views: updatedDoc.views || 0 };
              }
              return blog;
            });

            if (!updated) return prev; // If it's a new post or unrelated, ignore here. loadData handles creates/deletes.

            return {
              ...prev,
              blogs: updatedBlogs,
              totalViews: updatedBlogs.reduce((acc, curr) => acc + curr.views, 0)
            };
          });
        } else if (response.events.some((e: string) => e.includes('.create') || e.includes('.delete'))) {
          loadData(); // Re-fetch the whole list if a blog is added or deleted
        }
      }
    );

    return () => unsubscribe();
  }, []);

  const handleCreateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createBlog(formData);
      setIsModalOpen(false);
      setFormData({ title: "", excerpt: "", category: "", status: "Draft" });
      await loadData();
    } catch (error) {
      console.error("Failed to create blog", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this blog?")) {
      await deleteBlog(id);
      await loadData();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Published":
        return <Badge className="bg-emerald-500 hover:bg-emerald-600">Published</Badge>;
      case "Draft":
        return <Badge className="bg-amber-500 hover:bg-amber-600">Draft</Badge>;
      default:
        return <Badge variant="outline" className="text-slate-500">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground font-medium">Loading blogs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Blog Management</h1>
          <p className="text-slate-500 mt-1 font-medium">Write, publish, and manage your CMS articles.</p>
        </div>
        <Link href="/cms/blogs/create">
          <Button 
            className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 shadow-md shadow-primary/20"
          >
            <Plus className="w-4 h-4 mr-2" />
            Write New Blog
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-none shadow-md shadow-slate-200/50 hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Blogs</CardTitle>
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <FileText className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{data.totalBlogs}</div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md shadow-slate-200/50 hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Published</CardTitle>
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{data.publishedCount}</div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md shadow-slate-200/50 hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Views</CardTitle>
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
              <Eye className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{data.totalViews.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Blog List Table */}
      <Card className="border-none shadow-md shadow-slate-200/50 overflow-hidden rounded-2xl">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
          <CardTitle className="text-lg text-slate-800">All Blogs</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="font-semibold text-slate-600">Article Details</TableHead>
                <TableHead className="font-semibold text-slate-600">Category</TableHead>
                <TableHead className="font-semibold text-slate-600">Status</TableHead>
                <TableHead className="font-semibold text-slate-600">Metrics</TableHead>
                <TableHead className="text-right font-semibold text-slate-600">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.blogs.map((blog) => (
                <TableRow key={blog.id} className="border-slate-100 hover:bg-slate-50/80 transition-colors">
                  <TableCell className="py-4">
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-900 line-clamp-1">{blog.title}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {blog.date}</span>
                        <span>ID: {blog.id}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                      {blog.category}
                    </span>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(blog.status)}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm text-slate-600">
                      <div className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5 text-slate-400" /> {blog.views.toLocaleString()}</div>
                      <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-400" /> {blog.readTime}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/cms/blogs/edit/${blog.id}`}>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-full text-slate-600 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200">
                          <PenSquare className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDelete(blog.id)}
                        className="h-8 w-8 p-0 rounded-full text-slate-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {data.blogs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                    No blogs found. Start writing!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

    </div>
  );
}
