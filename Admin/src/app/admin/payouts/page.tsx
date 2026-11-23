"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  HandCoins,
  Banknote,
  Clock,
  CheckCircle2,
  Eye,
  Loader2,
  Building2,
  User,
  CreditCard,
  Printer,
  CheckCheck,
  Send
} from "lucide-react";
import { getPayoutsData, PayoutItem } from "./actions";

const formatCurrencyExact = (value: number) => {
  return `₹${Math.round(value).toLocaleString('en-IN')}`;
};

export default function PayoutsPage() {
  const [data, setData] = useState<{
    pendingCount: number;
    pendingTotal: number;
    processedThisWeek: number;
    vendorCount: number;
    escrowBalance: number;
    payouts: PayoutItem[];
  }>({
    pendingCount: 0,
    pendingTotal: 0,
    processedThisWeek: 0,
    vendorCount: 0,
    escrowBalance: 0,
    payouts: []
  });

  const [isLoading, setIsLoading] = useState(true);
  const [selectedPayout, setSelectedPayout] = useState<PayoutItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const res = await getPayoutsData();
        setData(res);
      } catch (err) {
        console.error("Failed to load payouts:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleOpenModal = (po: PayoutItem) => {
    setSelectedPayout(po);
    setIsModalOpen(true);
  };

  const handleMarkProcessed = () => {
    if (!selectedPayout) return;
    setIsProcessing(true);
    setTimeout(() => {
      setData(prev => ({
        ...prev,
        payouts: prev.payouts.map(p => p.id === selectedPayout.id ? { ...p, status: "Processed" } : p)
      }));
      setSelectedPayout(prev => prev ? { ...prev, status: "Processed" } : null);
      setIsProcessing(false);
    }, 800);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Vendor Payouts</h2>
          <p className="text-muted-foreground mt-1">Manage partner withdrawals, settlement cycles, and balances.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-full h-10 px-5">Export Batch</Button>
          <Button className="rounded-full h-10 px-6 bg-[#E86A70] hover:bg-[#d5585e] text-white font-bold shadow-md">
            Process Payouts
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl border border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.pendingCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Totalling {formatCurrencyExact(data.pendingTotal)} pending
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processed This Week</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrencyExact(data.processedThisWeek)}</div>
            <p className="text-xs text-muted-foreground mt-1">Across {data.vendorCount} vendors</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Escrow Balance</CardTitle>
            <Banknote className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrencyExact(data.escrowBalance)}</div>
            <p className="text-xs text-muted-foreground mt-1">Held until checkout</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Cycle</CardTitle>
            <HandCoins className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Friday</div>
            <p className="text-xs text-muted-foreground mt-1">Net 15 schedule</p>
          </CardContent>
        </Card>
      </div>

      {/* Payout Queue Table */}
      <Card className="rounded-2xl border border-border shadow-xs overflow-hidden">
        <CardHeader className="border-b border-border/60 bg-muted/20">
          <CardTitle className="text-lg font-bold">Payout Queue</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-16 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">Loading vendor payout queue...</p>
            </div>
          ) : data.payouts.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              No vendor payouts in queue.
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="font-semibold h-12">Payout ID</TableHead>
                  <TableHead className="font-semibold h-12">Vendor</TableHead>
                  <TableHead className="font-semibold h-12">Net Amount</TableHead>
                  <TableHead className="font-semibold h-12">Account Details</TableHead>
                  <TableHead className="font-semibold h-12">Method</TableHead>
                  <TableHead className="font-semibold h-12">Status</TableHead>
                  <TableHead className="font-semibold h-12">Requested Date</TableHead>
                  <TableHead className="text-right font-semibold h-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.payouts.map((po) => (
                  <TableRow 
                    key={po.id}
                    onClick={() => handleOpenModal(po)}
                    className="cursor-pointer hover:bg-muted/30 transition-colors group"
                  >
                    <TableCell className="font-bold font-mono text-xs text-foreground">{po.id}</TableCell>
                    <TableCell className="font-bold text-foreground">{po.vendor}</TableCell>
                    <TableCell className="font-black text-foreground text-base">
                      {formatCurrencyExact(po.amount)}
                    </TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">{po.account}</TableCell>
                    <TableCell className="text-sm font-medium">{po.method}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={po.status === "Processed" ? "default" : "secondary"}
                        className={`
                          px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider
                          ${po.status === "Processed" && "bg-rose-500/10 text-rose-600 border-rose-500/20"}
                          ${po.status === "Processing" && "bg-blue-500/10 text-blue-600 border-blue-500/20"}
                          ${po.status === "Pending" && "bg-amber-500/10 text-amber-600 border-amber-500/20"}
                        `}
                      >
                        {po.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{po.date}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenModal(po);
                        }}
                        variant="outline" 
                        size="sm"
                        className="h-8 rounded-full px-4 text-xs font-bold hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" /> Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Smooth Vendor Payout Review Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl w-full rounded-3xl p-0 overflow-hidden bg-background border border-border shadow-2xl max-h-[90vh] flex flex-col">
          {selectedPayout && (
            <div className="flex flex-col h-full overflow-y-auto">
              
              {/* Header Banner */}
              <div className="bg-slate-900 text-white p-6 sm:p-8 flex items-center justify-between border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-black tracking-tight">{selectedPayout.id}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                      selectedPayout.status === 'Processed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      selectedPayout.status === 'Processing' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                      'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {selectedPayout.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{selectedPayout.date}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 font-medium">Net Payout Payable</span>
                  <p className="text-2xl font-black text-[#E86A70]">{formatCurrencyExact(selectedPayout.amount)}</p>
                </div>
              </div>

              {/* Body Content */}
              <div className="p-6 sm:p-8 space-y-6">
                
                {/* Vendor Partner Card */}
                <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-rose-500" /> Vendor Partner Profile
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm pt-1">
                    <div>
                      <span className="text-xs text-slate-400 font-medium">Hotel / Property</span>
                      <p className="font-bold text-slate-900 text-base">{selectedPayout.vendor}</p>
                      <p className="text-xs text-slate-500">{selectedPayout.propertyName}</p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 font-medium">Contact Email</span>
                      <p className="font-semibold text-slate-800">{selectedPayout.vendorEmail}</p>
                    </div>
                  </div>
                </div>

                {/* Bank Account Settlement Details Card */}
                <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-rose-500" /> Bank Account Settlement Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm pt-1">
                    <div>
                      <span className="text-xs text-slate-400 font-medium">Bank Name</span>
                      <p className="font-bold text-slate-900">{selectedPayout.bankName}</p>
                      <span className="text-xs text-slate-400 font-medium mt-2 block">Account Holder</span>
                      <p className="font-semibold text-slate-800">{selectedPayout.accountHolder}</p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 font-medium">Account Number</span>
                      <p className="font-bold text-slate-900 font-mono">{selectedPayout.accountNumber}</p>
                      <span className="text-xs text-slate-400 font-medium mt-2 block">IFSC Code</span>
                      <p className="font-semibold text-slate-800 font-mono">{selectedPayout.ifsc}</p>
                    </div>
                  </div>
                </div>

                {/* Financial Calculation Breakdown */}
                <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <HandCoins className="w-4 h-4 text-rose-500" /> Payout Financial Settlement Breakdown
                  </h4>
                  <div className="space-y-2 text-sm pt-1">
                    <div className="flex justify-between text-slate-600">
                      <span>Gross Booking Revenue</span>
                      <span className="font-semibold text-slate-900">{formatCurrencyExact(selectedPayout.grossAmount)}</span>
                    </div>
                    <div className="flex justify-between text-purple-700 font-medium">
                      <span>Platform Service Fee (18% + GST)</span>
                      <span>-{formatCurrencyExact(selectedPayout.platformFee)}</span>
                    </div>
                    <div className="h-px bg-slate-200/80 my-2"></div>
                    <div className="flex justify-between items-center text-base font-black">
                      <span className="text-slate-900">Net Payable Payout Amount</span>
                      <span className="text-[#E86A70] text-lg font-black">{formatCurrencyExact(selectedPayout.netPayout)}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Footer Buttons */}
              <div className="p-6 bg-slate-50 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 mt-auto">
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={() => window.print()} 
                    variant="outline"
                    className="rounded-xl px-5 h-11 font-semibold border-slate-300 hover:bg-slate-100 text-slate-700"
                  >
                    <Printer className="mr-2 h-4 w-4" /> Print Slip
                  </Button>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Button 
                    onClick={() => setIsModalOpen(false)} 
                    variant="outline" 
                    className="rounded-xl px-5 h-11 font-semibold border-slate-300 hover:bg-slate-100 text-slate-700 flex-1 sm:flex-none"
                  >
                    Close
                  </Button>
                  {selectedPayout.status !== "Processed" && (
                    <Button 
                      onClick={handleMarkProcessed}
                      disabled={isProcessing}
                      className="rounded-xl px-6 h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md flex-1 sm:flex-none"
                    >
                      {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCheck className="w-4 h-4 mr-2" />}
                      Approve & Process Payout
                    </Button>
                  )}
                </div>
              </div>

            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
