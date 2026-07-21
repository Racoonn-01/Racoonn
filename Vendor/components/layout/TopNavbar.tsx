"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Search, Bell, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { Badge } from "@/components/ui/badge";
import { appwriteConfig, storage } from "@/lib/appwrite/client";

export function TopNavbar() {
  const { profile } = useAuthStore();
  
  return (
    <header className="sticky top-0 z-20 flex h-18 w-full items-center justify-between border-b border-slate-200 bg-white/90 backdrop-blur-md px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="text-slate-500 hover:text-slate-900 transition-colors" />
        <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
        <h1 className="text-xl font-heading font-semibold text-secondary hidden sm:block">Dashboard Overview</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative hidden md:block group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input 
            type="search" 
            placeholder="Search bookings, guests..." 
            className="w-72 rounded-full bg-slate-50 border-slate-200 pl-10 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-all text-sm shadow-inner"
          />
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2 mr-2">
          {profile?.status && (
            <div className="hidden md:flex items-center mr-2" title="Only Admin can change your Status">
              <Badge 
                variant={
                  profile.status.toLowerCase() === 'approved' ? 'default' 
                  : profile.status.toLowerCase() === 'blocked' ? 'destructive' 
                  : 'secondary'
                }
                className="capitalize cursor-help"
              >
                {profile.status}
              </Badge>
            </div>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger className="relative p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors outline-none cursor-pointer">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-primary ring-2 ring-white"></span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 mt-2 rounded-xl p-0 overflow-hidden shadow-lg border-slate-200">
              <div className="bg-slate-50 border-b border-slate-100 p-4">
                <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
              </div>
              <div className="max-h-75 overflow-y-auto">
                <div className="p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors relative">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                  <p className="text-sm font-bold text-slate-800 mb-1">New Booking Request</p>
                  <p className="text-xs text-slate-500 leading-relaxed">Rahul Sharma requested a stay at Deluxe King Room from Oct 12 to Oct 15.</p>
                  <p className="text-[10px] text-slate-400 mt-2 font-medium">2 hours ago</p>
                </div>
                <div className="p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors">
                  <p className="text-sm font-bold text-slate-800 mb-1">Payout Processed</p>
                  <p className="text-xs text-slate-500 leading-relaxed">Your recent payout of ₹12,500 has been successfully processed to your bank account.</p>
                  <p className="text-[10px] text-slate-400 mt-2 font-medium">Yesterday</p>
                </div>
                <div className="p-4 hover:bg-slate-50 cursor-pointer transition-colors">
                  <p className="text-sm font-bold text-slate-800 mb-1">KYC Verified</p>
                  <p className="text-xs text-slate-500 leading-relaxed">Your uploaded documents have been verified successfully. Your listing is now active.</p>
                  <p className="text-[10px] text-slate-400 mt-2 font-medium">2 days ago</p>
                </div>
              </div>
              <div className="p-3 bg-slate-50 text-center border-t border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors">
                <p className="text-xs font-bold text-primary">Mark all as read</p>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

        <DropdownMenu>
          <DropdownMenuTrigger>
            <div className="flex items-center gap-3 ml-1 cursor-pointer group hover:bg-slate-50 p-1.5 rounded-full pr-3 transition-colors outline-none">
              <Avatar className="h-9 w-9 ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                <AvatarImage src={profile?.profileImage ? storage.getFilePreview(appwriteConfig.profileImagesBucketId, profile.profileImage).toString() : "https://github.com/shadcn.png"} alt="@vendor" />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">VD</AvatarFallback>
              </Avatar>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-semibold text-secondary leading-none">{profile?.businessName || profile?.firstName || "Vendor"}</p>
                <p className="text-xs text-slate-500 mt-1">Vendor Account</p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 hidden lg:block group-hover:text-slate-600" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl p-2">
            <DropdownMenuItem className="rounded-lg cursor-pointer p-3 font-medium">
              <Link href="/vendor/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg cursor-pointer p-3 font-medium">
              <Link href="/vendor/support">Support</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
