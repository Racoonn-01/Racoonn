"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, IndianRupee, BedDouble, Percent, CheckCircle2, RefreshCw, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { databases, appwriteConfig } from "@/lib/appwrite/client";
import { Query } from "appwrite";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

export default function AvailabilityPage() {
  const { user } = useAuthStore();
  const [currentMonth, setCurrentMonth] = useState(new Date()); 
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      if (!user) return;
      try {
        const response = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.roomCollectionId,
          [Query.equal("vendorId", user.$id)]
        );
        setRooms(response.documents);
        if (response.documents.length > 0) {
          setSelectedRoomId(response.documents[0].$id);
        }
      } catch (err: any) {
        toast.error("Failed to fetch rooms: " + err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRooms();
  }, [user]);

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const selectedRoom = rooms.find(r => r.$id === selectedRoomId);
  const roomPrice = selectedRoom ? selectedRoom.price : 0;
  
  // Calculate calendar days
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay(); // 0 is Sunday
  
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => {
    const date = new Date(year, month, i + 1);
    const dayOfWeek = date.getDay();
    return {
      day: i + 1,
      available: selectedRoom ? 2 : 0, // Mock availability
      price: roomPrice,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      hasOffer: false,
      isToday: date.toDateString() === new Date().toDateString()
    };
  });

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
        <Tabs defaultValue="calendar" className="w-full">
          <TabsList className="bg-white border border-slate-200 p-1 rounded-2xl w-full flex-wrap sm:flex-nowrap sm:w-auto sm:inline-flex gap-1 shadow-sm mb-6 h-auto">
            <TabsTrigger 
              value="calendar" 
              className="data-[state=active]:bg-[#E86A70] data-[state=active]:text-white data-[state=active]:shadow-md text-slate-500 rounded-xl py-3 px-6 flex items-center gap-2.5 font-bold transition-all hover:text-slate-800 data-[state=active]:hover:text-white"
            >
              <CalendarDays className="w-5 h-5" /> Calendar View
            </TabsTrigger>
            <TabsTrigger 
              value="bulk" 
              className="data-[state=active]:bg-[#E86A70] data-[state=active]:text-white data-[state=active]:shadow-md text-slate-500 rounded-xl py-3 px-6 flex items-center gap-2.5 font-bold transition-all hover:text-slate-800 data-[state=active]:hover:text-white"
            >
              <RefreshCw className="w-5 h-5" /> Bulk Update
            </TabsTrigger>
            <TabsTrigger 
              value="offers" 
              className="data-[state=active]:bg-[#E86A70] data-[state=active]:text-white data-[state=active]:shadow-md text-slate-500 rounded-xl py-3 px-6 flex items-center gap-2.5 font-bold transition-all hover:text-slate-800 data-[state=active]:hover:text-white"
            >
              <Percent className="w-5 h-5" /> Special Offers
            </TabsTrigger>
          </TabsList>

          <div className="mt-2">
            <TabsContent value="calendar" className="space-y-6 outline-none">
              <Card className="border-0 shadow-xl shadow-slate-200/40 ring-1 ring-slate-100 rounded-3xl overflow-hidden bg-white">
                <CardHeader className="bg-gradient-to-b from-slate-50 to-white border-b border-slate-100 pb-5 pt-7 px-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <Select value={selectedRoomId} onValueChange={(val) => val && setSelectedRoomId(val)}>
                        <SelectTrigger className="w-full md:w-64 h-12 rounded-2xl bg-white border-slate-200 font-bold text-slate-700 shadow-sm hover:border-slate-300 transition-colors focus:ring-2 focus:ring-[#E86A70]/20 focus:border-[#E86A70]">
                          <SelectValue placeholder="Select Room">
                            {rooms.find(r => r.$id === selectedRoomId)?.name || "Select Room"}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {rooms.map(room => (
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
                        className={`min-h-36 border-r border-b border-slate-100/60 p-3 relative group transition-all duration-300 cursor-pointer ${day.isWeekend ? 'bg-slate-50/80' : 'bg-white'} hover:bg-slate-100/50 hover:shadow-inner`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <span className={`text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full transition-colors ${day.isToday ? 'bg-[#E86A70] text-white shadow-md shadow-[#E86A70]/30' : 'text-slate-600 group-hover:text-secondary group-hover:bg-slate-200'}`}>
                            {day.day}
                          </span>
                          {day.hasOffer && (
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 mt-2 shadow-sm" title="Special Offer Active"></span>
                          )}
                        </div>
                        
                        <div className="space-y-2 mt-auto">
                          <div className={`text-[11px] px-2.5 py-1.5 rounded-lg flex justify-between items-center font-bold tracking-wide ${day.available > 0 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/50' : 'bg-red-50 text-red-600 border border-red-100/50'}`}>
                            <span className="uppercase opacity-80">Avail</span>
                            <span className="text-sm">{day.available}</span>
                          </div>
                          <div className="text-[11px] px-2.5 py-1.5 rounded-lg flex justify-between items-center font-bold tracking-wide bg-indigo-50 text-indigo-600 border border-indigo-100/50">
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

            <TabsContent value="bulk" className="space-y-6 outline-none">
              <Card className="border-0 shadow-xl shadow-slate-200/40 ring-1 ring-slate-100 rounded-3xl overflow-hidden bg-white">
                <CardHeader className="bg-gradient-to-b from-slate-50 to-white border-b border-slate-100 pb-5 pt-7 px-8">
                  <CardTitle className="font-heading text-2xl font-black text-secondary">Bulk Update Rates & Availability</CardTitle>
                  <CardDescription className="text-slate-500 font-medium mt-1">Quickly update multiple dates for a specific room type. (Database collection required to save overrides).</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8 p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Room Type</Label>
                      <Select value={selectedRoomId} onValueChange={(val) => val && setSelectedRoomId(val)}>
                        <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 shadow-sm font-semibold hover:border-slate-300 hover:bg-slate-50 transition-colors focus:ring-2 focus:ring-[#E86A70]/20 focus:border-[#E86A70]">
                          <SelectValue placeholder="Select Room">
                            {rooms.find(r => r.$id === selectedRoomId)?.name || "Select Room"}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl shadow-lg border-slate-100">
                          {rooms.map(room => (
                            <SelectItem key={room.$id} value={room.$id} className="font-medium cursor-pointer rounded-xl mx-1 my-0.5">{room.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                      <div className="space-y-3">
                        <Label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Start Date</Label>
                        <Input type="date" className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 shadow-sm font-medium hover:border-slate-300 transition-colors focus-visible:ring-[#E86A70]/20 focus-visible:border-[#E86A70]" />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-sm font-bold text-slate-700 uppercase tracking-wider">End Date</Label>
                        <Input type="date" className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 shadow-sm font-medium hover:border-slate-300 transition-colors focus-visible:ring-[#E86A70]/20 focus-visible:border-[#E86A70]" />
                      </div>
                    </div>
                  </div>

                  <div className="h-px w-full bg-slate-100"></div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="text-sm font-bold text-slate-700 uppercase tracking-wider">New Price (₹)</Label>
                      <div className="relative">
                        <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input type="number" placeholder="Enter new rate" className="h-12 pl-11 rounded-2xl border-slate-200 bg-slate-50/50 shadow-sm font-bold text-lg hover:border-slate-300 transition-colors focus-visible:ring-[#E86A70]/20 focus-visible:border-[#E86A70]" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Available Rooms</Label>
                      <div className="relative">
                        <BedDouble className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input type="number" placeholder="Number of rooms" className="h-12 pl-11 rounded-2xl border-slate-200 bg-slate-50/50 shadow-sm font-bold text-lg hover:border-slate-300 transition-colors focus-visible:ring-[#E86A70]/20 focus-visible:border-[#E86A70]" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <Label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Apply to specific days</Label>
                    <div className="flex flex-wrap gap-3">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                        <Button key={day} variant="outline" className="h-10 px-5 rounded-xl font-bold bg-white text-slate-500 border-slate-200 hover:border-[#E86A70] hover:text-[#E86A70] hover:bg-[#E86A70]/5 shadow-sm transition-all">
                          {day}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-8 mt-4 flex justify-end">
                    <Button className="h-12 px-8 rounded-2xl bg-[#E86A70] hover:bg-[#E86A70]/90 text-white font-bold shadow-lg shadow-[#E86A70]/30 transition-all hover:-translate-y-0.5 gap-2 text-base"
                      onClick={() => toast.info("Daily Overrides database collection is not set up yet. Using base prices.")}
                    >
                      <CheckCircle2 className="w-5 h-5" /> Apply Updates
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="offers" className="space-y-6 outline-none">
              <Card className="border-0 shadow-xl shadow-slate-200/40 ring-1 ring-slate-100 rounded-3xl overflow-hidden bg-white">
                <CardHeader className="bg-gradient-to-b from-slate-50 to-white border-b border-slate-100 pb-6 pt-7 px-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="font-heading text-2xl font-black text-secondary">Active Special Offers</CardTitle>
                    <CardDescription className="text-slate-500 font-medium mt-1">Create promotions to boost occupancy during low seasons.</CardDescription>
                  </div>
                  <Button className="bg-[#1F2E4A] hover:bg-[#1F2E4A]/90 text-white rounded-2xl h-12 px-6 font-bold shadow-lg shadow-[#1F2E4A]/20 transition-all hover:-translate-y-0.5">
                    Create Offer
                  </Button>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="space-y-4">
                    <div className="p-10 rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex items-center justify-center text-center transition-colors hover:bg-slate-50 hover:border-slate-300">
                      <div className="max-w-sm">
                        <div className="w-16 h-16 rounded-full bg-white shadow-sm ring-1 ring-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-5">
                          <Percent className="w-7 h-7" />
                        </div>
                        <h4 className="font-black text-lg text-secondary mb-2">No active offers</h4>
                        <p className="text-slate-500 font-medium">You don't have any special offers active. Create one to boost bookings and stand out.</p>
                        <Button variant="outline" className="mt-6 rounded-xl h-11 px-6 font-bold text-[#E86A70] border-slate-200 hover:border-[#E86A70] hover:bg-[#E86A70]/5 shadow-sm">
                          Create your first offer
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      )}
    </div>
  );
}
