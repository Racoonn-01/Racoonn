"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export default function CalendarPage() {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dates = Array.from({ length: 35 }, (_, i) => i - 2); // Mock 35 days grid

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-heading font-bold text-secondary">Calendar</h2>
          <p className="text-slate-500 mt-1">Manage availability and view bookings at a glance.</p>
        </div>
        <div className="flex items-center gap-2 bg-white ring-1 ring-slate-200 rounded-lg p-1 shadow-sm">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-semibold text-secondary min-w-[120px] text-center">October 2026</span>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1"
      >
        <Card className="border-0 shadow-sm ring-1 ring-slate-100 rounded-xl bg-white overflow-hidden h-full flex flex-col">
          <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/80">
            {days.map(day => (
              <div key={day} className="py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                {day}
              </div>
            ))}
          </div>
          <CardContent className="p-0 grid grid-cols-7 grid-rows-5 flex-1 min-h-[500px]">
            {dates.map((date, i) => {
              const isCurrentMonth = date > 0 && date <= 31;
              const hasBooking = isCurrentMonth && (date === 12 || date === 13 || date === 14);
              const isBlocked = isCurrentMonth && date === 22;

              return (
                <div 
                  key={i} 
                  className={`border-r border-b border-slate-100 p-2 min-h-[100px] transition-colors hover:bg-slate-50 cursor-pointer ${
                    !isCurrentMonth ? "bg-slate-50/50 opacity-50" : ""
                  }`}
                >
                  <div className={`text-sm font-medium ${isCurrentMonth ? "text-secondary" : "text-slate-400"}`}>
                    {isCurrentMonth ? date : (date <= 0 ? 30 + date : date - 31)}
                  </div>
                  
                  <div className="mt-2 space-y-1">
                    {hasBooking && (
                      <div className="bg-primary/10 border border-primary/20 text-primary text-[10px] font-semibold px-2 py-1 rounded truncate">
                        Michael Scott
                      </div>
                    )}
                    {isBlocked && (
                      <div className="bg-slate-200 text-slate-600 text-[10px] font-semibold px-2 py-1 rounded truncate">
                        Blocked
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
