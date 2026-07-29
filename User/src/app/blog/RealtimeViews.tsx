"use client";

import { useEffect, useState } from "react";
import client from "@/lib/appwrite/config";
import { Eye } from "lucide-react";

interface RealtimeViewsProps {
  documentId: string;
  initialViews: number;
  iconSize?: number;
}

export default function RealtimeViews({ documentId, initialViews, iconSize = 14 }: RealtimeViewsProps) {
  const [views, setViews] = useState(initialViews);
  const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6a3cec630035d63ea963";

  useEffect(() => {
    const unsubscribe = client.subscribe(
      `databases.${DATABASE_ID}.collections.blogs.documents.${documentId}`,
      (response) => {
        if (response.events.some((e: string) => e.includes('.update'))) {
          const updatedDoc = response.payload as any;
          if (updatedDoc.views !== undefined) {
            setViews(updatedDoc.views);
          }
        }
      }
    );

    return () => unsubscribe();
  }, [documentId, DATABASE_ID]);

  return (
    <span className="flex items-center gap-1.5">
      <Eye size={iconSize} /> {views}
    </span>
  );
}
