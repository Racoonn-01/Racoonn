"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Users, BedDouble, Edit, Trash2, Loader2, Maximize } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { databases, storage, appwriteConfig } from "@/lib/appwrite/client";
import { Query } from "appwrite";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
export default function RoomsPage() {
  const { user } = useAuthStore();
  const [rooms, setRooms] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roomToDelete, setRoomToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const [roomsRes, propsRes] = await Promise.all([
          databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.roomCollectionId,
            [Query.equal("vendorId", user.$id)]
          ),
          databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.propertyCollectionId,
            [Query.equal("vendorId", user.$id)]
          )
        ]);
        setRooms(roomsRes.documents);
        setProperties(propsRes.documents);
      } catch (err: any) {
        toast.error("Failed to fetch data: " + err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const confirmDelete = (roomId: string) => {
    setRoomToDelete(roomId);
  };

  const executeDelete = async () => {
    if (!roomToDelete) return;
    setIsDeleting(true);
    try {
      await databases.deleteDocument(appwriteConfig.databaseId, appwriteConfig.roomCollectionId, roomToDelete);
      setRooms(prev => prev.filter(r => r.$id !== roomToDelete));
      toast.success("Room deleted successfully!");
    } catch (err: any) {
      toast.error("Failed to delete room: " + err.message);
    } finally {
      setIsDeleting(false);
      setRoomToDelete(null);
    }
  };

  const getImgSrc = (photo: string) => {
    if (!photo) return "";
    return photo.startsWith("http") || photo.startsWith("blob:") 
      ? photo 
      : storage.getFileView(appwriteConfig.roomImagesBucketId, photo).toString();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-heading font-bold text-secondary">Rooms</h2>
          <p className="text-slate-500 mt-1">Manage your room types, pricing, and availability.</p>
        </div>
        
        <Link href="/vendor/rooms/add">
          <Button className="bg-primary hover:bg-primary/90 text-white gap-2">
            <Plus className="w-4 h-4" />
            Add Room
          </Button>
        </Link>
      </div>

      <Card className="border-0 shadow-sm ring-1 ring-slate-100 rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : rooms.length > 0 ? (
              rooms.map((room, index) => {
                const propMatch = properties.find(p => p.$id === room.propertyId);
                const propName = propMatch ? (propMatch.propertyName || propMatch.title) : "Unassigned";

                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    key={room.$id || index} 
                    className="p-4 sm:p-6 flex flex-col sm:flex-row gap-6 hover:bg-slate-50 transition-colors group"
                  >
                    <div className="w-full sm:w-64 aspect-4/3 relative rounded-2xl overflow-hidden shrink-0 bg-slate-100">
                      {room.photos && room.photos.length > 0 ? (
                        <Image 
                          src={getImgSrc(room.photos[0])} 
                          alt={room.name} 
                          fill 
                          className="object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                          <BedDouble className="w-10 h-10 mb-2 opacity-50" />
                          <span className="text-xs font-medium">No Image</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-xl font-bold text-secondary truncate">{room.name}</h3>
                          </div>
                          <span className="text-sm font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{propName}</span>
                        </div>
                        
                        <div className="flex flex-col sm:items-end sm:text-right bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl sm:rounded-none">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Price / Night</span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-secondary">₹{room.price}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 mt-6 p-4 bg-slate-50 rounded-xl">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Users className="w-4 h-4 text-slate-400" />
                          <span className="font-medium">Up to {room.occupancy || 2} guests</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Maximize className="w-4 h-4 text-slate-400" />
                          <span className="font-medium">{room.size || 0} sqft</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex sm:flex-col justify-end sm:justify-start gap-2 pt-2 border-t sm:border-t-0 sm:border-l border-slate-100 sm:pl-6">
                      <Link href={`/vendor/rooms/edit/${room.$id}`} className="flex-1 sm:flex-none">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full border-slate-200 text-slate-600 hover:text-primary"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 sm:flex-none border-red-100 text-red-500 hover:bg-red-50"
                        onClick={() => confirmDelete(room.$id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="col-span-1 md:col-span-2 flex flex-col items-center justify-center py-20 text-center px-4">
                <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <BedDouble className="h-8 w-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-heading font-semibold text-secondary">No rooms yet</h3>
                <p className="text-slate-500 mt-1 max-w-sm mx-auto">Get started by adding your first room to a property.</p>
                <Link href="/vendor/rooms/add">
                  <Button className="mt-6 bg-primary hover:bg-primary/90 text-white gap-2">
                    <Plus className="w-4 h-4" />
                    Add Room
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!roomToDelete} onOpenChange={(open) => !open && setRoomToDelete(null)}>
        <DialogContent className="p-0 gap-0 border-0 rounded-3xl">
          <DialogHeader className="pt-8 px-8 pb-6">
            <DialogTitle className="text-[1.35rem] font-medium text-slate-900 tracking-tight">Delete Room</DialogTitle>
            <DialogDescription className="text-[0.95rem] text-slate-500 mt-2 leading-relaxed">
              Are you sure you want to delete this room? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="bg-[#fff9f6] px-8 py-5 sm:justify-end gap-3 rounded-b-3xl border-t border-orange-100/50 m-0! p-6!">
            <Button variant="outline" onClick={() => setRoomToDelete(null)} disabled={isDeleting} className="rounded-full bg-white border-slate-200 text-slate-900 hover:bg-slate-50 font-medium px-6 h-11">
              Cancel
            </Button>
            <Button variant="destructive" onClick={executeDelete} disabled={isDeleting} className="rounded-full bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 shadow-none font-medium px-6 h-11 border-0">
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
