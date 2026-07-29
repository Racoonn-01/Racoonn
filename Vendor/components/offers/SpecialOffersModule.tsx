"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  Sparkles, Percent, Tag, Calendar, Clock, 
  Search, Plus, Copy, MoreVertical, Edit3, Trash2, PauseCircle, 
  PlayCircle, Layers, TrendingUp, IndianRupee, 
  Gift, Zap, Sun, Award, ChevronRight
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

export type OfferType = 
  | "percentage" 
  | "flat" 
  | "coupon" 
  | "early_bird" 
  | "last_minute" 
  | "stay_x_pay_y" 
  | "weekly" 
  | "monthly" 
  | "seasonal" 
  | "festival";

export type OfferStatus = "active" | "scheduled" | "paused" | "expired";

export interface SpecialOffer {
  id: string;
  name: string;
  type: OfferType;
  code?: string;
  description: string;
  discountType: "percentage" | "flat" | "stay_x_pay_y";
  discountValue: number;
  stayX?: number;
  payY?: number;
  propertyId: string;
  propertyName: string;
  roomId: string;
  roomName: string;
  bookingStartDate: string;
  bookingEndDate: string;
  stayStartDate: string;
  stayEndDate: string;
  minStayNights: number;
  maxStayNights?: number;
  minBookingValue?: number;
  maxRedemptions?: number;
  applicableDays: string[];
  status: OfferStatus;
  isPublic: boolean;
  redemptions: number;
  revenueGenerated: number;
  bookingsCount: number;
  conversionRate: number;
  createdAt: string;
}

const ALL_WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const OFFER_TYPE_CONFIG: Record<OfferType, { label: string; icon: any; color: string; bg: string; badgeBg: string }> = {
  percentage: { label: "Percentage Discount", icon: Percent, color: "text-rose-500", bg: "bg-rose-500/10", badgeBg: "bg-rose-50 text-rose-700 border-rose-200" },
  flat: { label: "Flat Discount", icon: IndianRupee, color: "text-emerald-500", bg: "bg-emerald-500/10", badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  coupon: { label: "Coupon Code", icon: Tag, color: "text-violet-500", bg: "bg-violet-500/10", badgeBg: "bg-violet-50 text-violet-700 border-violet-200" },
  early_bird: { label: "Early Bird Offer", icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10", badgeBg: "bg-amber-50 text-amber-700 border-amber-200" },
  last_minute: { label: "Last Minute Deal", icon: Clock, color: "text-orange-500", bg: "bg-orange-500/10", badgeBg: "bg-orange-50 text-orange-700 border-orange-200" },
  stay_x_pay_y: { label: "Stay X Pay Y", icon: Gift, color: "text-sky-500", bg: "bg-sky-500/10", badgeBg: "bg-sky-50 text-sky-700 border-sky-200" },
  weekly: { label: "Weekly Stay Offer", icon: Calendar, color: "text-blue-500", bg: "bg-blue-500/10", badgeBg: "bg-blue-50 text-blue-700 border-blue-200" },
  monthly: { label: "Long Stay Monthly", icon: Sun, color: "text-indigo-500", bg: "bg-indigo-500/10", badgeBg: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  seasonal: { label: "Seasonal Special", icon: Sparkles, color: "text-pink-500", bg: "bg-pink-500/10", badgeBg: "bg-pink-50 text-pink-700 border-pink-200" },
  festival: { label: "Festival Promotion", icon: Award, color: "text-purple-500", bg: "bg-purple-500/10", badgeBg: "bg-purple-50 text-purple-700 border-purple-200" },
};

interface SpecialOffersModuleProps {
  rooms?: any[];
  properties?: any[];
}

export function SpecialOffersModule({ rooms = [], properties = [] }: SpecialOffersModuleProps) {
  const { user } = useAuthStore();
  const [offers, setOffers] = useState<SpecialOffer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [selectedOfferIds, setSelectedOfferIds] = useState<string[]>([]);

  // Dialog States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<SpecialOffer | null>(null);

  // Form Fields State
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<OfferType>("percentage");
  const [formCode, setFormCode] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formDiscountType, setFormDiscountType] = useState<"percentage" | "flat" | "stay_x_pay_y">("percentage");
  const [formDiscountValue, setFormDiscountValue] = useState("");
  const [formStayX, setFormStayX] = useState("3");
  const [formPayY, setFormPayY] = useState("2");
  const [formPropertyId, setFormPropertyId] = useState("all");
  const [formRoomId, setFormRoomId] = useState("all");
  const [formBookingStartDate, setFormBookingStartDate] = useState("");
  const [formBookingEndDate, setFormBookingEndDate] = useState("");
  const [formStayStartDate, setFormStayStartDate] = useState("");
  const [formStayEndDate, setFormStayEndDate] = useState("");
  const [formMinStayNights, setFormMinStayNights] = useState("1");
  const [formMaxStayNights, setFormMaxStayNights] = useState("");
  const [formMinBookingValue, setFormMinBookingValue] = useState("");
  const [formMaxRedemptions, setFormMaxRedemptions] = useState("");
  const [formApplicableDays, setFormApplicableDays] = useState<string[]>(ALL_WEEKDAYS);
  const [formIsPublic, setFormIsPublic] = useState(true);

  const saveOffers = useCallback((updated: SpecialOffer[]) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const evaluatedOffers = updated.map(offer => {
      let currentStatus: OfferStatus = offer.status;
      if (currentStatus !== "paused") {
        if (offer.bookingEndDate && offer.bookingEndDate < todayStr) {
          currentStatus = "expired";
        } else if (offer.bookingStartDate && offer.bookingStartDate > todayStr) {
          currentStatus = "scheduled";
        } else {
          currentStatus = "active";
        }
      }
      return { ...offer, status: currentStatus };
    });

    setOffers(evaluatedOffers);
    if (user?.$id) {
      localStorage.setItem(`racoonn_special_offers_full_${user.$id}`, JSON.stringify(evaluatedOffers));
    }
    try {
      const existingGlobal = JSON.parse(localStorage.getItem('racoonn_global_vendor_coupons') || '[]');
      const otherOffers = Array.isArray(existingGlobal) ? existingGlobal.filter((o: any) => o.vendorId && o.vendorId !== user?.$id) : [];
      const currentVendorOffers = evaluatedOffers.map(o => ({ ...o, vendorId: user?.$id }));
      localStorage.setItem('racoonn_global_vendor_coupons', JSON.stringify([...otherOffers, ...currentVendorOffers]));
    } catch (err) {
      console.warn("Could not sync global vendor coupons:", err);
    }

    // Set cross-port cookies for every offer code
    try {
      if (typeof document !== 'undefined') {
        evaluatedOffers.forEach(offer => {
          if (offer.code) {
            const cleanCode = offer.code.trim().toUpperCase();
            const cookieData = {
              code: cleanCode,
              discountType: offer.discountType,
              discountValue: offer.discountValue,
              status: offer.status,
              bookingStartDate: offer.bookingStartDate,
              bookingEndDate: offer.bookingEndDate,
              propertyId: offer.propertyId,
              propertyName: offer.propertyName,
              roomId: offer.roomId,
              roomName: offer.roomName
            };
            document.cookie = `racoonn_coupon_${cleanCode}=${encodeURIComponent(JSON.stringify(cookieData))}; path=/; max-age=31536000; SameSite=Lax`;
          }
        });
      }
    } catch (cookieErr) {
      console.warn("Could not write coupon cookie:", cookieErr);
    }
  }, [user]);

  // Load real-time offers from localStorage for active user & auto-update expired status
  useEffect(() => {
    if (!user?.$id) return;
    try {
      const stored = localStorage.getItem(`racoonn_special_offers_full_${user.$id}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        const todayStr = new Date().toISOString().split('T')[0];
        // Filter out old legacy sample offers and update validity status
        const realOffers = parsed
          .filter((o: SpecialOffer) => !["off-1", "off-2", "off-3", "off-4"].includes(o.id))
          .map((o: SpecialOffer) => {
            if (o.status !== "paused") {
              if (o.bookingEndDate && o.bookingEndDate < todayStr) {
                return { ...o, status: "expired" as OfferStatus };
              } else if (o.bookingStartDate && o.bookingStartDate > todayStr) {
                return { ...o, status: "scheduled" as OfferStatus };
              } else {
                return { ...o, status: "active" as OfferStatus };
              }
            }
            return o;
          });
        
        saveOffers(realOffers);
      } else {
        setOffers([]);
      }
    } catch {
      setOffers([]);
    }
  }, [user, saveOffers]);

  // Filtered offers
  const filteredOffers = useMemo(() => {
    return offers.filter(offer => {
      const matchesSearch = 
        offer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (offer.code && offer.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
        offer.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offer.roomName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || offer.status === statusFilter;
      const matchesType = typeFilter === "all" || offer.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [offers, searchQuery, statusFilter, typeFilter]);

  // Analytics Metrics
  const metrics = useMemo(() => {
    const activeCount = offers.filter(o => o.status === "active").length;
    const totalRevenue = offers.reduce((sum, o) => sum + o.revenueGenerated, 0);
    const totalRedemptions = offers.reduce((sum, o) => sum + o.redemptions, 0);
    const avgConversion = offers.length > 0 
      ? (offers.reduce((sum, o) => sum + o.conversionRate, 0) / offers.length).toFixed(1)
      : "0";

    return { activeCount, totalRevenue, totalRedemptions, avgConversion };
  }, [offers]);

  // Reset Form
  const resetForm = () => {
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

    setEditingOffer(null);
    setFormName("");
    setFormType("percentage");
    setFormCode("");
    setFormDescription("");
    setFormDiscountType("percentage");
    setFormDiscountValue("15");
    setFormStayX("3");
    setFormPayY("2");
    setFormPropertyId("all");
    setFormRoomId("all");
    setFormBookingStartDate(today);
    setFormBookingEndDate(nextMonth);
    setFormStayStartDate(today);
    setFormStayEndDate(nextMonth);
    setFormMinStayNights("1");
    setFormMaxStayNights("");
    setFormMinBookingValue("");
    setFormMaxRedemptions("100");
    setFormApplicableDays(ALL_WEEKDAYS);
    setFormIsPublic(true);
  };

  // Open Create Dialog
  const handleOpenCreate = (preset?: Partial<SpecialOffer>) => {
    resetForm();
    if (preset) {
      if (preset.name) setFormName(preset.name);
      if (preset.type) setFormType(preset.type);
      if (preset.code) setFormCode(preset.code);
      if (preset.discountType) setFormDiscountType(preset.discountType);
      if (preset.discountValue) setFormDiscountValue(preset.discountValue.toString());
      if (preset.description) setFormDescription(preset.description);
    }
    setIsDialogOpen(true);
  };

  // Open Edit Dialog
  const handleOpenEdit = (offer: SpecialOffer) => {
    setEditingOffer(offer);
    setFormName(offer.name);
    setFormType(offer.type);
    setFormCode(offer.code || "");
    setFormDescription(offer.description);
    setFormDiscountType(offer.discountType);
    setFormDiscountValue(offer.discountValue.toString());
    setFormStayX(offer.stayX ? offer.stayX.toString() : "3");
    setFormPayY(offer.payY ? offer.payY.toString() : "2");
    setFormPropertyId(offer.propertyId);
    setFormRoomId(offer.roomId);
    setFormBookingStartDate(offer.bookingStartDate);
    setFormBookingEndDate(offer.bookingEndDate);
    setFormStayStartDate(offer.stayStartDate);
    setFormStayEndDate(offer.stayEndDate);
    setFormMinStayNights(offer.minStayNights.toString());
    setFormMaxStayNights(offer.maxStayNights ? offer.maxStayNights.toString() : "");
    setFormMinBookingValue(offer.minBookingValue ? offer.minBookingValue.toString() : "");
    setFormMaxRedemptions(offer.maxRedemptions ? offer.maxRedemptions.toString() : "");
    setFormApplicableDays(offer.applicableDays || ALL_WEEKDAYS);
    setFormIsPublic(offer.isPublic);
    setIsDialogOpen(true);
  };

  // Save / Update Offer Handler
  const handleSaveOffer = () => {
    if (!formName.trim()) {
      toast.error("Please enter an offer name.");
      return;
    }
    if (!formDiscountValue && formDiscountType !== "stay_x_pay_y") {
      toast.error("Please enter a discount value.");
      return;
    }

    const propObj = properties.find(p => p.$id === formPropertyId);
    const roomObj = rooms.find(r => r.$id === formRoomId);

    const propertyName = formPropertyId === "all" ? "All Properties" : (propObj?.propertyName || propObj?.name || "Selected Property");
    const roomName = formRoomId === "all" ? "All Rooms" : (roomObj?.name || "Selected Room");

    // Compute status based on booking dates
    const todayStr = new Date().toISOString().split('T')[0];
    let calculatedStatus: OfferStatus = "active";
    if (formBookingStartDate > todayStr) calculatedStatus = "scheduled";
    if (formBookingEndDate < todayStr) calculatedStatus = "expired";

    if (editingOffer) {
      const updatedList = offers.map(o => o.id === editingOffer.id ? {
        ...o,
        name: formName.trim(),
        type: formType,
        code: formCode.trim().toUpperCase() || undefined,
        description: formDescription,
        discountType: formDiscountType,
        discountValue: parseFloat(formDiscountValue) || 0,
        stayX: parseInt(formStayX) || undefined,
        payY: parseInt(formPayY) || undefined,
        propertyId: formPropertyId,
        propertyName,
        roomId: formRoomId,
        roomName,
        bookingStartDate: formBookingStartDate,
        bookingEndDate: formBookingEndDate,
        stayStartDate: formStayStartDate,
        stayEndDate: formStayEndDate,
        minStayNights: parseInt(formMinStayNights) || 1,
        maxStayNights: formMaxStayNights ? parseInt(formMaxStayNights) : undefined,
        minBookingValue: formMinBookingValue ? parseFloat(formMinBookingValue) : undefined,
        maxRedemptions: formMaxRedemptions ? parseInt(formMaxRedemptions) : undefined,
        applicableDays: formApplicableDays,
        isPublic: formIsPublic,
        status: (o.status === "paused" ? "paused" : calculatedStatus) as OfferStatus
      } : o);

      saveOffers(updatedList);
      toast.success("Offer updated successfully!");
    } else {
      const newOffer: SpecialOffer = {
        id: `off-${Date.now()}`,
        name: formName.trim(),
        type: formType,
        code: formCode.trim().toUpperCase() || undefined,
        description: formDescription || `Special ${formType} promotion`,
        discountType: formDiscountType,
        discountValue: parseFloat(formDiscountValue) || 0,
        stayX: parseInt(formStayX) || undefined,
        payY: parseInt(formPayY) || undefined,
        propertyId: formPropertyId,
        propertyName,
        roomId: formRoomId,
        roomName,
        bookingStartDate: formBookingStartDate,
        bookingEndDate: formBookingEndDate,
        stayStartDate: formStayStartDate,
        stayEndDate: formStayEndDate,
        minStayNights: parseInt(formMinStayNights) || 1,
        maxStayNights: formMaxStayNights ? parseInt(formMaxStayNights) : undefined,
        minBookingValue: formMinBookingValue ? parseFloat(formMinBookingValue) : undefined,
        maxRedemptions: formMaxRedemptions ? parseInt(formMaxRedemptions) : undefined,
        applicableDays: formApplicableDays,
        status: calculatedStatus as OfferStatus,
        isPublic: formIsPublic,
        redemptions: 0,
        revenueGenerated: 0,
        bookingsCount: 0,
        conversionRate: 0,
        createdAt: new Date().toISOString()
      };

      saveOffers([newOffer, ...offers]);
      toast.success("Special offer created successfully!");
    }

    setIsDialogOpen(false);
  };

  // Toggle Pause/Resume
  const handleToggleStatus = (offerId: string) => {
    const updated = offers.map(o => {
      if (o.id === offerId) {
        const nextStatus: OfferStatus = o.status === "paused" ? "active" : "paused";
        toast.info(`Offer "${o.name}" is now ${nextStatus}`);
        return { ...o, status: nextStatus };
      }
      return o;
    });
    saveOffers(updated);
  };

  // Duplicate Offer
  const handleDuplicateOffer = (offer: SpecialOffer) => {
    const dup: SpecialOffer = {
      ...offer,
      id: `off-${Date.now()}`,
      name: `${offer.name} (Copy)`,
      code: offer.code ? `${offer.code}_COPY` : undefined,
      redemptions: 0,
      revenueGenerated: 0,
      bookingsCount: 0,
      createdAt: new Date().toISOString()
    };
    saveOffers([dup, ...offers]);
    toast.success(`Duplicated offer "${offer.name}"`);
  };

  // Delete Offer
  const handleDeleteOffer = (offerId: string) => {
    saveOffers(offers.filter(o => o.id !== offerId));
    toast.info("Offer deleted.");
  };

  // Bulk Actions
  const handleBulkAction = (action: "pause" | "resume" | "delete") => {
    if (selectedOfferIds.length === 0) return;

    if (action === "delete") {
      saveOffers(offers.filter(o => !selectedOfferIds.includes(o.id)));
      toast.success(`Deleted ${selectedOfferIds.length} offers`);
    } else if (action === "pause") {
      saveOffers(offers.map(o => selectedOfferIds.includes(o.id) ? { ...o, status: "paused" as OfferStatus } : o));
      toast.info(`Paused ${selectedOfferIds.length} offers`);
    } else if (action === "resume") {
      saveOffers(offers.map(o => selectedOfferIds.includes(o.id) ? { ...o, status: "active" as OfferStatus } : o));
      toast.success(`Resumed ${selectedOfferIds.length} offers`);
    }

    setSelectedOfferIds([]);
  };

  // Copy Promo Code to Clipboard
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Copied promo code "${code}" to clipboard!`);
  };

  return (
    <div className="space-y-6">
      {/* 1. ANALYTICS METRICS HEADER */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm ring-1 ring-slate-100 rounded-2xl bg-white p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Offers</p>
            <h3 className="text-2xl font-black font-heading text-secondary">{metrics.activeCount}</h3>
          </div>
        </Card>

        <Card className="border-0 shadow-sm ring-1 ring-slate-100 rounded-2xl bg-white p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Offer Revenue</p>
            <h3 className="text-2xl font-black font-heading text-secondary">₹{metrics.totalRevenue.toLocaleString('en-IN')}</h3>
          </div>
        </Card>

        <Card className="border-0 shadow-sm ring-1 ring-slate-100 rounded-2xl bg-white p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-violet-50 flex items-center justify-center text-violet-500">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Redemptions</p>
            <h3 className="text-2xl font-black font-heading text-secondary">{metrics.totalRedemptions}</h3>
          </div>
        </Card>

        <Card className="border-0 shadow-sm ring-1 ring-slate-100 rounded-2xl bg-white p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-500">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Avg. Conv. Boost</p>
            <h3 className="text-2xl font-black font-heading text-secondary">+{metrics.avgConversion}%</h3>
          </div>
        </Card>
      </div>

      {/* 2. CONTROLS & FILTER BAR */}
      <Card className="border-0 shadow-xl shadow-slate-200/40 ring-1 ring-slate-100 rounded-3xl overflow-hidden bg-white">
        <CardHeader className="bg-linear-to-b from-slate-50 to-white border-b border-slate-100 pb-5 pt-7 px-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="font-heading text-2xl font-black text-secondary flex items-center gap-2">
              <Percent className="w-6 h-6 text-[#E86A70]" /> Special Offers & Promotions
            </CardTitle>
            <CardDescription className="text-slate-500 font-medium mt-1">
              Create campaigns, promo codes, and stay discounts to maximize occupancy.
            </CardDescription>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              onClick={() => handleOpenCreate()}
              className="bg-[#E86A70] hover:bg-[#E86A70]/90 text-white rounded-2xl h-12 px-6 font-bold shadow-lg shadow-[#E86A70]/30 transition-all hover:-translate-y-0.5 cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-5 h-5" /> Create Offer
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="Search offer or promo code..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 rounded-xl bg-slate-50/50 border-slate-200 text-sm font-medium"
                />
              </div>

              <Select value={statusFilter} onValueChange={(val) => val && setStatusFilter(val)}>
                <SelectTrigger className="w-36 h-10 rounded-xl bg-slate-50/50 border-slate-200 text-xs font-bold">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={(val) => val && setTypeFilter(val)}>
                <SelectTrigger className="w-44 h-10 rounded-xl bg-slate-50/50 border-slate-200 text-xs font-bold">
                  <SelectValue placeholder="All Offer Types" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.entries(OFFER_TYPE_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              {selectedOfferIds.length > 0 && (
                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl mr-2">
                  <Button variant="ghost" size="sm" onClick={() => handleBulkAction("pause")} className="h-8 text-xs font-bold text-slate-700">Pause ({selectedOfferIds.length})</Button>
                  <Button variant="ghost" size="sm" onClick={() => handleBulkAction("resume")} className="h-8 text-xs font-bold text-emerald-600">Resume ({selectedOfferIds.length})</Button>
                  <Button variant="ghost" size="sm" onClick={() => handleBulkAction("delete")} className="h-8 text-xs font-bold text-rose-600">Delete ({selectedOfferIds.length})</Button>
                </div>
              )}

              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setViewMode("table")}
                  className={`h-8 px-3 rounded-lg text-xs font-bold transition-all ${viewMode === "table" ? "bg-white text-secondary shadow-xs" : "text-slate-500"}`}
                >
                  Table
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setViewMode("grid")}
                  className={`h-8 px-3 rounded-lg text-xs font-bold transition-all ${viewMode === "grid" ? "bg-white text-secondary shadow-xs" : "text-slate-500"}`}
                >
                  Cards
                </Button>
              </div>
            </div>
          </div>

          {/* 3. OFFERS LIST / TABLE */}
          {filteredOffers.length === 0 ? (
            <div className="p-12 rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-white shadow-sm ring-1 ring-slate-100 text-[#E86A70] mx-auto flex items-center justify-center">
                <Percent className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto">
                <h4 className="font-black text-xl text-secondary mb-1">No offers found</h4>
                <p className="text-slate-500 text-sm font-medium">Create a custom offer or choose from one of our high-converting presets below.</p>
              </div>

              {/* QUICK CREATION PRESETS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-3xl mx-auto pt-4 text-left">
                <button 
                  onClick={() => handleOpenCreate({ name: "Early Bird 15% OFF", type: "early_bird", discountType: "percentage", discountValue: 15, description: "Book 14 days in advance to get 15% discount." })}
                  className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-[#E86A70] shadow-sm transition-all hover:-translate-y-1 cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">⚡ Advance</span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#E86A70]" />
                  </div>
                  <h5 className="font-bold text-sm text-secondary">Early Bird 15%</h5>
                  <p className="text-xs text-slate-400 mt-1">Boost advance bookings</p>
                </button>

                <button 
                  onClick={() => handleOpenCreate({ name: "Flat ₹1,000 Coupon", type: "coupon", code: "SAVE1000", discountType: "flat", discountValue: 1000, description: "Use promo code SAVE1000 for instant ₹1,000 discount." })}
                  className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-[#E86A70] shadow-sm transition-all hover:-translate-y-1 cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-md">🎟️ Promo Code</span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#E86A70]" />
                  </div>
                  <h5 className="font-bold text-sm text-secondary">₹1,000 Coupon</h5>
                  <p className="text-xs text-slate-400 mt-1">Exclusive promo code</p>
                </button>

                <button 
                  onClick={() => handleOpenCreate({ name: "Stay 3 Pay 2 Weekend", type: "stay_x_pay_y", discountType: "stay_x_pay_y", description: "Book 3 nights, get 1 night completely free!" })}
                  className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-[#E86A70] shadow-sm transition-all hover:-translate-y-1 cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md">🌙 Stay X Pay Y</span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#E86A70]" />
                  </div>
                  <h5 className="font-bold text-sm text-secondary">Stay 3 Pay 2</h5>
                  <p className="text-xs text-slate-400 mt-1">Increase stay length</p>
                </button>

                <button 
                  onClick={() => handleOpenCreate({ name: "Festival Season Special 20%", type: "festival", code: "FESTIVE20", discountType: "percentage", discountValue: 20, description: "Special holiday season promotion." })}
                  className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-[#E86A70] shadow-sm transition-all hover:-translate-y-1 cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">🪔 Holiday</span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#E86A70]" />
                  </div>
                  <h5 className="font-bold text-sm text-secondary">Festival 20% OFF</h5>
                  <p className="text-xs text-slate-400 mt-1">Holiday season offer</p>
                </button>
              </div>
            </div>
          ) : viewMode === "table" ? (
            <div className="rounded-2xl border border-slate-100 overflow-hidden bg-white">
              <Table>
                <TableHeader className="bg-slate-50/70">
                  <TableRow>
                    <TableHead className="w-12 text-center">
                      <input 
                        type="checkbox" 
                        checked={selectedOfferIds.length === filteredOffers.length && filteredOffers.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedOfferIds(filteredOffers.map(o => o.id));
                          else setSelectedOfferIds([]);
                        }}
                        className="rounded border-slate-300"
                      />
                    </TableHead>
                    <TableHead className="font-bold text-xs uppercase tracking-wider text-slate-500">Offer Name & Type</TableHead>
                    <TableHead className="font-bold text-xs uppercase tracking-wider text-slate-500">Promo Code</TableHead>
                    <TableHead className="font-bold text-xs uppercase tracking-wider text-slate-500">Discount</TableHead>
                    <TableHead className="font-bold text-xs uppercase tracking-wider text-slate-500">Validity</TableHead>
                    <TableHead className="font-bold text-xs uppercase tracking-wider text-slate-500">Status</TableHead>
                    <TableHead className="font-bold text-xs uppercase tracking-wider text-slate-500">Redemptions / Rev</TableHead>
                    <TableHead className="text-right font-bold text-xs uppercase tracking-wider text-slate-500">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOffers.map(offer => {
                    const typeCfg = OFFER_TYPE_CONFIG[offer.type] || OFFER_TYPE_CONFIG.percentage;
                    const TypeIcon = typeCfg.icon;

                    return (
                      <TableRow key={offer.id} className="hover:bg-slate-50/60 transition-colors">
                        <TableCell className="text-center">
                          <input 
                            type="checkbox" 
                            checked={selectedOfferIds.includes(offer.id)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedOfferIds([...selectedOfferIds, offer.id]);
                              else setSelectedOfferIds(selectedOfferIds.filter(id => id !== offer.id));
                            }}
                            className="rounded border-slate-300"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl ${typeCfg.bg} ${typeCfg.color} flex items-center justify-center shrink-0`}>
                              <TypeIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-bold text-sm text-secondary">{offer.name}</p>
                              <p className="text-xs text-slate-400">{offer.roomName}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {offer.code ? (
                            <button 
                              onClick={() => handleCopyCode(offer.code!)}
                              className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                              title="Click to copy code"
                            >
                              <Tag className="w-3 h-3 text-slate-400" />
                              {offer.code}
                              <Copy className="w-3 h-3 text-slate-400" />
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Automatic</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className={`text-xs font-black px-2.5 py-1 rounded-md border ${typeCfg.badgeBg}`}>
                            {offer.discountType === "percentage" ? `${offer.discountValue}% OFF` : offer.discountType === "flat" ? `₹${offer.discountValue} OFF` : `Stay ${offer.stayX} Pay ${offer.payY}`}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs text-slate-600">
                            <p className="font-semibold">{offer.bookingStartDate} to {offer.bookingEndDate}</p>
                            <p className="text-[10px] text-slate-400">Min {offer.minStayNights} night(s)</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-xs font-bold capitalize ${
                            offer.status === "active" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                            offer.status === "scheduled" ? "bg-sky-50 text-sky-600 border-sky-200" :
                            offer.status === "paused" ? "bg-amber-50 text-amber-600 border-amber-200" :
                            "bg-slate-100 text-slate-500 border-slate-200"
                          }`}>
                            {offer.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs">
                            <p className="font-bold text-secondary">{offer.redemptions} used</p>
                            <p className="text-slate-400 font-semibold">₹{offer.revenueGenerated.toLocaleString('en-IN')}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger className="h-8 w-8 rounded-lg hover:bg-slate-100 flex items-center justify-center cursor-pointer">
                              <MoreVertical className="w-4 h-4 text-slate-500" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl w-44">
                              <DropdownMenuItem onClick={() => handleOpenEdit(offer)} className="cursor-pointer font-medium text-xs">
                                <Edit3 className="w-4 h-4 mr-2" /> Edit Offer
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleStatus(offer.id)} className="cursor-pointer font-medium text-xs">
                                {offer.status === "paused" ? (
                                  <><PlayCircle className="w-4 h-4 mr-2 text-emerald-500" /> Resume Offer</>
                                ) : (
                                  <><PauseCircle className="w-4 h-4 mr-2 text-amber-500" /> Pause Offer</>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDuplicateOffer(offer)} className="cursor-pointer font-medium text-xs">
                                <Layers className="w-4 h-4 mr-2" /> Duplicate Offer
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDeleteOffer(offer.id)} className="cursor-pointer font-medium text-xs text-rose-600 focus:text-rose-600">
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            /* GRID VIEW */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOffers.map(offer => {
                const typeCfg = OFFER_TYPE_CONFIG[offer.type] || OFFER_TYPE_CONFIG.percentage;
                const TypeIcon = typeCfg.icon;

                return (
                  <Card key={offer.id} className="border border-slate-200/80 shadow-md hover:shadow-xl transition-all rounded-3xl overflow-hidden bg-white group flex flex-col justify-between">
                    <div>
                      <div className="p-6 bg-linear-to-b from-slate-50/80 to-white border-b border-slate-100">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-10 h-10 rounded-2xl ${typeCfg.bg} ${typeCfg.color} flex items-center justify-center`}>
                              <TypeIcon className="w-5 h-5" />
                            </div>
                            <div>
                              <Badge variant="outline" className={`text-[10px] font-bold ${typeCfg.badgeBg}`}>
                                {typeCfg.label}
                              </Badge>
                              <h4 className="font-bold text-base text-secondary mt-0.5 line-clamp-1">{offer.name}</h4>
                            </div>
                          </div>

                          <Badge variant="outline" className={`text-xs font-bold capitalize ${
                            offer.status === "active" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                            offer.status === "scheduled" ? "bg-sky-50 text-sky-600 border-sky-200" :
                            offer.status === "paused" ? "bg-amber-50 text-amber-600 border-amber-200" :
                            "bg-slate-100 text-slate-500 border-slate-200"
                          }`}>
                            {offer.status}
                          </Badge>
                        </div>

                        <p className="text-xs text-slate-500 line-clamp-2 mt-2 font-medium">{offer.description}</p>

                        {offer.code && (
                          <div className="mt-4 flex items-center justify-between bg-slate-100 p-2.5 rounded-xl border border-slate-200/60">
                            <span className="text-xs text-slate-500 font-medium">Promo Code:</span>
                            <button 
                              onClick={() => handleCopyCode(offer.code!)}
                              className="font-mono text-xs font-bold text-slate-800 flex items-center gap-1 hover:text-[#E86A70] cursor-pointer"
                            >
                              {offer.code} <Copy className="w-3.5 h-3.5 text-slate-400" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="p-6 space-y-4 text-xs text-slate-600">
                        <div className="grid grid-cols-2 gap-4 p-3 rounded-2xl bg-slate-50">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400">Discount</span>
                            <p className="font-black text-sm text-secondary mt-0.5">
                              {offer.discountType === "percentage" ? `${offer.discountValue}% OFF` : offer.discountType === "flat" ? `₹${offer.discountValue} OFF` : `Stay ${offer.stayX} Pay ${offer.payY}`}
                            </p>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400">Redemptions</span>
                            <p className="font-black text-sm text-secondary mt-0.5">{offer.redemptions} used</p>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <p><span className="font-semibold text-slate-700">Applies to:</span> {offer.roomName}</p>
                          <p><span className="font-semibold text-slate-700">Validity:</span> {offer.bookingStartDate} to {offer.bookingEndDate}</p>
                          <p><span className="font-semibold text-slate-700">Min Stay:</span> {offer.minStayNights} night(s)</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleToggleStatus(offer.id)}
                        className="text-xs font-bold text-slate-600 hover:text-slate-800"
                      >
                        {offer.status === "paused" ? <PlayCircle className="w-4 h-4 mr-1 text-emerald-500" /> : <PauseCircle className="w-4 h-4 mr-1 text-amber-500" />}
                        {offer.status === "paused" ? "Resume" : "Pause"}
                      </Button>

                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleOpenEdit(offer)}
                          className="h-8 w-8 rounded-lg text-slate-500 hover:text-secondary hover:bg-slate-200"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteOffer(offer.id)}
                          className="h-8 w-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 4. CREATE / EDIT OFFER DIALOG */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl rounded-3xl p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading font-black text-2xl text-secondary flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-[#E86A70]" />
              {editingOffer ? "Edit Special Offer" : "Create Special Offer"}
            </DialogTitle>
            <DialogDescription className="text-slate-500 text-sm">
              Configure parameters for your promotional campaign.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Section A: Basic Info */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b pb-1">1. Basic Offer Details</h4>
              
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Offer Name *</Label>
                <Input 
                  placeholder="e.g. Summer Weekend Special 20%" 
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="h-11 rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Offer Category</Label>
                  <Select value={formType} onValueChange={(val) => setFormType(val as OfferType)}>
                    <SelectTrigger className="h-11 rounded-xl font-medium">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {Object.entries(OFFER_TYPE_CONFIG).map(([key, config]) => (
                        <SelectItem key={key} value={key}>{config.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Promo / Coupon Code (Optional)</Label>
                  <Input 
                    placeholder="e.g. SUMMER20" 
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    className="h-11 rounded-xl font-mono uppercase font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Description</Label>
                <Input 
                  placeholder="Short explanation shown to guests" 
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="h-11 rounded-xl font-medium"
                />
              </div>
            </div>

            {/* Section B: Discount Settings */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b pb-1">2. Discount & Structure</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Discount Type</Label>
                  <Select value={formDiscountType} onValueChange={(val) => setFormDiscountType(val as any)}>
                    <SelectTrigger className="h-11 rounded-xl font-medium">
                      <SelectValue placeholder="Select structure" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="percentage">Percentage Discount (%)</SelectItem>
                      <SelectItem value="flat">Flat Amount Discount (₹)</SelectItem>
                      <SelectItem value="stay_x_pay_y">Stay X Pay Y Nights</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formDiscountType === "stay_x_pay_y" ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Stay Nights (X)</Label>
                      <Input type="number" value={formStayX} onChange={(e) => setFormStayX(e.target.value)} className="h-11 rounded-xl font-bold" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Pay Nights (Y)</Label>
                      <Input type="number" value={formPayY} onChange={(e) => setFormPayY(e.target.value)} className="h-11 rounded-xl font-bold" />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      {formDiscountType === "percentage" ? "Percentage Value (%) *" : "Flat Amount Value (₹) *"}
                    </Label>
                    <Input 
                      type="number" 
                      placeholder={formDiscountType === "percentage" ? "20" : "1000"} 
                      value={formDiscountValue}
                      onChange={(e) => setFormDiscountValue(e.target.value)}
                      className="h-11 rounded-xl font-bold"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Section C: Target Rooms & Date Ranges */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b pb-1">3. Targeting & Validity Dates</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Target Property</Label>
                  <Select value={formPropertyId} onValueChange={(val) => val && setFormPropertyId(val)}>
                    <SelectTrigger className="h-11 rounded-xl font-medium">
                      <SelectValue placeholder="All Properties" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="all">All Properties</SelectItem>
                      {properties.map(p => (
                        <SelectItem key={p.$id} value={p.$id}>{p.propertyName || p.name || "Property"}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Target Room</Label>
                  <Select value={formRoomId} onValueChange={(val) => val && setFormRoomId(val)}>
                    <SelectTrigger className="h-11 rounded-xl font-medium">
                      <SelectValue placeholder="All Rooms" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="all">All Rooms</SelectItem>
                      {rooms.map(r => (
                        <SelectItem key={r.$id} value={r.$id}>{r.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Booking Start Date</Label>
                  <Input type="date" value={formBookingStartDate} onChange={(e) => setFormBookingStartDate(e.target.value)} className="h-11 rounded-xl font-medium" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Booking End Date</Label>
                  <Input type="date" value={formBookingEndDate} onChange={(e) => setFormBookingEndDate(e.target.value)} className="h-11 rounded-xl font-medium" />
                </div>
              </div>
            </div>

            {/* Section D: Rules & Restrictions */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b pb-1">4. Rules & Restrictions</h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Min Stay (Nights)</Label>
                  <Input type="number" value={formMinStayNights} onChange={(e) => setFormMinStayNights(e.target.value)} className="h-11 rounded-xl font-bold" />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Min Booking Value (₹)</Label>
                  <Input type="number" placeholder="Optional" value={formMinBookingValue} onChange={(e) => setFormMinBookingValue(e.target.value)} className="h-11 rounded-xl font-bold" />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Max Total Redemptions</Label>
                  <Input type="number" placeholder="Optional" value={formMaxRedemptions} onChange={(e) => setFormMaxRedemptions(e.target.value)} className="h-11 rounded-xl font-bold" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Applicable Days of Week</Label>
                <div className="flex flex-wrap gap-2">
                  {ALL_WEEKDAYS.map(day => {
                    const isSel = formApplicableDays.includes(day);
                    return (
                      <Button 
                        key={day} 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          if (isSel) setFormApplicableDays(formApplicableDays.filter(d => d !== day));
                          else setFormApplicableDays([...formApplicableDays, day]);
                        }}
                        className={`h-9 px-4 rounded-xl text-xs font-bold transition-all ${
                          isSel ? "bg-[#E86A70] text-white border-[#E86A70]" : "bg-white text-slate-600 border-slate-200"
                        }`}
                      >
                        {day}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <h5 className="font-bold text-sm text-secondary">Public Promotion</h5>
                  <p className="text-xs text-slate-500">Show this deal publicly on hotel listing page to all guests.</p>
                </div>
                <Switch checked={formIsPublic} onCheckedChange={setFormIsPublic} />
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-xl font-medium">Cancel</Button>
            <Button onClick={handleSaveOffer} className="rounded-xl bg-[#E86A70] hover:bg-[#E86A70]/90 text-white font-bold px-7">
              {editingOffer ? "Update Offer" : "Publish Offer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
