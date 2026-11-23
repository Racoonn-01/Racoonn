"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent
} from "@/components/ui/dialog";
import {
  BadgeDollarSign,
  TrendingUp,
  TrendingDown,
  Eye,
  Loader2,
  Receipt,
  Building2,
  CreditCard,
  Printer,
  Download
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import * as XLSX from "xlsx";
import { getRevenueData, TransactionItem } from "./actions";

const formatCurrencyCompact = (value: number) => {
  return `₹${Math.round(value).toLocaleString('en-IN')}`;
};

const formatCurrencyExact = (value: number) => {
  return `₹${value.toLocaleString('en-IN')}`;
};

export default function RevenuePage() {
  const [rawRevenueData, setRawRevenueData] = useState<{
    totalRevenue: number;
    monthlyRecurring: number;
    platformCommissions: number;
    refundLosses: number;
    transactions: TransactionItem[];
  }>({
    totalRevenue: 0,
    monthlyRecurring: 0,
    platformCommissions: 0,
    refundLosses: 0,
    transactions: []
  });

  const [filterType, setFilterType] = useState<"Today" | "Weekly" | "Monthly" | "Yearly" | "Lifetime">("Lifetime");

  const [isLoading, setIsLoading] = useState(true);

  // Popup Modal State for Selected Transaction Receipt
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  // Download Statement Popover State
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date()
  });
  const [downloadError, setDownloadError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const res = await getRevenueData();
        setRawRevenueData(res);
      } catch (err) {
        console.error("Failed to load revenue overview:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleDownloadInvoice = async (tx: TransactionItem) => {
    try {
      setIsDownloading(tx.id);
      
      const payload = {
        hotelName: tx.propertyName,
        hotelLocation: tx.hotelLocation || '',
        price: tx.amount,
        firstName: tx.customerName?.split(' ')[0] || 'Guest',
        lastName: tx.customerName?.split(' ').slice(1).join(' ') || '',
        email: tx.email,
        checkIn: tx.checkIn,
        checkOut: tx.checkOut,
        nights: tx.nights,
        adults: tx.adults,
        bookingId: tx.rawBookingId?.substring(0, 8).toUpperCase() || tx.id,
        gstRate: tx.gstRate || 18,
        gstAmount: tx.taxes,
        addonsList: tx.rawAddonsList ? tx.rawAddonsList : (tx.addons && tx.addons > 0 ? [{ name: 'Additional Services', price: tx.addons }] : [])
      };

      const res = await fetch('/api/invoice/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error("Download failed");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice-${tx.bookingCode || tx.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      console.error("Failed to download invoice", err);
      alert("Failed to download invoice.");
    } finally {
      setIsDownloading(null);
    }
  };

  const displayData = React.useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    const txs = rawRevenueData.transactions.filter(tx => {
      const txDate = new Date(tx.createdAt);
      if (filterType === "Today") return txDate >= today;
      if (filterType === "Weekly") return txDate >= weekStart;
      if (filterType === "Monthly") return txDate >= monthStart;
      if (filterType === "Yearly") return txDate >= yearStart;
      return true;
    });

    let totalRev = 0;
    let platComms = 0;
    let refLosses = 0;

    txs.forEach(tx => {
      if (tx.status.toLowerCase() !== 'failed' && tx.status.toLowerCase() !== 'cancelled') {
        totalRev += tx.amount;
        platComms += tx.commission;
      }
      if (tx.type === 'Refund Fee') {
        refLosses += tx.amount;
      }
    });

    return {
      totalRevenue: totalRev,
      monthlyRecurring: rawRevenueData.monthlyRecurring,
      platformCommissions: platComms,
      refundLosses: refLosses,
      transactions: txs
    };
  }, [rawRevenueData, filterType]);

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-medium tracking-tight">Revenue Overview</h2>
          <p className="text-muted-foreground mt-1">Track platform commissions, subscriptions, and total income.</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={filterType} onValueChange={(val: "Today" | "Weekly" | "Monthly" | "Yearly" | "Lifetime" | null) => { if (val) setFilterType(val); }}>
            <SelectTrigger className="w-40 h-10 rounded-full font-medium">
              <SelectValue placeholder="Filter by date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Today">Today</SelectItem>
              <SelectItem value="Weekly">Weekly</SelectItem>
              <SelectItem value="Monthly">Monthly</SelectItem>
              <SelectItem value="Yearly">Yearly</SelectItem>
              <SelectItem value="Lifetime">Lifetime</SelectItem>
            </SelectContent>
          </Select>
          <Popover open={isDownloadModalOpen} onOpenChange={(open) => { setIsDownloadModalOpen(open); if(open) setDownloadError(""); }}>
            <PopoverTrigger 
              render={
                <Button variant="outline" className="rounded-full h-10 px-5 text-slate-700 font-medium">
                  <Download className="w-4 h-4 mr-2" /> Export Data
                </Button>
              }
            />
            <PopoverContent align="end" className="w-auto p-4 rounded-xl shadow-xl bg-white border border-slate-200">
              <div className="mb-4">
                <h3 className="font-medium text-lg text-slate-900">Export Bookings</h3>
                <p className="text-sm text-slate-500">Select a date range to export.</p>
              </div>
              <div className="border border-slate-200 rounded-xl mb-4 overflow-hidden">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={(range) => {
                    setDateRange(range);
                    setDownloadError("");
                  }}
                  numberOfMonths={2}
                />
              </div>

              {downloadError && (
                <div className="mb-4 text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-lg font-medium">
                  {downloadError}
                </div>
              )}
              
              <div className="border-t border-slate-100 pt-4 flex justify-end items-center gap-6">
                <button 
                  className="text-sm font-semibold text-slate-800 hover:text-slate-950 transition-colors"
                  onClick={() => setIsDownloadModalOpen(false)}
                >
                  Cancel
                </button>
                <Button 
                  className="rounded-lg h-10 px-6 bg-[#E86A70] hover:bg-[#d5585e] text-white font-medium"
                  onClick={() => {
                    if (!dateRange?.from) {
                      setDownloadError("Please select a date range.");
                      return;
                    }
                    
                    const fromTime = new Date(dateRange.from.getFullYear(), dateRange.from.getMonth(), dateRange.from.getDate()).getTime();
                    const toDate = dateRange.to || dateRange.from;
                    const toTime = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate(), 23, 59, 59, 999).getTime();

                    const txsForDate = rawRevenueData.transactions.filter(tx => {
                      const txTime = new Date(tx.createdAt).getTime();
                      return txTime >= fromTime && txTime <= toTime;
                    });

                    if (txsForDate.length === 0) {
                      setDownloadError(`No Revenue Overview found for selected range.`);
                      return;
                    }

                    const excelData = txsForDate.map(tx => ({
                      "Invoice No.": "INV-12345678",
                      "Booking Ref.": tx.rawBookingId ? tx.rawBookingId.substring(0, 8).toUpperCase() : tx.source,
                      "Customer Name": tx.customerName || "N/A",
                      "Room Price": tx.roomPrice,
                      "Addons": tx.addons || 0,
                      "Discounts": tx.discounts || 0,
                      "Taxes (GST)": tx.taxes,
                      "Commission": tx.commission,
                      "Total Amount": tx.amount,
                      "Status": tx.status,
                      "Date": tx.date
                    }));

                    const worksheet = XLSX.utils.json_to_sheet(excelData);
                    const workbook = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(workbook, worksheet, "Statement");
                    
                    const fileNameStr = dateRange.to && dateRange.to.getTime() !== dateRange.from.getTime() 
                      ? `${dateRange.from.toLocaleDateString().replace(/\//g, '-')}_to_${dateRange.to.toLocaleDateString().replace(/\//g, '-')}`
                      : `${dateRange.from.toLocaleDateString().replace(/\//g, '-')}`;
                      
                    XLSX.writeFile(workbook, `Revenue_Statement_${fileNameStr}.xlsx`);
                    
                    setIsDownloadModalOpen(false);
                  }}
                >
                  Download Excel
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-2xl border border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <BadgeDollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-medium">{formatCurrencyCompact(displayData.totalRevenue)}</div>
            <p className="text-xs text-emerald-500 flex items-center gap-1 mt-1 font-medium">
              <TrendingUp className="h-3 w-3" /> Realtime totals
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Commissions</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-medium">{formatCurrencyCompact(displayData.platformCommissions)}</div>
            <p className="text-xs text-emerald-500 flex items-center gap-1 mt-1 font-medium">
              <TrendingUp className="h-3 w-3" /> 18% Platform Fee
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Refund Losses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-medium">{formatCurrencyCompact(displayData.refundLosses)}</div>
            <p className="text-xs text-red-500 flex items-center gap-1 mt-1 font-medium">
              <TrendingDown className="h-3 w-3" /> From cancelled bookings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Income Streams Table */}
      <Card className="rounded-2xl border border-border shadow-xs overflow-hidden">
        <CardHeader className="border-b border-border/60 bg-muted/20">
          <CardTitle className="text-lg font-medium">Recent Income Streams</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-16 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">Loading transactions...</p>
            </div>
          ) : displayData.transactions.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              No recent income transactions found for {filterType}.
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="font-semibold h-12">Invoice No.</TableHead>
                  <TableHead className="font-semibold h-12">Booking Ref.</TableHead>
                  <TableHead className="font-semibold h-12">Room Price</TableHead>
                  <TableHead className="font-semibold h-12">Addons</TableHead>
                  <TableHead className="font-semibold h-12">Discounts</TableHead>
                  <TableHead className="font-semibold h-12">GST</TableHead>
                  <TableHead className="font-semibold h-12">Total Amount</TableHead>
                  <TableHead className="font-semibold h-12">Status</TableHead>
                  <TableHead className="font-semibold h-12">Date</TableHead>
                  <TableHead className="text-right font-semibold h-12">Receipt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayData.transactions.slice(0, 30).map((tx) => (
                  <TableRow 
                    key={tx.id}
                    className="hover:bg-muted/30 transition-colors group"
                  >
                    <TableCell className="font-medium font-mono text-xs text-foreground">INV-12345678</TableCell>
                    <TableCell className="font-medium text-muted-foreground">{tx.rawBookingId ? tx.rawBookingId.substring(0, 8).toUpperCase() : tx.source}</TableCell>
                    <TableCell className="font-medium">{formatCurrencyExact(tx.roomPrice)}</TableCell>
                    <TableCell className="font-medium text-muted-foreground">
                      {(tx.addons ?? 0) > 0 ? `+${formatCurrencyExact(tx.addons ?? 0)}` : '-'}
                    </TableCell>
                    <TableCell className="font-medium text-rose-500">
                      {(tx.discounts ?? 0) > 0 ? `-${formatCurrencyExact(tx.discounts ?? 0)}` : '-'}
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrencyExact(tx.taxes)}</TableCell>
                    <TableCell className={`font-medium ${tx.type === 'Refund Fee' ? 'text-red-500' : 'text-emerald-600'}`}>
                      {tx.type === 'Refund Fee' ? '-' : '+'}{formatCurrencyExact(tx.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={tx.status === "Completed" ? "default" : "secondary"}
                        className={tx.status === "Completed" ? "bg-rose-500/10 text-rose-600 border-rose-500/20" : ""}
                      >
                        {tx.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{tx.date}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          onClick={() => handleDownloadInvoice(tx)}
                          variant="outline" 
                          size="sm"
                          disabled={isDownloading === tx.id}
                          className="h-8 rounded-full px-4 text-xs font-semibold bg-[#E86A70]/10 text-[#E86A70] hover:bg-[#E86A70]/20 border-transparent shadow-none"
                        >
                          {isDownloading === tx.id ? (
                            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                          ) : (
                            <Download className="w-3.5 h-3.5 mr-1.5" />
                          )}
                          Download Invoice
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
