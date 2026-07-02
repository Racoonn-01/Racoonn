"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Mail, Phone, ExternalLink, Users } from "lucide-react";
import { motion } from "framer-motion";

const guests: any[] = [];

export default function GuestsPage() {
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
              className="pl-9 bg-white border-slate-200"
            />
          </div>
        </div>
        <CardContent className="p-0 overflow-x-auto">
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
              {guests.length > 0 ? (
                guests.map((guest, i) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    key={guest.id} 
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="p-4 font-semibold text-secondary flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm">
                        {guest.name.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      {guest.name}
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
                        guest.status === 'VIP' ? 'bg-amber-100 text-amber-700' :
                        guest.status === 'New' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {guest.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
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
        </CardContent>
      </Card>
    </div>
  );
}
