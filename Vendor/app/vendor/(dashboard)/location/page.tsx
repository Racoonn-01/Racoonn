"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Map } from "lucide-react";
import Link from "next/link";

export default function LocationPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-heading font-bold text-secondary">Location</h2>
          <p className="text-slate-500 mt-1">Manage your property's address and map coordinates.</p>
        </div>
        <Link href="/vendor/location/edit">
          <Button variant="outline" className="gap-2 rounded-xl">
            <MapPin className="w-4 h-4" />
            Update Address
          </Button>
        </Link>
      </div>

      <Card className="border-0 shadow-sm ring-1 ring-slate-100 rounded-xl bg-white">
        <CardContent className="p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <Map className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Pin Your Location</h3>
          <p className="text-slate-500 max-w-sm mb-6">Ensure your exact map coordinates are correct so guests can find you easily.</p>
          <Link href="/vendor/location/edit">
            <Button className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 font-semibold">Set Map Location</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
