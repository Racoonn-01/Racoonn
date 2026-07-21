"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MapPin, BedDouble, Image as ImageIcon, Star, Filter, TrendingUp, Building2, Eye, PenLine } from "lucide-react"

export interface PropertyData {
  id: string;
  name: string;
  vendor: string;
  location: string;
  type: string;
  price: string;
  rating: number;
  status: string;
  rooms: number | string;
  imageUrl?: string;
}

export interface PropertiesKPI {
  totalActiveProperties: number;
  newActiveThisWeek: number;
  pendingReview: number;
  avgRating: string;
  totalReviews: number;
}

interface PropertiesClientProps {
  properties: PropertyData[];
  kpi: PropertiesKPI;
}

export default function PropertiesClient({ properties, kpi }: PropertiesClientProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProperties = properties.filter(property => 
    property.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    property.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    property.vendor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-foreground">Property Management</h2>
          <p className="text-muted-foreground mt-1 text-lg">Review, approve, and manage all listed properties across your platform.</p>
        </div>
        <Button className="h-11 px-6 rounded-full shadow-lg hover:shadow-xl transition-all">
          <Building2 className="mr-2 h-5 w-5" /> Add New Property
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-linear-to-br from-card to-card/50 border-muted/50 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total Active Properties</p>
                <p className="text-3xl font-bold">{kpi.totalActiveProperties}</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <Building2 className="h-5 w-5 text-blue-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-emerald-500 font-medium">
              <TrendingUp className="mr-1 h-4 w-4" /> +{kpi.newActiveThisWeek} new this week
            </div>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-card to-card/50 border-muted/50 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                <p className="text-3xl font-bold">{kpi.pendingReview}</p>
              </div>
              <div className="p-3 bg-amber-500/10 rounded-xl">
                <Eye className="h-5 w-5 text-amber-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-amber-500 font-medium">
              Awaiting your approval
            </div>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-card to-card/50 border-muted/50 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Avg. Property Rating</p>
                <p className="text-3xl font-bold">{kpi.avgRating}</p>
              </div>
              <div className="p-3 bg-yellow-500/10 rounded-xl">
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-muted-foreground">
              Based on {kpi.totalReviews}+ reviews
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-2xl border bg-card/40 shadow-sm backdrop-blur-xl p-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search properties by name or location..." 
              className="w-full pl-9 bg-background border-muted-foreground/20 rounded-full h-11"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              suppressHydrationWarning
            />
          </div>
          
          <div className="flex gap-3 w-full sm:w-auto">
            <Button variant="outline" className="flex-1 sm:flex-none h-11 rounded-full border-muted-foreground/20">
              Status <Filter className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" className="flex-1 sm:flex-none h-11 rounded-full border-muted-foreground/20">
              Type <Filter className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProperties.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              No properties found matching your search.
            </div>
          )}
          {filteredProperties.map((property) => (
            <Card key={property.id} className="overflow-hidden bg-card/60 backdrop-blur-md border-muted/30 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col">
              <div className="h-48 bg-muted relative flex items-center justify-center overflow-hidden">
                {property.imageUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={property.imageUrl} alt={property.name} className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="h-12 w-12 text-muted-foreground opacity-30" />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-80" />
                
                <Badge 
                  className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md ${
                    property.status.toLowerCase() === 'active' || property.status.toLowerCase() === 'approved' ? 'bg-emerald-500/90 text-white' : 
                    property.status.toLowerCase() === 'pending' ? 'bg-amber-500/90 text-white' : 
                    'bg-red-500/90 text-white'
                  }`}
                >
                  {property.status}
                </Badge>
                
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-white font-bold text-lg leading-tight line-clamp-1 shadow-black/50 drop-shadow-md">
                    {property.name}
                  </h3>
                  <div className="flex items-center text-white/80 text-sm mt-1">
                    <MapPin className="h-3.5 w-3.5 mr-1" />
                    <span className="truncate">{property.location}</span>
                  </div>
                </div>
              </div>
              
              <CardContent className="p-5 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-muted-foreground/10">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Vendor</span>
                      <span className="font-medium text-sm text-foreground truncate max-w-30" title={property.vendor}>{property.vendor}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center bg-yellow-500/10 text-yellow-600 px-2 py-0.5 rounded-full text-xs font-bold">
                        <Star className="h-3 w-3 mr-1 fill-yellow-600" /> {property.rating > 0 ? property.rating : 'New'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col p-2 bg-muted/30 rounded-lg">
                      <span className="text-xs text-muted-foreground mb-1">Price</span>
                      <span className="font-semibold text-sm">{property.price}</span>
                    </div>
                    <div className="flex flex-col p-2 bg-muted/30 rounded-lg">
                      <span className="text-xs text-muted-foreground mb-1">Rooms</span>
                      <span className="font-semibold text-sm flex items-center"><BedDouble className="h-3.5 w-3.5 mr-1 text-muted-foreground"/> {property.rooms}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="p-5 pt-4 mt-auto border-t border-muted-foreground/10">
                <div className="grid grid-cols-2 gap-2 w-full">
                  <Link href={`/admin/properties/${property.id}`} className="w-full">
                    <Button 
                      className="w-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors" 
                      variant="ghost"
                    >
                      <Eye className="mr-2 h-4 w-4" /> View
                    </Button>
                  </Link>
                  <Link href={`/admin/properties/${property.id}/edit`} className="w-full">
                    <Button 
                      className="w-full text-muted-foreground hover:text-foreground" 
                      variant="outline"
                    >
                      <PenLine className="mr-2 h-4 w-4" /> Edit
                    </Button>
                  </Link>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
