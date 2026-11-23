"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Star } from "lucide-react";
import Link from "next/link";

export default function AmenitiesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-heading font-bold text-secondary">Amenities</h2>
          <p className="text-slate-500 mt-1">Configure the amenities available at your property.</p>
        </div>
        <Link href="/vendor/amenities/manage">
          <Button className="bg-primary hover:bg-primary/90 text-white gap-2">
            <Plus className="w-4 h-4" />
            Add Amenity
          </Button>
        </Link>
      </div>

      <Card className="border-0 shadow-sm ring-1 ring-slate-100 rounded-xl bg-white">
        <CardContent className="p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <Star className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Configure Your Amenities</h3>
          <p className="text-slate-500 max-w-sm mb-6">List everything from WiFi and pools to spa services to attract more guests.</p>
          <Link href="/vendor/amenities/manage">
            <Button variant="outline" className="border-slate-200">Manage Amenities</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
