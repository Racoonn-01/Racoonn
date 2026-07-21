"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
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
  MessageSquare, 
  LifeBuoy, 
  Megaphone, 
  BarChart3, 
  Bell, 
  AlertTriangle, 
  Activity, 
  Shield, 
  Settings 
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

const navItems = [
  { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Vendor Management", url: "/admin/vendors", icon: Users },
  { title: "Verification Center", url: "/admin/verification", icon: ShieldCheck },
  { title: "Properties", url: "/admin/properties", icon: Building2 },
  { title: "Bookings", url: "/admin/bookings", icon: CalendarDays },
  { title: "Customers", url: "/admin/customers", icon: UserCircle },
]

const financialItems = [
  { title: "Revenue", url: "/admin/revenue", icon: BadgeDollarSign },
  { title: "Payments", url: "/admin/payments", icon: CreditCard },
  { title: "Payouts", url: "/admin/payouts", icon: HandCoins },
]

const operationsItems = [
  { title: "Reviews", url: "/admin/reviews", icon: MessageSquare },
  { title: "Support", url: "/admin/support", icon: LifeBuoy },
  { title: "Marketing", url: "/admin/marketing", icon: Megaphone },
  // { title: "CMS", url: "/cms", icon: FileText },
]

const systemItems = [
  { title: "Reports", url: "/admin/reports", icon: BarChart3 },
  { title: "Notifications", url: "/admin/notifications", icon: Bell },
  { title: "Fraud Detection", url: "/admin/fraud", icon: AlertTriangle },
  { title: "Audit Logs", url: "/admin/audit", icon: Activity },
  { title: "Role Management", url: "/admin/roles", icon: Shield },
  { title: "Settings", url: "/admin/settings", icon: Settings },
]

import Image from "next/image"

export function AdminSidebar() {
  const pathname = usePathname()

  const renderMenuItems = (items: typeof navItems) => (
    <SidebarMenu>
      {items.map((item) => {
        const isActive = pathname.startsWith(item.url)
        return (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton 
              isActive={isActive} 
              tooltip={item.title}
              className={`rounded-xl transition-all duration-200 ${isActive ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground font-medium shadow-sm' : 'hover:bg-muted font-normal text-muted-foreground hover:text-foreground'}`}
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
        <div className="px-3 py-2">
          {renderMenuItems(navItems)}
        </div>
        <SidebarSeparator className="mx-4 opacity-50" />
        <div className="px-3 py-2">
          <div className="mb-2 px-4 text-xs font-bold text-muted-foreground/70 uppercase tracking-widest group-data-[collapsible=icon]:hidden">Finance</div>
          {renderMenuItems(financialItems)}
        </div>
        <SidebarSeparator className="mx-4 opacity-50" />
        <div className="px-3 py-2">
          <div className="mb-2 px-4 text-xs font-bold text-muted-foreground/70 uppercase tracking-widest group-data-[collapsible=icon]:hidden">Operations</div>
          {renderMenuItems(operationsItems)}
        </div>
        <SidebarSeparator className="mx-4 opacity-50" />
        <div className="px-3 py-2">
          <div className="mb-2 px-4 text-xs font-bold text-muted-foreground/70 uppercase tracking-widest group-data-[collapsible=icon]:hidden">System</div>
          {renderMenuItems(systemItems)}
        </div>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-4 group-data-[collapsible=icon]:hidden">
          <div className="flex items-center gap-3 rounded-xl p-3 hover:bg-muted/50 transition-colors cursor-pointer -mx-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
              SA
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold leading-none text-foreground">Super Admin</span>
              <span className="text-xs text-muted-foreground mt-1 font-medium">admin@racoonn.com</span>
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
