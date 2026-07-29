"use server";

import { revalidatePath } from "next/cache";
import { appwriteServer } from "@/lib/appwrite/server";
import { ID, Query } from "node-appwrite";

export interface BlogItem {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  status: string;
  date: string;
  views: number;
  readTime: string;
  imageId?: string;
  images?: string[];
  content?: string;
  $id?: string;
}

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "";
const COLLECTION_ID = "blogs";

export async function getBlogsData() {
  try {
    const response = await appwriteServer.databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [
        Query.orderDesc("$createdAt")
      ]
    );

    const blogs = response.documents.map((doc: any) => ({
      id: doc.$id,
      title: doc.title,
      excerpt: doc.excerpt,
      category: doc.category,
      content: doc.content,
      imageId: doc.imageId,
      status: doc.status,
      date: doc.date,
      readTime: doc.readTime || "5 min read",
      views: doc.views || 0,
    })) as BlogItem[];

    const totalBlogs = blogs.length;
    const publishedCount = blogs.filter(b => b.status === "Published").length;
    const totalViews = blogs.reduce((acc, curr) => acc + curr.views, 0);

    return {
      totalBlogs,
      publishedCount,
      totalViews,
      blogs
    };
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return {
      totalBlogs: 0,
      publishedCount: 0,
      totalViews: 0,
      blogs: []
    };
  }
}

export async function createBlog(data: {
  title: string;
  excerpt: string;
  category: string;
  content?: string;
  image?: string;
  images?: string[];
  status: "Published" | "Draft" | "Archived";
}) {
  try {
    const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    await appwriteServer.databases.createDocument(
      DATABASE_ID,
      COLLECTION_ID,
      ID.unique(),
      {
        title: data.title,
        slug: slug,
        excerpt: data.excerpt,
        category: data.category,
        content: data.content || "",
        imageId: data.image || "",
        images: data.images || [],
        status: data.status,
        date: dateStr,
        readTime: "5 min read",
        views: 0
      }
    );

    revalidatePath("/cms/blogs");
    return { success: true, message: "Blog created successfully" };
  } catch (error) {
    console.error("Error creating blog:", error);
    throw new Error("Failed to create blog");
  }
}

export async function deleteBlog(id: string) {
  try {
    await appwriteServer.databases.deleteDocument(
      DATABASE_ID,
      COLLECTION_ID,
      id
    );
    revalidatePath("/cms/blogs");
    return { success: true, message: "Blog deleted successfully" };
  } catch (error) {
    console.error("Error deleting blog:", error);
    throw new Error("Failed to delete blog");
  }
}

export async function getBlogById(id: string) {
  try {
    const doc = await appwriteServer.databases.getDocument(
      DATABASE_ID,
      COLLECTION_ID,
      id
    );
    return {
      id: doc.$id,
      title: doc.title,
      slug: doc.slug,
      excerpt: doc.excerpt,
      category: doc.category,
      content: doc.content,
      imageId: doc.imageId,
      images: doc.images || [],
      status: doc.status,
      date: doc.date,
      readTime: doc.readTime || "5 min read",
      views: doc.views || 0,
    };
  } catch (error) {
    console.error("Error fetching blog:", error);
    return null;
  }
}

export async function updateBlog(id: string, data: {
  title: string;
  excerpt: string;
  category: string;
  content?: string;
  image?: string;
  images?: string[];
  status: "Published" | "Draft" | "Archived";
}) {
  try {
    const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    await appwriteServer.databases.updateDocument(
      DATABASE_ID,
      COLLECTION_ID,
      id,
      {
        title: data.title,
        slug: slug,
        excerpt: data.excerpt,
        category: data.category,
        content: data.content || "",
        imageId: data.image || "",
        images: data.images || [],
        status: data.status,
      }
    );

    revalidatePath("/cms/blogs");
    revalidatePath(`/cms/blogs/edit/${id}`);
    return { success: true, message: "Blog updated successfully" };
  } catch (error) {
    console.error("Error updating blog:", error);
    throw new Error("Failed to update blog");
  }
}
