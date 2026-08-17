"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { CalendarDays, IndianRupee, BedDouble, Percent, CheckCircle2, RefreshCw, ChevronLeft, ChevronRight, Loader2, Sparkles, Trash2, Edit2, RotateCcw } from "lucide-react";
import { databases, appwriteConfig } from "@/lib/appwrite/client";
import { Query } from "appwrite";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

import { SpecialOffersModule } from "@/components/offers/SpecialOffersModule";

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_INDEX_MAP: Record<number, string> = {
  0: 'Sun', 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat'
};

interface DayOverride {
  price?: number;
  available?: number;
}

interface SpecialOffer {
  id: string;
  title: string;
  discount: number;
  startDate: string;
  endDate: string;
  roomId: string;
  roomName: string;
}

const DEFAULT_PROPERTIES = [
  {
    $id: "prop-default-1",
    propertyName: "Grand Ocean Resort & Spa",
    city: "Goa",
    state: "Goa"
  }
];

const DEFAULT_ROOMS = [
  {
    $id: "room-default-1",
    propertyId: "prop-default-1",
    name: "Deluxe Ocean View Suite",
    price: 4500,
    occupancy: 2,
    availableRooms: 5
  },
  {
    $id: "room-default-2",
    propertyId: "prop-default-1",
    name: "Executive Luxury Villa",
    price: 7800,
    occupancy: 4,
    availableRooms: 3
  }
];

export default function AvailabilityPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("calendar");
  const [currentMonth, setCurrentMonth] = useState(new Date()); 
  const [rooms, setRooms] = useState<any[]>(DEFAULT_ROOMS);
  const [properties, setProperties] = useState<any[]>(DEFAULT_PROPERTIES);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("prop-default-1");
  const [selectedRoomId, setSelectedRoomId] = useState<string>("room-default-1");
  const [isLoading, setIsLoading] = useState(true);

  // Bulk update state
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [newPrice, setNewPrice] = useState<string>("");
  const [availableRooms, setAvailableRooms] = useState<string>("");
  const [selectedDays, setSelectedDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
  const [isApplyingBulk, setIsApplyingBulk] = useState(false);

  // Overrides state: { [roomId]: { [dateKey YYYY-MM-DD]: DayOverride } }
  const [overrides, setOverrides] = useState<Record<string, Record<string, DayOverride>> >({});

  // Single Day Edit Modal State
  const [editingDate, setEditingDate] = useState<{ day: number; dateKey: string; price: number; available: number; isOverridden: boolean } | null>(null);
  const [editPriceInput, setEditPriceInput] = useState<string>("");
  const [editAvailInput, setEditAvailInput] = useState<string>("");

  // Special Offers state
  const [offers, setOffers] = useState<SpecialOffer[]>([]);
  const [isOfferDialogOpen, setIsOfferDialogOpen] = useState(false);
  const [offerTitle, setOfferTitle] = useState("");
  const [offerDiscount, setOfferDiscount] = useState("");
  const [offerStartDate, setOfferStartDate] = useState("");
  const [offerEndDate, setOfferEndDate] = useState("");
  const [offerRoomId, setOfferRoomId] = useState("");

  // Load rooms, properties, and overrides from API & localStorage
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

        if (propsRes.documents.length > 0) {
          setProperties(propsRes.documents);
          const defaultPropId = propsRes.documents[0].$id;
          setSelectedPropertyId(defaultPropId);

          if (roomsRes.documents.length > 0) {
            setRooms(roomsRes.documents);
            const propRooms = roomsRes.documents.filter(r => r.propertyId === defaultPropId);
            setSelectedRoomId(propRooms[0]?.$id || roomsRes.documents[0].$id);
          }
        }
      } catch (err: any) {
        toast.error("Failed to fetch data: " + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Fetch overrides from API & localStorage
    async function loadSavedOverrides() {
      try {
        const res = await fetch("/api/vendor/availability");
        const json = await res.json();
        if (json.success && json.overrides) {
          setOverrides(json.overrides);
        } else if (user?.$id) {
          const savedOverrides = localStorage.getItem(`racoonn_availability_overrides_${user.$id}`);
          if (savedOverrides) {
            setOverrides(JSON.parse(savedOverrides));
          }
        }

        if (user?.$id) {
          const savedOffers = localStorage.getItem(`racoonn_special_offers_${user.$id}`);
          if (savedOffers) {
            setOffers(JSON.parse(savedOffers));
          }
        }
      } catch (e) {
        console.error("Failed to load availability overrides", e);
      }
    }
    loadSavedOverrides();
  }, [user]);

  // Persist overrides when changed (localStorage + API + BroadcastChannel)
  const saveOverridesToStorage = async (updated: Record<string, Record<string, DayOverride>>) => {
    setOverrides(updated);
    if (user?.$id) {
      localStorage.setItem(`racoonn_availability_overrides_${user.$id}`, JSON.stringify(updated));
    }
    try {
      await fetch("/api/vendor/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ overrides: updated })
      });

      // Channel Manager Sync
      if (selectedRoom?.$id && user?.$id) {
        const roomUpdates = Object.entries(updated)
          .filter(([key]) => key.startsWith(selectedRoom.$id))
          .map(([key, val]: [string, any]) => ({
             date: key.split('_')[1],
             price: val.price || selectedRoom.price,
             availableCount: val.available,
             isBlocked: val.blocked || false
          }));

        if (roomUpdates.length > 0) {
           fetch("/api/channel-manager/sync", {
             method: "POST",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify({
               vendorId: user.$id,
               roomId: selectedRoom.$id,
               updates: roomUpdates
             })
           }).catch(console.error); // Fire and forget
        }
      }

      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        const bc = new BroadcastChannel("racoonn_availability_channel");
        bc.postMessage({ type: "AVAILABILITY_UPDATED", overrides: updated });
        bc.close();
      }
      window.dispatchEvent(new CustomEvent("racoonn_availability_updated", { detail: updated }));
    } catch (err) {
      console.error("Error saving availability override to API:", err);
    }
  };

  // Persist offers when changed
  const saveOffersToStorage = (updated: SpecialOffer[]) => {
    setOffers(updated);
    if (user?.$id) {
      localStorage.setItem(`racoonn_special_offers_${user.$id}`, JSON.stringify(updated));
    }
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const filteredRooms = selectedPropertyId === "all"
    ? rooms
    : rooms.filter(r => r.propertyId === selectedPropertyId);

  const selectedRoom = rooms.find(r => r.$id === selectedRoomId);
  const roomPrice = selectedRoom ? (selectedRoom.discountPrice && selectedRoom.discountPrice > 0 ? selectedRoom.discountPrice : selectedRoom.price) : 0;
  const baseAvailable = selectedRoom ? (selectedRoom.availableRooms || selectedRoom.occupancy || 2) : 0;
  
  // Calculate calendar days
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay(); // 0 is Sunday
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => {
    const date = new Date(year, month, i + 1);
    date.setHours(0, 0, 0, 0);
    const dayOfWeek = date.getDay();
    const yearStr = date.getFullYear();
    const monthStr = String(date.getMonth() + 1).padStart(2, '0');
    const dayStr = String(date.getDate()).padStart(2, '0');
    const dateKey = `${yearStr}-${monthStr}-${dayStr}`;
    const isPast = date < today;

    const override = overrides[selectedRoomId]?.[dateKey];
    
    // Check if special offer active for date
    const hasOffer = offers.some(o => 
      (o.roomId === "all" || o.roomId === selectedRoomId) &&
      dateKey >= o.startDate && dateKey <= o.endDate
    );

    return {
      day: i + 1,
      dateKey,
      available: override?.available !== undefined ? override.available : baseAvailable,
      price: override?.price !== undefined ? override.price : roomPrice,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      hasOffer,
      isToday: date.toDateString() === new Date().toDateString(),
      isOverridden: !!override,
      isPast
    };
  });

  // Toggle days of week pills
  const toggleDay = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day) 
        : [...prev, day]
    );
  };

  // Bulk Update Form Handler
  const handleApplyBulkUpdate = async () => {
    if (!selectedRoomId) {
      toast.error("Please select a room type.");
      return;
    }
    if (!startDate || !endDate) {
      toast.error("Please select both start date and end date.");
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      toast.error("Start date cannot be after end date.");
      return;
    }
    if (newPrice === "" && availableRooms === "") {
      toast.error("Please enter a new price or available rooms number.");
      return;
    }
    if (selectedDays.length === 0) {
      toast.error("Please select at least one day of the week.");
      return;
    }

    setIsApplyingBulk(true);

    try {
      const parsedPrice = newPrice !== "" ? parseFloat(newPrice) : undefined;
      const parsedAvail = availableRooms !== "" ? parseInt(availableRooms) : undefined;

      const updated = { ...overrides };
      if (!updated[selectedRoomId]) {
        updated[selectedRoomId] = {};
      }

      let count = 0;
      const curr = new Date(startDate + "T00:00:00");
      const end = new Date(endDate + "T00:00:00");

      while (curr <= end) {
        const dayName = DAY_INDEX_MAP[curr.getDay()];
        if (selectedDays.includes(dayName)) {
          const y = curr.getFullYear();
          const m = String(curr.getMonth() + 1).padStart(2, '0');
          const d = String(curr.getDate()).padStart(2, '0');
          const key = `${y}-${m}-${d}`;

          const prevOverride = updated[selectedRoomId][key] || {};
          updated[selectedRoomId][key] = {
            price: parsedPrice !== undefined ? parsedPrice : prevOverride.price,
            available: parsedAvail !== undefined ? parsedAvail : prevOverride.available,
          };
          count++;
        }
        curr.setDate(curr.getDate() + 1);
      }

      // Also update base room price in Appwrite database if new price is provided
      if (parsedPrice !== undefined) {
        try {
          await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.roomCollectionId,
            selectedRoomId,
            { price: parsedPrice }
          );
          // Update local state room object
          setRooms(prev => prev.map(r => r.$id === selectedRoomId ? { ...r, price: parsedPrice } : r));
        } catch (dbErr) {
          console.warn("Could not update base room price document in Appwrite:", dbErr);
        }
      }

      saveOverridesToStorage(updated);

      toast.success(`Successfully applied updates for ${count} date(s)!`, {
        description: `Updated rates & availability for ${selectedRoom?.name || 'Selected Room'}.`
      });

      // Automatically focus Calendar view so vendor can review
      setActiveTab("calendar");
    } catch (err: any) {
      toast.error("Failed to apply bulk update: " + err.message);
    } finally {
      setIsApplyingBulk(false);
    }
  };

  // Open single day edit modal
  const handleOpenDayEdit = (dayData: { day: number; dateKey: string; price: number; available: number; isOverridden: boolean }) => {
    setEditingDate(dayData);
    setEditPriceInput(dayData.price.toString());
    setEditAvailInput(dayData.available.toString());
  };

  // Save single day edit
  const handleSaveDayEdit = () => {
    if (!editingDate || !selectedRoomId) return;

    const parsedPrice = parseFloat(editPriceInput) || 0;
    const parsedAvail = parseInt(editAvailInput) || 0;

    const updated = { ...overrides };
    if (!updated[selectedRoomId]) updated[selectedRoomId] = {};

    updated[selectedRoomId][editingDate.dateKey] = {
      price: parsedPrice,
      available: parsedAvail
    };

    saveOverridesToStorage(updated);
    toast.success(`Updated ${editingDate.dateKey} rate to ₹${parsedPrice} and ${parsedAvail} rooms.`);
    setEditingDate(null);
  };

  // Clear single day override
  const handleClearDayOverride = () => {
    if (!editingDate || !selectedRoomId) return;

    const updated = { ...overrides };
    if (updated[selectedRoomId]) {
      delete updated[selectedRoomId][editingDate.dateKey];
    }

    saveOverridesToStorage(updated);
    toast.info(`Reset override for ${editingDate.dateKey} to base values.`);
    setEditingDate(null);
  };

  // Handle Create Special Offer
  const handleCreateOffer = () => {
    if (!offerTitle || !offerDiscount || !offerStartDate || !offerEndDate) {
      toast.error("Please fill in all offer details.");
      return;
    }

    const roomObj = rooms.find(r => r.$id === offerRoomId);
    const newOffer: SpecialOffer = {
      id: Date.now().toString(),
      title: offerTitle,
      discount: parseFloat(offerDiscount) || 10,
      startDate: offerStartDate,
      endDate: offerEndDate,
      roomId: offerRoomId || "all",
      roomName: roomObj ? roomObj.name : "All Rooms"
    };

    saveOffersToStorage([...offers, newOffer]);
    toast.success("Special offer created successfully!");
    setIsOfferDialogOpen(false);
    
    // Reset form
    setOfferTitle("");
    setOfferDiscount("");
    setOfferStartDate("");
    setOfferEndDate("");
    setOfferRoomId("");
  };

  // Handle Delete Special Offer
  const handleDeleteOffer = (offerId: string) => {
    saveOffersToStorage(offers.filter(o => o.id !== offerId));
    toast.info("Special offer removed.");
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h2 className="text-3xl font-heading font-bold text-secondary">Availability & Pricing</h2>
        <p className="text-slate-500 mt-1">Manage your calendar, update rates, and set special offers.</p>
      </motion.div>

      {rooms.length === 0 ? (
        <Card className="border-0 shadow-sm ring-1 ring-slate-100 rounded-2xl overflow-hidden p-10 text-center">
          <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BedDouble className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-heading font-semibold text-secondary">No rooms available</h3>
          <p className="text-slate-500 mt-1 max-w-sm mx-auto mb-6">You need to add at least one room to view the availability calendar.</p>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-white border border-slate-200 p-1 rounded-2xl w-full flex-wrap sm:flex-nowrap sm:w-auto sm:inline-flex gap-1 shadow-sm mb-6 h-auto">
            <TabsTrigger 
              value="calendar" 
              className="data-[state=active]:bg-[#E86A70] data-[state=active]:text-white data-[state=active]:shadow-md text-slate-500 rounded-xl py-3 px-6 flex items-center gap-2.5 font-bold transition-all hover:text-slate-800 data-[state=active]:hover:text-white cursor-pointer"
            >
              <CalendarDays className="w-5 h-5" /> Calendar View
            </TabsTrigger>
            <TabsTrigger 
              value="bulk" 
              className="data-[state=active]:bg-[#E86A70] data-[state=active]:text-white data-[state=active]:shadow-md text-slate-500 rounded-xl py-3 px-6 flex items-center gap-2.5 font-bold transition-all hover:text-slate-800 data-[state=active]:hover:text-white cursor-pointer"
            >
              <RefreshCw className="w-5 h-5" /> Bulk Update
            </TabsTrigger>
            <TabsTrigger 
              value="offers" 
              className="data-[state=active]:bg-[#E86A70] data-[state=active]:text-white data-[state=active]:shadow-md text-slate-500 rounded-xl py-3 px-6 flex items-center gap-2.5 font-bold transition-all hover:text-slate-800 data-[state=active]:hover:text-white cursor-pointer"
            >
              <Percent className="w-5 h-5" /> Special Offers
            </TabsTrigger>
          </TabsList>

          <div className="mt-2">
            {/* Tab 1: CALENDAR VIEW */}
            <TabsContent value="calendar" className="space-y-6 outline-none">
              <Card className="border-0 shadow-xl shadow-slate-200/40 ring-1 ring-slate-100 rounded-3xl overflow-hidden bg-white">
                <CardHeader className="bg-linear-to-b from-slate-50 to-white border-b border-slate-100 pb-5 pt-7 px-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                      <Select value={selectedPropertyId} onValueChange={(val) => {
                        const propId = val || properties[0]?.$id || "prop-default-1";
                        setSelectedPropertyId(propId);
                        const propRooms = rooms.filter(r => r.propertyId === propId);
                        if (propRooms.length > 0) {
                          setSelectedRoomId(propRooms[0].$id);
                        }
                      }}>
                        <SelectTrigger className="w-full sm:w-56 h-12 rounded-2xl bg-white border-slate-200 font-bold text-slate-700 shadow-sm hover:border-slate-300 transition-colors focus:ring-2 focus:ring-[#E86A70]/20 focus:border-[#E86A70]">
                          <SelectValue placeholder="Select Property">
                            {properties.find(p => p.$id === selectedPropertyId)?.propertyName || properties.find(p => p.$id === selectedPropertyId)?.name || properties.find(p => p.$id === selectedPropertyId)?.title || properties[0]?.propertyName || "Grand Ocean Resort & Spa"}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {properties.map(prop => (
                            <SelectItem key={prop.$id} value={prop.$id}>{prop.propertyName || prop.name || prop.title || "Property"}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={selectedRoomId} onValueChange={(val) => setSelectedRoomId(val || filteredRooms[0]?.$id || "")}>
                        <SelectTrigger className="w-full sm:w-56 h-12 rounded-2xl bg-white border-slate-200 font-bold text-slate-700 shadow-sm hover:border-slate-300 transition-colors focus:ring-2 focus:ring-[#E86A70]/20 focus:border-[#E86A70]">
                          <SelectValue placeholder="Select Room">
                            {rooms.find(r => r.$id === selectedRoomId)?.name || filteredRooms[0]?.name || "Deluxe Ocean View Suite"}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {filteredRooms.map(room => (
                            <SelectItem key={room.$id} value={room.$id}>{room.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-4 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                      <Button variant="ghost" size="icon" onClick={prevMonth} className="h-10 w-10 rounded-xl hover:bg-white hover:shadow-sm text-slate-600 transition-all">
                        <ChevronLeft className="w-5 h-5" />
                      </Button>
                      <div className="w-40 text-center font-heading font-black text-xl text-secondary">
                        {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                      </div>
                      <Button variant="ghost" size="icon" onClick={nextMonth} className="h-10 w-10 rounded-xl hover:bg-white hover:shadow-sm text-slate-600 transition-all">
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="grid grid-cols-7 border-b border-slate-100 bg-white">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="py-4 text-center text-xs font-black text-slate-400 uppercase tracking-widest">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 bg-slate-50/50">
                    {/* Empty cells for start of month */}
                    {Array.from({ length: startDay }).map((_, i) => (
                      <div key={`empty-${i}`} className="min-h-36 p-3 border-r border-b border-slate-100/60 bg-transparent"></div>
                    ))}
                    
                    {calendarDays.map(day => (
                      <div 
                        key={day.day} 
                        onClick={() => {
                          if (!day.isPast) handleOpenDayEdit(day);
                        }}
                        className={`min-h-36 border-r border-b border-slate-100/60 p-3 relative group transition-all duration-300 ${
                          day.isPast 
                            ? 'bg-slate-100/50 opacity-40 cursor-not-allowed pointer-events-none' 
                            : day.isWeekend ? 'bg-slate-50/80 cursor-pointer hover:bg-slate-100/50 hover:shadow-inner' : 'bg-white cursor-pointer hover:bg-slate-100/50 hover:shadow-inner'
                        } ${day.isOverridden && !day.isPast ? 'ring-2 ring-inset ring-[#E86A70]/30 bg-rose-50/20' : ''}`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <span className={`text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                            day.isToday ? 'bg-[#E86A70] text-white shadow-md shadow-[#E86A70]/30' : day.isPast ? 'text-slate-400' : 'text-slate-600 group-hover:text-secondary group-hover:bg-slate-200'
                          }`}>
                            {day.day}
                          </span>
                          <div className="flex items-center gap-1">
                            {day.isPast && (
                              <span className="text-[10px] font-bold text-slate-400">Past</span>
                            )}
                            {day.isOverridden && !day.isPast && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#E86A70] text-white shadow-xs" title="Custom Rate Applied">
                                Custom
                              </span>
                            )}
                            {day.hasOffer && !day.isPast && (
                              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm" title="Special Offer Active"></span>
                            )}
                          </div>
                        </div>
                        
                        <div className="space-y-2 mt-auto">
                          <div className={`text-[11px] px-2.5 py-1.5 rounded-lg flex justify-between items-center font-bold tracking-wide ${day.available > 0 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/50' : 'bg-red-50 text-red-600 border border-red-100/50'}`}>
                            <span className="uppercase opacity-80">Avail</span>
                            <span className="text-sm">{day.available}</span>
                          </div>
                          <div className={`text-[11px] px-2.5 py-1.5 rounded-lg flex justify-between items-center font-bold tracking-wide ${day.isOverridden ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-indigo-50 text-indigo-600 border border-indigo-100/50'}`}>
                            <span className="uppercase opacity-80">Rate</span>
                            <span className="text-sm">₹{day.price}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 2: BULK UPDATE */}
            <TabsContent value="bulk" className="space-y-6 outline-none">
              <Card className="border-0 shadow-xl shadow-slate-200/40 ring-1 ring-slate-100 rounded-3xl overflow-hidden bg-white">
                <CardHeader className="bg-linear-to-b from-slate-50 to-white border-b border-slate-100 pb-5 pt-7 px-8">
                  <CardTitle className="font-heading text-2xl font-black text-secondary">Bulk Update Rates & Availability</CardTitle>
                  <CardDescription className="text-slate-500 font-medium mt-1">Quickly update multiple dates for a specific room type.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8 p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Property</Label>
                      <Select value={selectedPropertyId} onValueChange={(val) => {
                        const propId = val ?? "all";
                        setSelectedPropertyId(propId);
                        setSelectedRoomId("");
                      }}>
                        <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 shadow-sm font-semibold hover:border-slate-300 hover:bg-slate-50 transition-colors focus:ring-2 focus:ring-[#E86A70]/20 focus:border-[#E86A70]">
                          <SelectValue placeholder="Select Property">
                            {selectedPropertyId === "all" ? "Select Property" : (properties.find(p => p.$id === selectedPropertyId)?.propertyName || properties.find(p => p.$id === selectedPropertyId)?.name || properties.find(p => p.$id === selectedPropertyId)?.title || "Select Property")}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl shadow-lg border-slate-100">
                          <SelectItem value="all" className="font-medium cursor-pointer rounded-xl mx-1 my-0.5">Select Property</SelectItem>
                          {properties.map(prop => (
                            <SelectItem key={prop.$id} value={prop.$id} className="font-medium cursor-pointer rounded-xl mx-1 my-0.5">{prop.propertyName || prop.name || prop.title || "Property"}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Room Type</Label>
                      <Select value={selectedRoomId} onValueChange={(val) => setSelectedRoomId(val === "none" ? "" : (val || ""))}>
                        <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 shadow-sm font-semibold hover:border-slate-300 hover:bg-slate-50 transition-colors focus:ring-2 focus:ring-[#E86A70]/20 focus:border-[#E86A70]">
                          <SelectValue placeholder="Select Room">
                            {rooms.find(r => r.$id === selectedRoomId)?.name || "Select Room"}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl shadow-lg border-slate-100">
                          <SelectItem value="none" className="font-medium cursor-pointer rounded-xl mx-1 my-0.5">Select Room</SelectItem>
                          {filteredRooms.map(room => (
                            <SelectItem key={room.$id} value={room.$id} className="font-medium cursor-pointer rounded-xl mx-1 my-0.5">{room.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                      <div className="space-y-3">
                        <Label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Start Date</Label>
                        <Input 
                          type="date" 
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 shadow-sm font-medium hover:border-slate-300 transition-colors focus-visible:ring-[#E86A70]/20 focus-visible:border-[#E86A70]" 
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-sm font-bold text-slate-700 uppercase tracking-wider">End Date</Label>
                        <Input 
                          type="date" 
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 shadow-sm font-medium hover:border-slate-300 transition-colors focus-visible:ring-[#E86A70]/20 focus-visible:border-[#E86A70]" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="h-px w-full bg-slate-100"></div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="text-sm font-bold text-slate-700 uppercase tracking-wider">New Price (₹)</Label>
                      <div className="relative">
                        <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input 
                          type="number" 
                          placeholder="Enter new rate" 
                          value={newPrice}
                          onChange={(e) => setNewPrice(e.target.value)}
                          className="h-12 pl-11 rounded-2xl border-slate-200 bg-slate-50/50 shadow-sm font-bold text-lg hover:border-slate-300 transition-colors focus-visible:ring-[#E86A70]/20 focus-visible:border-[#E86A70]" 
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Available Rooms</Label>
                      <div className="relative">
                        <BedDouble className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input 
                          type="number" 
                          placeholder="Number of rooms" 
                          value={availableRooms}
                          onChange={(e) => setAvailableRooms(e.target.value)}
                          className="h-12 pl-11 rounded-2xl border-slate-200 bg-slate-50/50 shadow-sm font-bold text-lg hover:border-slate-300 transition-colors focus-visible:ring-[#E86A70]/20 focus-visible:border-[#E86A70]" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <Label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Apply to specific days</Label>
                    <div className="flex flex-wrap gap-3">
                      {DAYS_OF_WEEK.map((day) => {
                        const isSelected = selectedDays.includes(day);
                        return (
                          <Button 
                            key={day} 
                            type="button"
                            onClick={() => toggleDay(day)}
                            variant="outline" 
                            className={`h-10 px-5 rounded-xl font-bold transition-all ${
                              isSelected 
                                ? 'bg-[#E86A70] text-white border-[#E86A70] shadow-md shadow-[#E86A70]/20 hover:bg-[#E86A70]/90 hover:text-white' 
                                : 'bg-white text-slate-500 border-slate-200 hover:border-[#E86A70] hover:text-[#E86A70] hover:bg-[#E86A70]/5 shadow-sm'
                            }`}
                          >
                            {day}
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-8 mt-4 flex justify-end">
                    <Button 
                      disabled={isApplyingBulk}
                      onClick={handleApplyBulkUpdate}
                      className="h-12 px-8 rounded-2xl bg-[#E86A70] hover:bg-[#E86A70]/90 text-white font-bold shadow-lg shadow-[#E86A70]/30 transition-all hover:-translate-y-0.5 gap-2 text-base cursor-pointer"
                    >
                      {isApplyingBulk ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" /> Applying...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5" /> Apply Updates
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 3: SPECIAL OFFERS */}
            <TabsContent value="offers" className="outline-none">
              <SpecialOffersModule rooms={rooms} properties={properties} />
            </TabsContent>
          </div>
        </Tabs>
      )}

      {/* SINGLE DAY QUICK EDIT MODAL */}
      <Dialog open={!!editingDate} onOpenChange={(open) => !open && setEditingDate(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="font-heading font-black text-xl text-secondary flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-[#E86A70]" />
              Update Date: {editingDate?.dateKey}
            </DialogTitle>
            <DialogDescription className="text-slate-500 text-sm">
              Adjust rate or available rooms for {selectedRoom?.name || "this room"}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Daily Rate (₹)</Label>
              <div className="relative">
                <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  type="number" 
                  value={editPriceInput}
                  onChange={(e) => setEditPriceInput(e.target.value)}
                  className="pl-10 h-11 rounded-xl font-bold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Available Rooms</Label>
              <div className="relative">
                <BedDouble className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  type="number" 
                  value={editAvailInput}
                  onChange={(e) => setEditAvailInput(e.target.value)}
                  className="pl-10 h-11 rounded-xl font-bold"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-row justify-between sm:justify-between items-center gap-2 pt-2">
            {editingDate?.isOverridden ? (
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClearDayOverride}
                className="rounded-xl text-xs font-bold border-rose-200 text-rose-600 hover:bg-rose-50"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset Override
              </Button>
            ) : <div />}

            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setEditingDate(null)}
                className="rounded-xl font-medium"
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={handleSaveDayEdit}
                className="rounded-xl bg-[#E86A70] hover:bg-[#E86A70]/90 text-white font-bold px-5"
              >
                Save
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CREATE SPECIAL OFFER DIALOG */}
      <Dialog open={isOfferDialogOpen} onOpenChange={setIsOfferDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="font-heading font-black text-xl text-secondary flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#E86A70]" />
              Create Special Offer
            </DialogTitle>
            <DialogDescription className="text-slate-500 text-sm">
              Set up a temporary promotion for your properties.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Offer Title</Label>
              <Input 
                placeholder="e.g., Summer Special, Weekend Promo" 
                value={offerTitle}
                onChange={(e) => setOfferTitle(e.target.value)}
                className="h-11 rounded-xl font-medium"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Discount Percentage (%)</Label>
              <Input 
                type="number" 
                placeholder="e.g., 15" 
                value={offerDiscount}
                onChange={(e) => setOfferDiscount(e.target.value)}
                className="h-11 rounded-xl font-bold"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Target Room</Label>
              <Select value={offerRoomId} onValueChange={(val) => setOfferRoomId(val ?? "all")}>
                <SelectTrigger className="h-11 rounded-xl font-medium">
                  <SelectValue placeholder="All Rooms" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Rooms</SelectItem>
                  {rooms.map(room => (
                    <SelectItem key={room.$id} value={room.$id}>{room.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Start Date</Label>
                <Input 
                  type="date" 
                  value={offerStartDate}
                  onChange={(e) => setOfferStartDate(e.target.value)}
                  className="h-11 rounded-xl font-medium"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">End Date</Label>
                <Input 
                  type="date" 
                  value={offerEndDate}
                  onChange={(e) => setOfferEndDate(e.target.value)}
                  className="h-11 rounded-xl font-medium"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-2 pt-2">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => setIsOfferDialogOpen(false)}
              className="rounded-xl font-medium"
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleCreateOffer}
              className="rounded-xl bg-[#E86A70] hover:bg-[#E86A70]/90 text-white font-bold px-6"
            >
              Create Promotion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

