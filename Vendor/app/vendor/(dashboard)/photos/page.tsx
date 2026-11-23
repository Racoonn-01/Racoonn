"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

export default function PhotosPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-heading font-bold text-secondary">Photos</h2>
          <p className="text-slate-500 mt-1">Manage your property's image gallery.</p>
        </div>
        
        <Link href="/vendor/photos/upload">
          <Button className="bg-primary hover:bg-primary/90 text-white gap-2">
            <Plus className="w-4 h-4" />
            Upload Photos
          </Button>
        </Link>
      </div>

      <Card className="border-0 shadow-sm ring-1 ring-slate-100 rounded-xl bg-white">
        <CardContent className="p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <ImageIcon className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">No photos uploaded yet</h3>
          <p className="text-slate-500 max-w-sm mb-6">High-quality photos are the most important factor for travelers choosing a place to stay.</p>
          <Link href="/vendor/photos/upload">
            <Button variant="outline" className="border-slate-200">Select Files</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
