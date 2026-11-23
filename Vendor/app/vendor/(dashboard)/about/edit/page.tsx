"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Building2, Quote, AlignLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function AboutEditPage() {
  const [propertyName, setPropertyName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");

  const isDirty = propertyName !== "" || tagline !== "" || description !== "";

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-24 relative">
      <div className="flex items-center gap-4">
        <Link href="/vendor/about">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-heading font-bold text-secondary">Edit Details</h2>
          <p className="text-slate-500 mt-1">Update your property's core identity and public description.</p>
        </div>
      </div>

      <Card className="border-0 shadow-sm ring-1 ring-slate-100 rounded-2xl bg-white overflow-hidden mt-8">
        <CardContent className="p-8 sm:p-10 space-y-10">
          
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-primary" />
              </div>
              <Label htmlFor="property-name" className="text-base font-bold text-secondary">Property Name</Label>
            </div>
            <Input 
              id="property-name" 
              value={propertyName}
              onChange={(e) => setPropertyName(e.target.value)}
              placeholder="e.g. The Grand Resort & Spa" 
              className="h-14 rounded-xl bg-slate-50/50 border-slate-200 focus-visible:ring-primary/20 text-lg" 
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Quote className="w-4 h-4 text-primary" />
              </div>
              <Label htmlFor="tagline" className="text-base font-bold text-secondary">Tagline / Short Summary</Label>
            </div>
            <Input 
              id="tagline" 
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. Experience luxury oceanfront living at its finest." 
              className="h-14 rounded-xl bg-slate-50/50 border-slate-200 focus-visible:ring-primary/20 text-lg" 
            />
            <p className="text-sm text-slate-500">This appears in search results and directly under your property name.</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <AlignLeft className="w-4 h-4 text-primary" />
              </div>
              <Label htmlFor="description" className="text-base font-bold text-secondary">Full Description</Label>
            </div>
            <textarea 
              id="description" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex min-h-75 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 resize-y leading-relaxed"
              placeholder="Write a comprehensive description covering the vibe, history, and unique selling points of your property..."
            ></textarea>
            <p className="text-sm text-slate-500 flex justify-between">
              <span>Use this space to tell the story of your property and what guests can expect.</span>
              <span className={description.length > 2000 ? "text-red-500 font-bold" : ""}>{description.length} / 2000 chars</span>
            </p>
          </div>

        </CardContent>
      </Card>

      {/* Floating Action Bar */}
      {isDirty && (
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-8 left-1/2 lg:ml-32 -translate-x-1/2 z-50 flex items-center justify-between gap-6 bg-white border border-slate-200 p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] w-[90%] max-w-2xl"
        >
          <div>
            <p className="font-bold text-secondary">
              Unsaved Changes
            </p>
            <p className="text-xs text-slate-500 hidden sm:block">You have modified your property details.</p>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <Link href="/vendor/about">
              <Button variant="outline" className="rounded-xl h-11 hidden sm:flex">Discard</Button>
            </Link>
            <Link href="/vendor/about">
              <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl h-11 px-6 sm:px-8 font-bold">
                Save Details
              </Button>
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
}
