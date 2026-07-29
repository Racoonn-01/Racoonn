"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { 
  LayoutDashboard, 
  Users, 
  ShieldCheck, 
  Building2, 
  CalendarDays, 
  UserCircle, 
  BadgeDollarSign, 
  CreditCard, 
  HandCoins, 
  FileText,
  MessageSquare, 
  LifeBuoy, 
  Megaphone, 
  BarChart3, 
  Bell, 
  AlertTriangle, 
  Shield, 
  Settings,
  Tent
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"

interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
  key: string;
}

const navItems: NavItem[] = [
  { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard, key: "Dashboard" },
  { title: "Vendor Management", url: "/admin/vendors", icon: Users, key: "Vendors" },
  { title: "Verification Center", url: "/admin/verification", icon: ShieldCheck, key: "Verification" },
  { title: "Properties", url: "/admin/properties", icon: Building2, key: "Properties" },
  { title: "Bookings", url: "/admin/bookings", icon: CalendarDays, key: "Bookings" },
  { title: "Customers", url: "/admin/customers", icon: UserCircle, key: "Customers" },
]

const financialItems: NavItem[] = [
  { title: "Revenue", url: "/admin/revenue", icon: BadgeDollarSign, key: "Revenue" },
  { title: "Payments", url: "/admin/payments", icon: CreditCard, key: "Payments" },
  { title: "Payouts", url: "/admin/payouts", icon: HandCoins, key: "Payouts" },
  { title: "Invoice System", url: "/admin/invoices", icon: FileText, key: "Invoices" },
]

const operationsItems: NavItem[] = [
  { title: "Reviews", url: "/admin/reviews", icon: MessageSquare, key: "Reviews" },
  { title: "Support", url: "/admin/support", icon: LifeBuoy, key: "Support" },
  { title: "Marketing", url: "/admin/marketing", icon: Megaphone, key: "Marketing" },
  { title: "Activities", url: "/admin/activities", icon: Tent, key: "Activities" },
]

const systemItems: NavItem[] = [
  { title: "Reports", url: "/admin/reports", icon: BarChart3, key: "Reports" },
  { title: "Notifications", url: "/admin/notifications", icon: Bell, key: "Notifications" },
  { title: "Fraud Detection", url: "/admin/fraud", icon: AlertTriangle, key: "Fraud" },
  { title: "Role Management", url: "/admin/roles", icon: Shield, key: "Roles" },
  { title: "Settings", url: "/admin/settings", icon: Settings, key: "Settings" },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [session, setSession] = useState<{ email?: string; name?: string; allowedTabs?: string[] } | null>(null)

  useEffect(() => {
    try {
      const cookies = document.cookie.split("; ");
      const sessionCookie = cookies.find(row => row.startsWith("racoonn_admin_session="));
      if (sessionCookie) {
        const val = decodeURIComponent(sessionCookie.split("=")[1]);
        const parsedSession = JSON.parse(val);
        // Only set session if it changed to prevent cascading renders
        if (JSON.stringify(session) !== JSON.stringify(parsedSession)) {
          setSession(parsedSession);
        }
      }
    } catch (e) {
      console.error("Failed to parse session cookie:", e);
    }
  }, [pathname]);

  const allowedTabs: string[] = session?.allowedTabs || [];
  const isRootAdmin = session?.email === "admin@racoonn.com" || session?.email === "admin" || !session;
  const isSuperAdmin = isRootAdmin || allowedTabs.includes("all");

  const isTabAllowed = (key: string) => {
    if (isSuperAdmin) return true;
    return allowedTabs.includes(key);
  };

  const filterItems = (items: NavItem[]) => {
    return items.filter(item => isTabAllowed(item.key));
  };

  const visibleNav = filterItems(navItems);
  const visibleFinancial = filterItems(financialItems);
  const visibleOperations = filterItems(operationsItems);
  const visibleSystem = filterItems(systemItems);

  const renderMenuItems = (items: NavItem[]) => (
    <SidebarMenu>
      {items.map((item) => {
        const isActive = pathname.startsWith(item.url)
        return (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton 
              isActive={isActive} 
              tooltip={item.title}
              className={`rounded-xl transition-all duration-200 ${isActive ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground font-medium shadow-xs' : 'hover:bg-muted font-normal text-muted-foreground hover:text-foreground'}`}
              render={<Link href={item.url} className="flex flex-row items-center gap-3 py-5" />}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span className="truncate">{item.title}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )

  return (
    <Sidebar variant="inset" collapsible="icon" className="border-r-0 bg-sidebar">
      <SidebarHeader className="h-20 flex items-center px-4 justify-center bg-sidebar">
        <div className="flex items-center justify-center w-full h-full relative">
          {/* Expanded Logo */}
          <Image 
            src="/logo-expanded.png" 
            alt="Racoonn Logo" 
            width={120} height={40}
            className="h-10 w-auto object-contain group-data-[collapsible=icon]:hidden transition-all" 
          />
          {/* Collapsed Logo */}
          <Image 
            src="/logo-collapsed.png" 
            alt="Racoonn Icon" 
            width={40} height={40}
            className="h-10 w-10 object-contain hidden group-data-[collapsible=icon]:block transition-all" 
          />
        </div>
      </SidebarHeader>

      <SidebarContent className="gap-2">
        {visibleNav.length > 0 && (
          <div className="px-3 py-2">
            {renderMenuItems(visibleNav)}
          </div>
        )}

        {visibleFinancial.length > 0 && (
          <>
            <SidebarSeparator className="mx-4 opacity-50" />
            <div className="px-3 py-2">
              <div className="mb-2 px-4 text-xs font-bold text-muted-foreground/70 uppercase tracking-widest group-data-[collapsible=icon]:hidden">Finance</div>
              {renderMenuItems(visibleFinancial)}
            </div>
          </>
        )}

        {visibleOperations.length > 0 && (
          <>
            <SidebarSeparator className="mx-4 opacity-50" />
            <div className="px-3 py-2">
              <div className="mb-2 px-4 text-xs font-bold text-muted-foreground/70 uppercase tracking-widest group-data-[collapsible=icon]:hidden">Operations</div>
              {renderMenuItems(visibleOperations)}
            </div>
          </>
        )}

        {visibleSystem.length > 0 && (
          <>
            <SidebarSeparator className="mx-4 opacity-50" />
            <div className="px-3 py-2">
              <div className="mb-2 px-4 text-xs font-bold text-muted-foreground/70 uppercase tracking-widest group-data-[collapsible=icon]:hidden">System</div>
              {renderMenuItems(visibleSystem)}
            </div>
          </>
        )}
      </SidebarContent>

      <SidebarFooter>
        <div className="p-4 group-data-[collapsible=icon]:hidden">
          <div className="flex items-center gap-3 rounded-xl p-3 hover:bg-muted/50 transition-colors cursor-pointer -mx-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
              {session?.name ? session.name.substring(0, 2).toUpperCase() : "SA"}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold leading-none text-foreground">{session?.name || "Super Admin"}</span>
              <span className="text-xs text-muted-foreground mt-1 font-medium">{session?.email || "admin@racoonn.com"}</span>
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
