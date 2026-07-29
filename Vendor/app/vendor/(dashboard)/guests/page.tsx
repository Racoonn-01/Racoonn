"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Mail, Phone, ExternalLink, Users, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { databases, appwriteConfig } from "@/lib/appwrite/client";
import { Query } from "appwrite";
import { useAuthStore } from "@/store/authStore";

export interface GuestProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  stays: number;
  lastVisit: string;
  status: "VIP" | "Regular" | "New";
}

export default function GuestsPage() {
  const { user } = useAuthStore();
  const [guests, setGuests] = useState<GuestProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchGuestsData() {
      try {
        setIsLoading(true);
        // Fetch all bookings and guest records from Appwrite in real-time
        const [bookingsRes, guestsRes] = await Promise.all([
          databases.listDocuments(appwriteConfig.databaseId, 'bookings', [Query.orderDesc('$createdAt')]),
          databases.listDocuments(appwriteConfig.databaseId, 'booking_guests')
        ]);

        // Map and aggregate unique guest profiles from real-time database documents
        const guestMap = new Map<string, {
          id: string;
          name: string;
          email: string;
          phone: string;
          country: string;
          stays: number;
          lastVisitDate: Date;
        }>();

        // 1. Aggregate explicit booking_guests records
        guestsRes.documents.forEach(gDoc => {
          const booking = bookingsRes.documents.find(b => b.$id === gDoc.bookingId);
          const fullName = `${gDoc.firstName || ''} ${gDoc.lastName || ''}`.trim() || 'Guest User';
          const email = gDoc.email || 'N/A';
          const phone = gDoc.phone || 'N/A';
          const country = gDoc.country || 'India';

          const key = email !== 'N/A' ? email.toLowerCase() : (phone !== 'N/A' ? phone : `${fullName}_${gDoc.$id}`);
          const bookingCheckOutDate = booking?.checkOut ? new Date(booking.checkOut) : new Date(gDoc.$createdAt || Date.now());

          if (guestMap.has(key)) {
            const existing = guestMap.get(key)!;
            existing.stays += 1;
            if (bookingCheckOutDate > existing.lastVisitDate) {
              existing.lastVisitDate = bookingCheckOutDate;
            }
          } else {
            guestMap.set(key, {
              id: gDoc.$id,
              name: fullName,
              email,
              phone,
              country,
              stays: 1,
              lastVisitDate: bookingCheckOutDate
            });
          }
        });

        // 2. Aggregate bookings documents that do not have a separate booking_guests document
        bookingsRes.documents.forEach((b: any) => {
          const matchingGuest = guestsRes.documents.find(g => g.bookingId === b.$id);
          if (!matchingGuest) {
            const email = b.guestEmail || b.email || 'N/A';
            const fullName = b.guestName || b.name || 'Guest User';
            const phone = b.guestPhone || b.phone || 'N/A';
            const key = email !== 'N/A' ? email.toLowerCase() : (phone !== 'N/A' ? phone : `${fullName}_${b.$id}`);
            const checkOutDate = b.checkOut ? new Date(b.checkOut) : new Date(b.$createdAt || Date.now());

            if (guestMap.has(key)) {
              const existing = guestMap.get(key)!;
              existing.stays += 1;
              if (checkOutDate > existing.lastVisitDate) {
                existing.lastVisitDate = checkOutDate;
              }
            } else {
              guestMap.set(key, {
                id: b.$id,
                name: fullName,
                email,
                phone,
                country: 'India',
                stays: 1,
                lastVisitDate: checkOutDate
              });
            }
          }
        });

        const formattedGuests: GuestProfile[] = Array.from(guestMap.values()).map(g => {
          let status: "VIP" | "Regular" | "New" = "New";
          if (g.stays >= 3) status = "VIP";
          else if (g.stays >= 2) status = "Regular";

          return {
            id: g.id,
            name: g.name,
            email: g.email,
            phone: g.phone,
            country: g.country,
            stays: g.stays,
            lastVisit: g.lastVisitDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
            status
          };
        });

        setGuests(formattedGuests);
      } catch (err) {
        console.error("Failed to fetch real-time guest data:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchGuestsData();
  }, [user]);

  const filteredGuests = useMemo(() => {
    return guests.filter(g => 
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.phone.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [guests, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-heading font-bold text-secondary">Guests</h2>
          <p className="text-slate-500 mt-1">Manage guest profiles, history, and contact information.</p>
        </div>
      </div>

      <Card className="border-0 shadow-sm ring-1 ring-slate-100 rounded-xl bg-white overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center bg-slate-50/50">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search guests..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white border-slate-200 text-sm font-medium"
            />
          </div>
        </div>
        <CardContent className="p-0 overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-16">
              <Loader2 className="w-8 h-8 animate-spin text-[#E86A70]" />
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-xs uppercase tracking-wider font-semibold text-slate-500">
                  <th className="p-4 font-medium">Guest Name</th>
                  <th className="p-4 font-medium">Contact</th>
                  <th className="p-4 font-medium text-center">Total Stays</th>
                  <th className="p-4 font-medium">Last Visit</th>
                  <th className="p-4 font-medium text-center">Status</th>
                  <th className="p-4 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredGuests.length > 0 ? (
                  filteredGuests.map((guest, i) => (
                    <motion.tr 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      key={guest.id} 
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      <td className="p-4 font-semibold text-secondary flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm uppercase">
                          {guest.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-bold text-secondary">{guest.name}</p>
                          <p className="text-xs text-slate-400 font-normal">{guest.country}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <span className="flex items-center text-slate-500 text-xs"><Mail className="w-3 h-3 mr-1.5" />{guest.email}</span>
                          <span className="flex items-center text-slate-500 text-xs"><Phone className="w-3 h-3 mr-1.5" />{guest.phone}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center font-semibold text-secondary">{guest.stays}</td>
                      <td className="p-4 text-slate-500">{guest.lastVisit}</td>
                      <td className="p-4 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          guest.status === 'VIP' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                          guest.status === 'New' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                          'bg-blue-100 text-blue-700 border border-blue-200'
                        }`}>
                          {guest.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <a 
                          href={`mailto:${guest.email}`} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-slate-400 hover:text-secondary hover:bg-slate-100 transition-colors"
                          title="Contact Guest"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                          <Users className="h-8 w-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-heading font-semibold text-secondary">No guests yet</h3>
                        <p className="text-slate-500 mt-1">Guests will appear here once they complete a booking.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
