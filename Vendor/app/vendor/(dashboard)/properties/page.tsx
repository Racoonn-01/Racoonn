"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search, MapPin, Star, MoreHorizontal, Building2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { databases, appwriteConfig } from "@/lib/appwrite/client";
import { Query } from "appwrite";
import { useAuthStore } from "@/store/authStore";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
export default function PropertiesPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const response = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.propertyCollectionId,
          [Query.equal("vendorId", user.$id)]
        );
        
        const propertiesWithRooms = await Promise.all(
          response.documents.map(async (property) => {
            try {
              const roomsResponse = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.roomCollectionId,
                [Query.equal("propertyId", property.$id)]
              );
              
              const rooms = roomsResponse.documents;
              
              let propertyImage = null;
              if (property.photos && property.photos.length > 0) {
                propertyImage = property.photos[0];
              } else if (rooms.length > 0) {
                const roomWithPhoto = rooms.find(r => r.photos && r.photos.length > 0);
                if (roomWithPhoto) {
                  propertyImage = roomWithPhoto.photos[0];
                }
              }
              
              return {
                ...property,
                fetchedRooms: rooms,
                displayImage: propertyImage || null
              };
            } catch (e) {
              console.error(`Failed to fetch rooms for property ${property.$id}`, e);
              return {
                ...property,
                fetchedRooms: [],
                displayImage: property.photos?.[0] || null
              };
            }
          })
        );
        
        setProperties(propertiesWithRooms);
        
      } catch (err: any) {
        console.error("Failed to fetch properties:", err);
        setError(err.message || "Failed to load your properties.");
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, [user]);

  const handleDeleteProperty = async (propertyId: string) => {
    if (!confirm("Are you sure you want to delete this property? This will also delete all its rooms.")) return;
    
    try {
      // Find rooms for this property and delete them
      const roomsResponse = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.roomCollectionId,
        [Query.equal("propertyId", propertyId)]
      );
      
      for (const room of roomsResponse.documents) {
        await databases.deleteDocument(
          appwriteConfig.databaseId,
          appwriteConfig.roomCollectionId,
          room.$id
        );
      }
      
      // Delete the property
      await databases.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.propertyCollectionId,
        propertyId
      );
      
      // Update UI
      setProperties(prev => prev.filter(p => p.$id !== propertyId));
      toast.success("Property deleted successfully");
    } catch (error: any) {
      console.error("Failed to delete property:", error);
      toast.error(`Failed to delete property: ${error.message}`);
    }
  };

  const handleEditProperty = async (propertyId: string) => {
    router.push(`/vendor/properties/edit/${propertyId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#E86A70]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-heading font-bold text-secondary">Properties</h2>
          <p className="text-slate-500 mt-1">Manage your hotel listings and villas.</p>
        </div>
        <Link href="/vendor/properties/add">
          <Button className="bg-primary hover:bg-primary/90 text-white gap-2">
            <Plus className="w-4 h-4" />
            Add Property
          </Button>
        </Link>
      </div>

      <Card className="border-0 shadow-sm ring-1 ring-slate-100 rounded-xl bg-white overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search properties..." 
              className="pl-9 bg-white border-slate-200"
            />
          </div>
          <Button variant="outline" className="hidden sm:flex border-slate-200 text-slate-600">
            Filters
          </Button>
        </div>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {properties.length > 0 ? (
              properties.map((property, index) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  key={property.$id} 
                  className="p-4 sm:p-6 flex flex-col sm:flex-row gap-6 hover:bg-slate-50 transition-colors group"
                >
                  <div className="h-40 w-full sm:w-60 rounded-lg overflow-hidden shrink-0 bg-slate-100 relative flex items-center justify-center">
                    {property.displayImage ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={property.displayImage} alt={property.propertyName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="flex flex-col items-center text-slate-400">
                        <Building2 className="h-8 w-8 mb-2 opacity-50" />
                        <span className="text-xs font-medium uppercase tracking-wider">No Image</span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        property.status === 'Active' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                      }`}>
                        {property.status || "Pending"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-heading font-semibold text-secondary">{property.propertyName || property.title}</h3>
                        <div className="flex items-center text-slate-500 mt-1.5 text-sm">
                          <MapPin className="w-4 h-4 mr-1.5 text-slate-400" />
                          {property.location || `${property.city}, ${property.state}`}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="flex h-9 w-9 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none transition-colors">
                          <MoreHorizontal className="w-5 h-5" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => handleEditProperty(property.$id)} className="cursor-pointer font-medium">
                            Edit Property
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteProperty(property.$id)} className="cursor-pointer text-red-600 font-medium focus:text-red-700 focus:bg-red-50">
                            Delete Property
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <div className="flex items-center gap-6 mt-6 pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-slate-500" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Rooms</p>
                          <p className="text-sm font-semibold text-secondary">{property.fetchedRooms?.length || 0}</p>
                        </div>
                      </div>
                      <div className="w-px h-8 bg-slate-200"></div>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-amber-50 flex items-center justify-center">
                          <Star className="w-4 h-4 text-amber-500" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Rating</p>
                          <p className="text-sm font-semibold text-secondary">{property.rating > 0 ? property.rating : 'New'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <Building2 className="h-8 w-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-heading font-semibold text-secondary">No properties yet</h3>
                <p className="text-slate-500 mt-1 max-w-sm mx-auto">Get started by adding your first property to manage bookings, availability, and more.</p>
                <Link href="/vendor/properties/add" className="mt-6">
                  <Button className="bg-primary hover:bg-primary/90 text-white gap-2">
                    <Plus className="w-4 h-4" />
                    Add Property
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
