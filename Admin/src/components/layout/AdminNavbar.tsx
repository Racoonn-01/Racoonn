"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Bell, Search, FileText, LogOut, User, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { logoutAdmin } from "@/lib/auth"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function AdminNavbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    try {
      const cookies = document.cookie.split("; ");
      const sessionCookie = cookies.find(row => row.startsWith("racoonn_admin_session="));
      if (sessionCookie) {
        const val = decodeURIComponent(sessionCookie.split("=")[1]);
        setSession(JSON.parse(val));
      }
    } catch (e) {
      console.error("Failed to parse session cookie:", e);
    }
  }, []);

  const handleLogout = async () => {
    await logoutAdmin();
  };

  const isRootAdmin = session?.email === "admin@racoonn.com" || session?.email === "admin" || (!session && true);
  const displayName = session?.name || "Super Admin";
  const displayRole = session?.role || "Administrator";
  const displayEmail = session?.email || "admin@racoonn.com";
  const avatarInitials = displayName.substring(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-10 flex h-20 shrink-0 items-center gap-4 bg-background/80 backdrop-blur-md px-6 border-b border-border/40">
      <SidebarTrigger className="-ml-2 text-muted-foreground hover:text-foreground" />
      <div className="h-6 w-px bg-border/50" />
      <Breadcrumb className="hidden sm:flex">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/dashboard" className="text-muted-foreground hover:text-foreground font-medium">Admin</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-semibold">Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="ml-auto flex items-center gap-4">
        <div className="relative hidden md:flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search everything... (Cmd+K)"
            className="w-64 rounded-full bg-muted/50 pl-9 md:w-80 border-transparent focus-visible:bg-transparent focus-visible:border-primary/30 focus-visible:ring-primary/20 transition-all"
          />
        </div>

        {/* CMS Button - Visible ONLY for Super Admin */}
        {isRootAdmin && (
          <Link href="/cms">
            <Button variant="outline" size="sm" className="hidden md:flex gap-2 rounded-full">
              <FileText className="h-4 w-4" />
              <span>CMS</span>
            </Button>
          </Link>
        )}

        <Button variant="ghost" size="icon" className="relative rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-primary border-2 border-background" />
          <span className="sr-only">Toggle notifications</span>
        </Button>

        {/* Profile Avatar & Logout Dropdown */}
        <div className="relative">
          <Avatar 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="h-10 w-10 border-2 border-primary/20 shadow-sm hover:ring-2 hover:ring-primary/30 transition-all cursor-pointer"
          >
            <AvatarImage src="/placeholder-user.jpg" alt="@admin" />
            <AvatarFallback className="bg-[#E86A70] text-white font-bold text-sm">
              {avatarInitials}
            </AvatarFallback>
          </Avatar>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 w-64 rounded-2xl bg-popover border border-border shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="p-3 border-b border-border/60">
                <p className="text-sm font-bold text-foreground flex items-center gap-1.5 truncate">
                  <ShieldCheck className="w-4 h-4 text-[#E86A70] shrink-0" /> 
                  <span className="truncate">{displayName}</span>
                </p>
                <p className="text-[11px] text-[#E86A70] font-semibold mt-0.5">{displayRole}</p>
                <p className="text-xs text-muted-foreground truncate mt-1 font-mono">{displayEmail}</p>
              </div>
              <div className="py-1">
                <Link 
                  href="/admin/settings"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl text-foreground hover:bg-muted transition-colors"
                >
                  <User className="w-4 h-4 text-muted-foreground" /> Admin Account Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-left mt-1"
                >
                  <LogOut className="w-4 h-4 text-rose-600" /> Log Out of Admin
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  )
}
