"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
  Megaphone,
  Target,
  Percent,
  TrendingUp,
  Plus,
  Loader2,
  Tag,
  Copy,
  Check,
  Trash2,
  Sparkles
} from "lucide-react";
import {
  getCampaignsData,
  createCampaign,
  updateCampaignStatus,
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

  const handleDelete = async (id: string, realId: string | undefined) => {
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

  return (
    <div className="space-y-6 pb-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Marketing & Promotions</h2>
          <p className="text-muted-foreground mt-1">Create offers, manage promotional campaigns, and discount codes.</p>
        </div>
        <Link href="/admin/marketing/new">
          <Button 
            className="rounded-full px-6 h-11 bg-[#E86A70] hover:bg-[#d5585e] text-white font-bold shadow-md transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> Make Offer / New Campaign
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl border border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Megaphone className="h-4 w-4 text-[#E86A70]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.activeCount}</div>
            <p className="text-xs text-emerald-500 font-medium flex items-center gap-1 mt-1">
              <Sparkles className="w-3 h-3" /> Running currently
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalReach}</div>
            <p className="text-xs text-muted-foreground mt-1">Live audience engagement</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Conversion Rate</CardTitle>
            <Percent className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.avgConversionRate}</div>
            <p className="text-xs text-emerald-500 font-medium flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" /> Based on booking claims
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Marketing ROI</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.marketingRoi}</div>
            <p className="text-xs text-muted-foreground mt-1">Estimated returns</p>
          </CardContent>
        </Card>
      </div>

      {/* Offer Campaigns Table */}
      <Card className="rounded-2xl border border-border shadow-xs overflow-hidden">
        <CardHeader className="border-b border-border/60 bg-muted/20 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold">Active Promotional Campaigns & Discount Codes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-16 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">Loading active campaigns...</p>
            </div>
          ) : data.campaigns.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              No promotional offer campaigns found. Click &quot;Make Offer / New Campaign&quot; to create one.
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="font-semibold h-12">Campaign ID</TableHead>
                  <TableHead className="font-semibold h-12">Campaign Name</TableHead>
                  <TableHead className="font-semibold h-12">Promo Code</TableHead>
                  <TableHead className="font-semibold h-12">Offer Discount</TableHead>
                  <TableHead className="font-semibold h-12">Min Order</TableHead>
                  <TableHead className="font-semibold h-12">Status</TableHead>
                  <TableHead className="font-semibold h-12">Conversions</TableHead>
                  <TableHead className="text-right font-semibold h-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.campaigns.map((camp) => (
                  <TableRow key={camp.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-bold font-mono text-xs text-foreground">{camp.id}</TableCell>
                    <TableCell className="font-bold text-foreground">{camp.name}</TableCell>
                    <TableCell>
                      <button 
                        onClick={() => copyToClipboard(camp.code)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-mono font-bold text-xs hover:bg-rose-100 transition-colors"
                        title="Click to copy promo code"
                      >
                        <Tag className="w-3 h-3" />
                        {camp.code}
                        {copiedCode === camp.code ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-rose-400" />}
                      </button>
                    </TableCell>
                    <TableCell className="font-bold text-emerald-600">
                      {camp.discountType === "percentage" ? `${camp.discountValue}% OFF` : `₹${camp.discountValue} FLAT OFF`}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-semibold">
                      ₹{camp.minOrderValue}
                    </TableCell>
                    <TableCell>
                      <button 
                        onClick={() => !isExpired(camp.validUntil) && handleToggleStatus(camp.id, camp.realId, camp.status)}
                        className={`cursor-pointer ${isExpired(camp.validUntil) ? 'opacity-70 cursor-not-allowed' : ''}`}
                        disabled={isExpired(camp.validUntil)}
                      >
                        <Badge 
                          className={`
                            px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all
                            ${isExpired(camp.validUntil) ? "bg-red-500/10 text-red-600 border-red-500/20" : 
                              camp.status === "Active" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20" :
                              camp.status === "Paused" ? "bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20" :
                              "bg-slate-500/10 text-slate-600 border-slate-500/20 hover:bg-slate-500/20"}
                          `}
                        >
                          {isExpired(camp.validUntil) ? "Expired" : camp.status}
                        </Badge>
                      </button>
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-foreground">{camp.conversions}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {!isExpired(camp.validUntil) && (
                          <Button 
                            onClick={() => handleToggleStatus(camp.id, camp.realId, camp.status)}
                            variant="ghost" 
                            size="sm"
                            className="h-8 rounded-full px-3 text-xs font-semibold text-muted-foreground hover:text-foreground"
                          >
                            {camp.status === "Active" ? "Pause" : "Activate"}
                          </Button>
                        )}
                        <Button 
                          onClick={() => handleDelete(camp.id, camp.realId)}
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0 rounded-full text-rose-500 hover:bg-rose-50 hover:text-rose-700"
                          title="Delete Campaign"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
