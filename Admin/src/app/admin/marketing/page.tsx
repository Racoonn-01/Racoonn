"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
  Plus,
  Loader2,
  Copy,
  Check,
  Trash2,
  Search,
  Eye,
  EyeOff
} from "lucide-react";
import {
  getCampaignsData,
  updateCampaignStatus,
  toggleCampaignPublicVisibility,
  deleteCampaign,
  CampaignItem
} from "./actions";

export default function MarketingPage() {
  const [data, setData] = useState<{
    activeCount: number;
    totalReach: string;
    avgConversionRate: string;
    marketingRoi: string;
    campaigns: CampaignItem[];
  }>({
    activeCount: 0,
    totalReach: "0",
    avgConversionRate: "0%",
    marketingRoi: "340%",
    campaigns: []
  });

  const [isLoading, setIsLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "rooms" | "packages" | "public" | "secret">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = async () => {
    try {
      setIsLoading(true);
      const res = await getCampaignsData();
      setData(res);
    } catch (err) {
      console.error("Failed to load marketing data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleStatus = async (id: string, realId: string | undefined, currentStatus: string) => {
    const nextStatus = currentStatus === "Active" ? "Paused" : "Active";
    setData(prev => ({
      ...prev,
      campaigns: prev.campaigns.map(c => c.id === id ? { ...c, status: nextStatus } : c)
    }));
    await updateCampaignStatus(realId || id, nextStatus);
  };

  const handleToggleVisibility = async (id: string, realId: string | undefined, currentIsPublic: boolean) => {
    const nextVisibility = !currentIsPublic;
    setData(prev => ({
      ...prev,
      campaigns: prev.campaigns.map(c => c.id === id ? { ...c, isPublic: nextVisibility } : c)
    }));
    await toggleCampaignPublicVisibility(realId || id, nextVisibility);
  };

  const handleDelete = async (id: string, realId: string | undefined) => {
    if (!confirm("Are you sure you want to delete this promotional offer?")) return;
    setData(prev => ({
      ...prev,
      campaigns: prev.campaigns.filter(c => c.id !== id)
    }));
    await deleteCampaign(realId || id);
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const isExpired = (validUntil?: string) => {
    if (!validUntil) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const validDate = new Date(validUntil);
    return validDate < today;
  };

  const filteredCampaigns = data.campaigns.filter((c) => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === "rooms") return c.applicableTo === "rooms";
    if (activeTab === "packages") return c.applicableTo === "packages";
    if (activeTab === "public") return c.isPublic === true;
    if (activeTab === "secret") return c.isPublic === false;
    return true;
  });

  const roomOffersCount = data.campaigns.filter(c => c.applicableTo === "rooms").length;
  const packageOffersCount = data.campaigns.filter(c => c.applicableTo === "packages").length;
  const publicOffersCount = data.campaigns.filter(c => c.isPublic === true).length;
  const secretOffersCount = data.campaigns.filter(c => c.isPublic === false).length;

  return (
    <div className="space-y-6 pb-10">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">Marketing & Promotions</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage Room & Package discounts, public /offers page visibility, and usage rules.
          </p>
        </div>
        <Link href="/admin/marketing/new">
          <Button 
            className="rounded-full px-5 h-9 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium shadow-none transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Create Offer
          </Button>
        </Link>
      </div>

      {/* Clean Minimal KPI Row */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        <div className="p-4 rounded-xl border border-slate-200/70 bg-white">
          <p className="text-xs text-slate-500 font-medium">Active Offers</p>
          <div className="text-xl font-semibold text-slate-850 mt-1">{data.activeCount}</div>
          <p className="text-[11px] text-emerald-600 mt-0.5 font-normal">Running currently</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200/70 bg-white">
          <p className="text-xs text-slate-500 font-medium">Rooms vs Packages</p>
          <div className="text-xl font-semibold text-slate-850 mt-1">
            {roomOffersCount} <span className="text-xs text-slate-400 font-normal">rooms</span> • {packageOffersCount} <span className="text-xs text-slate-400 font-normal">packages</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5 font-normal">Category breakdown</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200/70 bg-white">
          <p className="text-xs text-slate-500 font-medium">Public on Web</p>
          <div className="text-xl font-semibold text-slate-850 mt-1">{publicOffersCount}</div>
          <p className="text-[11px] text-slate-500 mt-0.5 font-normal">Visible on /offers page</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200/70 bg-white">
          <p className="text-xs text-slate-500 font-medium">Secret Promo Codes</p>
          <div className="text-xl font-semibold text-slate-850 mt-1">{secretOffersCount}</div>
          <p className="text-[11px] text-slate-500 mt-0.5 font-normal">Direct distribution only</p>
        </div>
      </div>

      {/* Offer Campaigns Table */}
      <div className="rounded-xl border border-slate-200/80 bg-white shadow-none overflow-hidden">
        {/* Clean Filter Bar */}
        <div className="px-4 py-3 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/40">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
            {[
              { id: "all", label: `All (${data.campaigns.length})` },
              { id: "rooms", label: `Rooms (${roomOffersCount})` },
              { id: "packages", label: `Packages (${packageOffersCount})` },
              { id: "public", label: `Public on Web (${publicOffersCount})` },
              { id: "secret", label: `Secret (${secretOffersCount})` },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id 
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200/60" 
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input 
              placeholder="Filter by code or name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8.5 bg-white border-slate-200 rounded-lg h-8 text-xs focus-visible:ring-1" 
            />
          </div>
        </div>

        <div className="p-0 overflow-x-auto">
          {isLoading ? (
            <div className="py-14 text-center">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" />
              <p className="mt-2 text-xs text-slate-500">Loading campaigns...</p>
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <div className="py-14 text-center text-slate-500 text-xs">
              No promotional campaigns found matching the filter.
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="border-b border-slate-100">
                  <TableHead className="font-medium text-slate-500 text-xs h-10">Campaign</TableHead>
                  <TableHead className="font-medium text-slate-500 text-xs h-10">Applicable To</TableHead>
                  <TableHead className="font-medium text-slate-500 text-xs h-10">Promo Code</TableHead>
                  <TableHead className="font-medium text-slate-500 text-xs h-10">Discount</TableHead>
                  <TableHead className="font-medium text-slate-500 text-xs h-10">Offers Page</TableHead>
                  <TableHead className="font-medium text-slate-500 text-xs h-10">Rules</TableHead>
                  <TableHead className="font-medium text-slate-500 text-xs h-10">Status</TableHead>
                  <TableHead className="text-right font-medium text-slate-500 text-xs h-10">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.map((camp) => (
                  <TableRow key={camp.id} className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors">
                    
                    {/* Campaign Name */}
                    <TableCell className="py-3">
                      <div>
                        <p className="font-medium text-slate-800 text-sm leading-snug">{camp.name}</p>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">{camp.id}</p>
                      </div>
                    </TableCell>

                    {/* Scope */}
                    <TableCell className="py-3">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 font-normal">
                        {camp.applicableTo === "rooms" ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                            <span>Rooms Only</span>
                          </>
                        ) : camp.applicableTo === "packages" ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                            <span>Packages Only</span>
                          </>
                        ) : (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span>Sitewide</span>
                          </>
                        )}
                      </div>
                    </TableCell>

                    {/* Promo Code */}
                    <TableCell className="py-3">
                      <button 
                        onClick={() => copyToClipboard(camp.code)}
                        className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs transition-colors cursor-pointer"
                        title="Click to copy code"
                      >
                        {camp.code}
                        {copiedCode === camp.code ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3 text-slate-400" />
                        )}
                      </button>
                    </TableCell>

                    {/* Discount */}
                    <TableCell className="py-3">
                      <div className="text-xs text-slate-700">
                        <span className="font-medium">
                          {camp.discountType === "percentage" ? `${camp.discountValue}% off` : `₹${camp.discountValue} off`}
                        </span>
                        {camp.maxDiscountCap ? (
                          <span className="text-slate-400 block text-[11px]">Cap: ₹{camp.maxDiscountCap}</span>
                        ) : (
                          <span className="text-slate-400 block text-[11px]">Min: ₹{camp.minOrderValue}</span>
                        )}
                      </div>
                    </TableCell>

                    {/* Offers Page Visibility */}
                    <TableCell className="py-3">
                      <button
                        onClick={() => handleToggleVisibility(camp.id, camp.realId, camp.isPublic)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-normal transition-colors cursor-pointer ${
                          camp.isPublic 
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" 
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                        title="Click to toggle visibility on user /offers page"
                      >
                        {camp.isPublic ? (
                          <>
                            <Eye className="w-3 h-3 text-emerald-600" /> Public
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3 text-slate-400" /> Secret
                          </>
                        )}
                      </button>
                    </TableCell>

                    {/* Usage Rules */}
                    <TableCell className="py-3">
                      <div className="text-xs text-slate-600 space-y-0.5">
                        {camp.usageLimitType === "one_time_per_user" ? (
                          <span>1-time per guest</span>
                        ) : camp.usageLimitType === "total_limit" ? (
                          <span>Cap: {camp.totalLimit || 100} uses</span>
                        ) : (
                          <span className="text-slate-400">Unlimited</span>
                        )}
                        {camp.firstBookingOnly && (
                          <span className="block text-[11px] text-purple-600 font-medium">New guests only</span>
                        )}
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="py-3">
                      <button 
                        onClick={() => !isExpired(camp.validUntil) && handleToggleStatus(camp.id, camp.realId, camp.status)}
                        className={`inline-flex items-center gap-1.5 text-xs cursor-pointer ${isExpired(camp.validUntil) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={isExpired(camp.validUntil)}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          isExpired(camp.validUntil) ? "bg-red-400" :
                          camp.status === "Active" ? "bg-emerald-500" : "bg-amber-400"
                        }`}></span>
                        <span className="text-slate-600 text-xs">
                          {isExpired(camp.validUntil) ? "Expired" : camp.status}
                        </span>
                      </button>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right py-3">
                      <div className="flex items-center justify-end gap-1">
                        {!isExpired(camp.validUntil) && (
                          <Button 
                            onClick={() => handleToggleStatus(camp.id, camp.realId, camp.status)}
                            variant="ghost" 
                            size="sm"
                            className="h-7 px-2 text-xs text-slate-500 hover:text-slate-900 cursor-pointer font-normal"
                          >
                            {camp.status === "Active" ? "Pause" : "Activate"}
                          </Button>
                        )}
                        <Button 
                          onClick={() => handleDelete(camp.id, camp.realId)}
                          variant="ghost" 
                          size="sm"
                          className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600 cursor-pointer"
                          title="Delete Campaign"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}


