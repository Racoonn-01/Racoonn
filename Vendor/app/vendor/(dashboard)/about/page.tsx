"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info, Edit } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-heading font-bold text-secondary">About the Hotel</h2>
          <p className="text-slate-500 mt-1">Edit your property's main description and details.</p>
        </div>
        <Link href="/vendor/about/edit">
          <Button variant="outline" className="gap-2 rounded-xl">
            <Edit className="w-4 h-4" />
            Edit Details
          </Button>
        </Link>
      </div>

      <Card className="border-0 shadow-sm ring-1 ring-slate-100 rounded-xl bg-white">
        <CardContent className="p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <Info className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Property Description</h3>
          <p className="text-slate-500 max-w-md mb-6">Write a compelling description that highlights what makes your property unique and special.</p>
          <Link href="/vendor/about/edit">
            <Button className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 font-semibold">Write Description</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
