"use client"

import * as React from "react"
import { Search, LayoutDashboard } from "lucide-react"
import Link from "next/link"

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

export function CMSNavbar() {
  return (
    <header className="sticky top-0 z-10 flex h-20 shrink-0 items-center gap-4 bg-transparent backdrop-blur-sm px-6">
      <SidebarTrigger className="-ml-2 text-muted-foreground hover:text-foreground" />
      <div className="h-6 w-px bg-border/50" />
      <Breadcrumb className="hidden sm:flex">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/cms" className="text-muted-foreground hover:text-foreground font-medium">CMS</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-semibold">Overview</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="ml-auto flex items-center gap-4">
        <div className="relative hidden md:flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search content... (Cmd+K)"
            className="w-64 rounded-full bg-muted/50 pl-9 md:w-80 border-transparent focus-visible:bg-transparent focus-visible:border-primary/30 focus-visible:ring-primary/20 transition-all"
          />
        </div>
        <Link href="/admin/dashboard">
          <Button variant="outline" size="sm" className="hidden md:flex gap-2">
            <LayoutDashboard className="h-4 w-4" />
            <span>Admin</span>
          </Button>
        </Link>

        <Avatar className="h-9 w-9 border-2 border-background shadow-sm hover:ring-2 hover:ring-primary/20 transition-all cursor-pointer">
          <AvatarImage src="/RacoonFavicon.jpg" alt="@admin" />
          <AvatarFallback className="bg-primary/10 text-primary font-bold">SA</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
