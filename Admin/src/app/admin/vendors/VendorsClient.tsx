"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Search, 
  MoreHorizontal, 
  UserX, 
  UserCheck, 
  Trash2, 
  Eye, 
  Building2, 
  Users, 
  DollarSign, 
  TrendingUp,
  Filter,
  Plus
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuGroup } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export interface VendorData {
  id: string;
  name: string;
  email: string;
  properties: number;
  revenue: string;
  status: string;
  joined: string;
}

export interface VendorsKPI {
  totalVendors: number;
  activeProperties: number;
  totalPayouts: string;
  pendingApproval: number;
  newVendorsThisWeek: number;
  newPropertiesThisWeek: number;
}

interface VendorsClientProps {
  vendors: VendorData[];
  kpi: VendorsKPI;
}

export default function VendorsClient({ vendors: initialVendors, kpi }: VendorsClientProps) {
  const [vendors, setVendors] = useState<VendorData[]>(initialVendors);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVendor, setSelectedVendor] = useState<VendorData | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const filteredVendors = vendors.filter(vendor => {
    const matchesTab = activeTab === "all" || vendor.status.toLowerCase() === activeTab.toLowerCase();
    const matchesSearch = vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          vendor.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleUpdateStatus = async (vendorId: string, newStatus: string) => {
    try {
      setIsUpdating(true);
      const res = await fetch(`/api/vendors/${vendorId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!res.ok) {
        throw new Error("Failed to update status");
      }
      
      // Update local state
      setVendors(prev => prev.map(v => 
        v.id === vendorId ? { ...v, status: newStatus } : v
      ));

      if (selectedVendor && selectedVendor.id === vendorId) {
        setSelectedVendor({ ...selectedVendor, status: newStatus });
      }
      
    } catch (error) {
      console.error(error);
      alert("Error updating vendor status");
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'active' || s === 'approved') return { variant: 'default' as const, classes: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' };
    if (s === 'suspended' || s === 'blocked') return { variant: 'destructive' as const, classes: 'bg-red-500/10 text-red-600 border-red-500/20' };
    return { variant: 'secondary' as const, classes: 'bg-amber-500/10 text-amber-600 border-amber-500/20' };
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-foreground">Vendor Management</h2>
          <p className="text-muted-foreground mt-1 text-lg">Oversee all your partners, properties, and revenue shares.</p>
        </div>
        <Button className="h-11 px-6 rounded-full shadow-lg hover:shadow-xl transition-all">
          <Plus className="mr-2 h-5 w-5" /> Invite New Vendor
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-linear-to-br from-card to-card/50 border-muted/50 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total Vendors</p>
                <p className="text-3xl font-bold">{kpi.totalVendors}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-xl">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-emerald-500 font-medium">
              <TrendingUp className="mr-1 h-4 w-4" /> +{kpi.newVendorsThisWeek} this week
            </div>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-card to-card/50 border-muted/50 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Active Properties</p>
                <p className="text-3xl font-bold">{kpi.activeProperties}</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <Building2 className="h-5 w-5 text-blue-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-emerald-500 font-medium">
              <TrendingUp className="mr-1 h-4 w-4" /> +{kpi.newPropertiesThisWeek} new this week
            </div>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-card to-card/50 border-muted/50 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total Revenue (YTD)</p>
                <p className="text-3xl font-bold">{kpi.totalPayouts}</p>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-xl">
                <DollarSign className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-muted-foreground">
              Across all vendors
            </div>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-card to-card/50 border-muted/50 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Pending Approval</p>
                <p className="text-3xl font-bold">{kpi.pendingApproval}</p>
              </div>
              <div className="p-3 bg-amber-500/10 rounded-xl">
                <UserCheck className="h-5 w-5 text-amber-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-amber-500 font-medium">
              Requires your attention
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="rounded-2xl border bg-card/40 shadow-sm backdrop-blur-xl overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/10">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search vendors by name or email..." 
                className="w-full pl-9 bg-background border-muted-foreground/20 rounded-full h-10" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                suppressHydrationWarning
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
            <div className="flex p-1 bg-muted/50 rounded-full">
              {['all', 'active', 'pending', 'suspended'].map((tab) => (
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
                <TableHead className="font-semibold h-12">Vendor Info</TableHead>
                <TableHead className="font-semibold h-12">Properties</TableHead>
                <TableHead className="font-semibold h-12">Revenue (YTD)</TableHead>
                <TableHead className="font-semibold h-12">Status</TableHead>
                <TableHead className="font-semibold h-12">Joined Date</TableHead>
                <TableHead className="text-right font-semibold h-12">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVendors.map((vendor) => {
                const badgeStyle = getStatusBadge(vendor.status);
                return (
                  <TableRow key={vendor.id} className="group hover:bg-muted/20 transition-colors">
                    <TableCell className="py-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${vendor.name}&backgroundColor=E86A70`} alt={vendor.name} />
                          <AvatarFallback className="bg-primary/10 text-primary font-medium">{vendor.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground group-hover:text-primary transition-colors">{vendor.name}</span>
                          <span className="text-xs text-muted-foreground mt-0.5">{vendor.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 font-medium text-foreground">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        {vendor.properties}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-foreground">{vendor.revenue}</span>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={badgeStyle.variant}
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${badgeStyle.classes}`}
                      >
                        {vendor.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(vendor.joined).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0 opacity-0 group-hover:opacity-100">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 rounded-xl border-muted/50">
                          <DropdownMenuGroup>
                            <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">Actions</DropdownMenuLabel>
                            <DropdownMenuItem className="cursor-pointer rounded-md" onClick={() => setSelectedVendor(vendor)}>
                              <Eye className="mr-2 h-4 w-4" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {vendor.status.toLowerCase() === 'active' || vendor.status.toLowerCase() === 'approved' ? (
                              <DropdownMenuItem 
                                className="text-orange-600 focus:text-orange-600 cursor-pointer rounded-md"
                                onClick={() => handleUpdateStatus(vendor.id, 'Suspended')}
                                disabled={isUpdating}
                              >
                                <UserX className="mr-2 h-4 w-4" /> Suspend Vendor
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem 
                                className="text-emerald-600 focus:text-emerald-600 cursor-pointer rounded-md"
                                onClick={() => handleUpdateStatus(vendor.id, 'Approved')}
                                disabled={isUpdating}
                              >
                                <UserCheck className="mr-2 h-4 w-4" /> Activate Vendor
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600 focus:text-red-600 cursor-pointer rounded-md">
                              <Trash2 className="mr-2 h-4 w-4" /> Delete Vendor
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination/Footer */}
        <div className="p-4 border-t border-muted/30 bg-muted/5 flex items-center justify-between text-sm text-muted-foreground">
          <span>Showing 1 to {Math.min(filteredVendors.length, 100)} of {vendors.length} vendors</span>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" className="rounded-full h-8 px-4" disabled>Previous</Button>
            <Button variant="outline" size="sm" className="rounded-full h-8 px-4">Next</Button>
          </div>
        </div>
      </div>

      {/* Vendor Details Modal */}
      <Dialog open={!!selectedVendor} onOpenChange={(open) => !open && setSelectedVendor(null)}>
        <DialogContent className="sm:max-w-md">
          {selectedVendor && (
            <>
              <DialogHeader>
                <DialogTitle>Vendor Details</DialogTitle>
                <DialogDescription>
                  Manage {selectedVendor.name}&apos;s account and status.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${selectedVendor.name}&backgroundColor=E86A70`} />
                    <AvatarFallback>{selectedVendor.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{selectedVendor.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedVendor.email}</p>
                    <Badge 
                      variant={getStatusBadge(selectedVendor.status).variant}
                      className={`mt-2 ${getStatusBadge(selectedVendor.status).classes}`}
                    >
                      {selectedVendor.status}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/30 p-3 rounded-xl">
                    <p className="text-xs text-muted-foreground mb-1">Properties</p>
                    <p className="font-semibold">{selectedVendor.properties}</p>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-xl">
                    <p className="text-xs text-muted-foreground mb-1">Revenue</p>
                    <p className="font-semibold">{selectedVendor.revenue}</p>
                  </div>
                </div>

                <div className="space-y-3 mt-4">
                  <h4 className="text-sm font-medium">Update Status</h4>
                  <Select 
                    value={selectedVendor.status} 
                    onValueChange={(val) => handleUpdateStatus(selectedVendor.id, val || "Pending")}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Approved">Approved / Active</SelectItem>
                      <SelectItem value="Suspended">Suspended</SelectItem>
                      <SelectItem value="Blocked">Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                  {isUpdating && <p className="text-xs text-muted-foreground animate-pulse">Updating status...</p>}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
