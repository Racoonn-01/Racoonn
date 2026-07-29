"use client"

import { useState, useEffect, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search, MoreHorizontal, Ban, Mail, Users, CreditCard, CalendarDays, TrendingUp, Filter, UserPlus } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { getAllCustomers } from "./actions"

export type CustomerData = {
  id: string;
  name: string;
  email: string;
  bookings: number;
  activeBookings: number;
  totalSpentNum: number;
  totalSpent: string;
  status: string;
  joined: string;
}

export default function CustomersPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [customers, setCustomers] = useState<CustomerData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadCustomers() {
      try {
        const data = await getAllCustomers()
        setCustomers(data)
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }
    loadCustomers()
  }, [])

  const stats = useMemo(() => {
    const totalCustomers = customers.length;
    let activeBookings = 0;
    let totalRevenue = 0;
    let suspended = 0;
    
    customers.forEach(c => {
      activeBookings += c.activeBookings;
      totalRevenue += c.totalSpentNum;
      if (c.status === 'suspended') suspended++;
    });

    const averageSpend = totalCustomers > 0 ? Math.round(totalRevenue / totalCustomers) : 0;

    return { totalCustomers, activeBookings, averageSpend, suspended };
  }, [customers])

  const filteredCustomers = customers.filter(c => {
    if (activeTab === "all") return true;
    return c.status === activeTab;
  })



  return (
    <div className="space-y-8 pb-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-foreground">Customer Management</h2>
          <p className="text-muted-foreground mt-1 text-lg">Manage platform users, view their booking history, and monitor activity.</p>
        </div>
        <Button className="h-11 px-6 rounded-full shadow-lg hover:shadow-xl transition-all">
          <UserPlus className="mr-2 h-5 w-5" /> Add Customer
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="bg-linear-to-br from-card to-card/50 border-muted/50 shadow-sm">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-3 w-full">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                  <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
                </div>
                <div className="mt-4 flex items-center">
                  <Skeleton className="h-4 w-32" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card className="bg-linear-to-br from-card to-card/50 border-muted/50 shadow-sm">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
                    <p className="text-3xl font-bold">{stats.totalCustomers.toLocaleString('en-US')}</p>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-emerald-500 font-medium">
                  <TrendingUp className="mr-1 h-4 w-4" /> +8% this month
                </div>
              </CardContent>
            </Card>

            <Card className="bg-linear-to-br from-card to-card/50 border-muted/50 shadow-sm">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Active Bookings</p>
                    <p className="text-3xl font-bold">{stats.activeBookings.toLocaleString('en-US')}</p>
                  </div>
                  <div className="p-3 bg-blue-500/10 rounded-xl">
                    <CalendarDays className="h-5 w-5 text-blue-500" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-emerald-500 font-medium">
                  <TrendingUp className="mr-1 h-4 w-4" /> +124 since yesterday
                </div>
              </CardContent>
            </Card>

            <Card className="bg-linear-to-br from-card to-card/50 border-muted/50 shadow-sm">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Average Spend</p>
                    <p className="text-3xl font-bold">₹{stats.averageSpend.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="p-3 bg-emerald-500/10 rounded-xl">
                    <CreditCard className="h-5 w-5 text-emerald-500" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-muted-foreground">
                  Lifetime value per user
                </div>
              </CardContent>
            </Card>

            <Card className="bg-linear-to-br from-card to-card/50 border-muted/50 shadow-sm">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Suspended</p>
                    <p className="text-3xl font-bold">{stats.suspended}</p>
                  </div>
                  <div className="p-3 bg-red-500/10 rounded-xl">
                    <Ban className="h-5 w-5 text-red-500" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-red-500 font-medium">
                  Requires attention
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Main Content Area */}
      <div className="rounded-2xl border bg-card/40 shadow-sm backdrop-blur-xl overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/10">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search customers by name or email..." className="w-full pl-9 bg-background border-muted-foreground/20 rounded-full h-10" />
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
            <div className="flex p-1 bg-muted/50 rounded-full">
              {['all', 'active', 'suspended'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${
                    activeTab === tab 
                      ? "bg-background text-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm" className="h-9 rounded-full border-muted-foreground/20">
              <Filter className="mr-2 h-4 w-4" /> Filters
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold h-12">Customer Info</TableHead>
                <TableHead className="font-semibold h-12">Total Bookings</TableHead>
                <TableHead className="font-semibold h-12">Lifetime Spend</TableHead>
                <TableHead className="font-semibold h-12">Status</TableHead>
                <TableHead className="font-semibold h-12">Joined Date</TableHead>
                <TableHead className="text-right font-semibold h-12">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <TableRow key={idx} className="hover:bg-transparent">
                    <TableCell className="py-4">
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex flex-col space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-40" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-12" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <Skeleton className="h-8 w-8 rounded-md" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    No customers found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer) => (
                  <TableRow key={customer.id} className="group hover:bg-muted/20 transition-colors">
                    <TableCell className="py-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${customer.name}&backgroundColor=0B1120`} alt={customer.name} />
                          <AvatarFallback className="bg-primary/10 text-primary font-medium">{customer.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground group-hover:text-primary transition-colors">{customer.name}</span>
                          <span className="text-xs text-muted-foreground mt-0.5">{customer.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 font-medium text-foreground">
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        {customer.bookings}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-foreground">{customer.totalSpent}</span>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={customer.status === 'active' ? 'default' : 'destructive'}
                        className={`
                          px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider
                          ${customer.status === 'active' && 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20'}
                          ${customer.status === 'suspended' && 'bg-red-500/10 text-red-600 hover:bg-red-500/20 border-red-500/20'}
                        `}
                      >
                        {customer.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(customer.joined).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0 opacity-0 group-hover:opacity-100">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 rounded-xl border-muted/50">
                          <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">Actions</DropdownMenuLabel>
                          <DropdownMenuItem className="cursor-pointer rounded-md">
                            <Mail className="mr-2 h-4 w-4" /> Email Customer
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {customer.status === 'active' ? (
                            <DropdownMenuItem className="text-orange-600 focus:text-orange-600 cursor-pointer rounded-md">
                              <Ban className="mr-2 h-4 w-4" /> Suspend User
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem className="text-emerald-600 focus:text-emerald-600 cursor-pointer rounded-md">
                              <Ban className="mr-2 h-4 w-4" /> Reactivate User
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination/Footer */}
        <div className="p-4 border-t border-muted/30 bg-muted/5 flex items-center justify-between text-sm text-muted-foreground">
          <span>Showing 1 to {filteredCustomers.length} of {stats.totalCustomers} customers</span>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" className="rounded-full h-8 px-4" disabled>Previous</Button>
            <Button variant="outline" size="sm" className="rounded-full h-8 px-4">Next</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
