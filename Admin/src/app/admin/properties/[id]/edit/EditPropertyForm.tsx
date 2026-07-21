"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, ArrowLeft, Save } from "lucide-react"

interface Property {
  id: string;
  propertyName: string;
  propertyType: string;
  location: string;
  status: string;
}

export default function EditPropertyForm({ property }: { property: Property }) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [editForm, setEditForm] = useState({
    name: property.propertyName,
    location: property.location,
    type: property.propertyType || "",
    status: property.status || "Pending"
  });

  const handleUpdateProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      const locationParts = editForm.location.split(",");
      const city = locationParts[0]?.trim() || "";
      const state = locationParts[1]?.trim() || "";

      const res = await fetch(`/api/properties/${property.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyName: editForm.name,
          propertyType: editForm.type,
          city: city,
          state: state,
          location: editForm.location,
          status: editForm.status
        })
      });

      if (!res.ok) {
        throw new Error("Failed to update property");
      }

      // Redirect back to properties list and refresh router to get updated data
      router.push('/admin/properties');
      router.refresh();
      
    } catch (error) {
      console.error("Error updating property:", error);
      alert("Failed to update property. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/properties">
          <Button variant="outline" size="icon" className="rounded-full">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Edit Property</h2>
          <p className="text-muted-foreground">Update platform details and status for this property.</p>
        </div>
      </div>

      <form onSubmit={handleUpdateProperty}>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Property Details</CardTitle>
            <CardDescription>
              Make changes to {property.propertyName}&apos;s basic information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Property Name</Label>
              <Input 
                id="name" 
                value={editForm.name} 
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Property Type</Label>
              <Select 
                value={editForm.type} 
                onValueChange={(val) => setEditForm(prev => ({ ...prev, type: val || "" }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Hotel">Hotel</SelectItem>
                  <SelectItem value="Resort">Resort</SelectItem>
                  <SelectItem value="Villa">Villa</SelectItem>
                  <SelectItem value="Lodge">Lodge</SelectItem>
                  <SelectItem value="Hostel">Hostel</SelectItem>
                  <SelectItem value="Glamping">Glamping</SelectItem>
                  <SelectItem value="Apartment">Apartment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location (City, State)</Label>
              <Input 
                id="location" 
                value={editForm.location} 
                onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g. Haldwani, Uttarakhand"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={editForm.status} 
                onValueChange={(val) => setEditForm(prev => ({ ...prev, status: val || "Pending" }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Suspended">Suspended</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3 bg-muted/20 border-t p-6">
            <Link href="/admin/properties">
              <Button type="button" variant="outline" disabled={isUpdating}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Changes
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
