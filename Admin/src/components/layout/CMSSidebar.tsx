"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Home, 
  Map, 
  Package, 
  ChevronLeft
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Image from "next/image"

const navItems = [
  { title: "Overview", url: "/cms", icon: LayoutDashboard },
  { title: "Popular Stay", url: "/cms/popular-stays", icon: Home },
  { title: "Popular Destinations", url: "/cms/popular-destinations", icon: Map },
  { title: "Create Packages", url: "/cms/packages", icon: Package },
]

export function CMSSidebar() {
  const pathname = usePathname()

  const renderMenuItems = (items: typeof navItems) => (
    <SidebarMenu>
      {items.map((item) => {
        const isActive = pathname === item.url || (item.url !== "/cms" && pathname.startsWith(item.url))
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
          <Image 
            src="/logo-expanded.png" 
            alt="Racoonn Logo" 
            width={120} height={40}
            className="h-10 w-auto object-contain group-data-[collapsible=icon]:hidden transition-all" 
          />
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
          <div className="mb-2 px-4 text-xs font-bold text-muted-foreground/70 uppercase tracking-widest group-data-[collapsible=icon]:hidden">CMS Menu</div>
          {renderMenuItems(navItems)}
        </div>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-4 group-data-[collapsible=icon]:hidden">
          <Link href="/admin/dashboard" className="flex items-center gap-3 rounded-xl p-3 hover:bg-muted/50 transition-colors cursor-pointer -mx-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
              <ChevronLeft className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold leading-none text-foreground">Back to Admin</span>
              <span className="text-xs text-muted-foreground mt-1 font-medium">Return to panel</span>
            </div>
          </Link>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
