"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Send, Paperclip, CheckCheck } from "lucide-react";

export default function MessagesPage() {
  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-6">
        <h2 className="text-3xl font-heading font-bold text-secondary">Messages</h2>
        <p className="text-slate-500 mt-1">Communicate with guests and Racoonn support.</p>
      </div>

      <Card className="flex-1 border-0 shadow-sm ring-1 ring-slate-100 rounded-xl bg-white overflow-hidden flex flex-col md:flex-row">
        {/* Sidebar */}
        <div className="w-full md:w-80 border-r border-slate-100 flex flex-col bg-slate-50/50">
          <div className="p-4 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Search messages..." className="pl-9 bg-white" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-white transition-colors ${i === 1 ? 'bg-white border-l-4 border-l-primary' : ''}`}>
                <div className="flex justify-between items-start mb-1">
                  <span className={`font-semibold ${i === 1 ? 'text-primary' : 'text-secondary'}`}>Guest #{8000 + i}</span>
                  <span className="text-[10px] text-slate-400">10:42 AM</span>
                </div>
                <p className="text-xs text-slate-500 truncate">Can we request an early check-in?</p>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <h3 className="font-heading font-bold text-secondary">Guest #8001 (Michael Scott)</h3>
              <p className="text-xs text-slate-500">Booking: BKG-7829 • Check-in: Oct 12</p>
            </div>
            <Button variant="outline" size="sm" className="text-primary border-primary/20 bg-primary/5">View Booking</Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
            <div className="flex justify-start">
              <div className="bg-slate-100 text-slate-700 px-4 py-3 rounded-2xl rounded-tl-sm max-w-[80%] text-sm">
                <p>Hello, we are arriving on a very early flight. Is it possible to check in around 10 AM?</p>
                <p className="text-[10px] text-slate-400 mt-2 text-right">10:42 AM</p>
              </div>
            </div>
            <div className="flex justify-end">
              <div className="bg-primary text-white px-4 py-3 rounded-2xl rounded-tr-sm max-w-[80%] text-sm">
                <p>Hi Michael! We'd be happy to accommodate an early check-in for you. Your room will be ready by 10 AM.</p>
                <div className="flex justify-end items-center gap-1 mt-2">
                  <p className="text-[10px] text-primary-foreground/80">10:45 AM</p>
                  <CheckCheck className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 border-t border-slate-100 bg-white">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-slate-400 shrink-0">
                <Paperclip className="w-5 h-5" />
              </Button>
              <Input placeholder="Type your message..." className="flex-1 bg-slate-50" />
              <Button className="bg-primary text-white shrink-0">
                <Send className="w-4 h-4 mr-2" />
                Send
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
