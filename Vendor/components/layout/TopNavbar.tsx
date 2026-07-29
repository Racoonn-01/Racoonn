"use client";

import { useState, useEffect } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Search, Bell, ChevronDown, Calendar, CheckCircle2, Clock } from "lucide-react";
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
import { databases, appwriteConfig, storage } from "@/lib/appwrite/client";
import { Query } from "appwrite";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timeAgo: string;
  unread: boolean;
  type: "booking" | "payout" | "kyc";
}

function calculateTimeAgo(dateString?: string): string {
  if (!dateString) return "Recently";
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function TopNavbar() {
  const { profile } = useAuthStore();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    async function loadRealtimeNotifications() {
      try {
        const [bookingsRes, guestsRes] = await Promise.all([
          databases.listDocuments(appwriteConfig.databaseId, 'bookings', [
            Query.orderDesc('$createdAt'),
            Query.limit(5)
          ]),
          databases.listDocuments(appwriteConfig.databaseId, 'booking_guests', [
            Query.limit(10)
          ])
        ]);

        const notifs: NotificationItem[] = [];

        // 1. Account Status Notification
        if (profile?.status) {
          if (profile.status.toLowerCase() === 'approved') {
            notifs.push({
              id: 'kyc-approved',
              title: 'Account Status: Approved',
              message: 'Your vendor account is active and verified. You can receive guest bookings and payouts.',
              timeAgo: 'Active',
              unread: false,
              type: 'kyc'
            });
          } else if (profile.status.toLowerCase() === 'pending') {
            notifs.push({
              id: 'kyc-pending',
              title: 'Account Under Review',
              message: 'Your account documents are pending Admin approval.',
              timeAgo: 'In Review',
              unread: true,
              type: 'kyc'
            });
          }
        }

        // 2. Real-time Bookings Notifications
        bookingsRes.documents.forEach((b: any) => {
          const guest = guestsRes.documents.find((g: any) => g.bookingId === b.$id);
          const guestName = guest ? `${guest.firstName} ${guest.lastName}`.trim() : (b.guestName || 'Guest User');
          const hotelName = b.hotelName || 'Racoonn Property';
          const checkIn = new Date(b.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          const checkOut = new Date(b.checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

          notifs.push({
            id: `booking-${b.$id}`,
            title: `New Booking (${b.status || 'Confirmed'})`,
            message: `${guestName} booked ${hotelName} from ${checkIn} to ${checkOut}.`,
            timeAgo: calculateTimeAgo(b.$createdAt),
            unread: true,
            type: 'booking'
          });
        });

        setNotifications(notifs);
        setHasUnread(notifs.some(n => n.unread));
      } catch (err) {
        console.warn("Notification real-time fetch warning:", err);
      }
    }

    loadRealtimeNotifications();
  }, [profile]);

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    setHasUnread(false);
  };

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
              {hasUnread && (
                <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-primary ring-2 ring-white"></span>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 mt-2 rounded-xl p-0 overflow-hidden shadow-lg border-slate-200">
              <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
                {hasUnread && (
                  <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full">New</span>
                )}
              </div>
              <div className="max-h-75 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id}
                      className="p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors relative"
                    >
                      {notif.unread && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                      )}
                      <p className="text-sm font-bold text-slate-800 mb-1">{notif.title}</p>
                      <p className="text-xs text-slate-500 leading-relaxed">{notif.message}</p>
                      <p className="text-[10px] text-slate-400 mt-2 font-medium">{notif.timeAgo}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No notifications right now.
                  </div>
                )}
              </div>
              {hasUnread && (
                <div 
                  onClick={handleMarkAllRead}
                  className="p-3 bg-slate-50 text-center border-t border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <p className="text-xs font-bold text-primary">Mark all as read</p>
                </div>
              )}
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
