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
  BadgeDollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  Eye,
  Loader2,
  Receipt,
  Building2,
  User,
  CreditCard,
  Printer,
  CheckCircle2,
  Calendar
} from "lucide-react";
import { getRevenueData, TransactionItem } from "./actions";

const formatCurrencyCompact = (value: number) => {
  return `₹${Math.round(value).toLocaleString('en-IN')}`;
};

const formatCurrencyExact = (value: number) => {
  return `₹${value.toLocaleString('en-IN')}`;
};

export default function RevenuePage() {
  const [data, setData] = useState<{
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

  const [isLoading, setIsLoading] = useState(true);

  // Popup Modal State for Selected Transaction Receipt
  const [selectedTx, setSelectedTx] = useState<TransactionItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const res = await getRevenueData();
        setData(res);
      } catch (err) {
        console.error("Failed to load revenue overview:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleOpenReceiptModal = (tx: TransactionItem) => {
    setSelectedTx(tx);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Revenue Overview</h2>
          <p className="text-muted-foreground mt-1">Track platform commissions, subscriptions, and total income.</p>
        </div>
        <Button variant="outline" className="rounded-full h-10 px-5">Download Statement</Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl border border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <BadgeDollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrencyCompact(data.totalRevenue)}</div>
            <p className="text-xs text-emerald-500 flex items-center gap-1 mt-1 font-medium">
              <TrendingUp className="h-3 w-3" /> Realtime totals
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Recurring</CardTitle>
            <Wallet className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrencyCompact(data.monthlyRecurring)}</div>
            <p className="text-xs text-muted-foreground mt-1">This month&apos;s active transactions</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Commissions</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrencyCompact(data.platformCommissions)}</div>
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
            <div className="text-2xl font-bold">{formatCurrencyCompact(data.refundLosses)}</div>
            <p className="text-xs text-red-500 flex items-center gap-1 mt-1 font-medium">
              <TrendingDown className="h-3 w-3" /> From cancelled bookings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Income Streams Table */}
      <Card className="rounded-2xl border border-border shadow-xs overflow-hidden">
        <CardHeader className="border-b border-border/60 bg-muted/20">
          <CardTitle className="text-lg font-bold">Recent Income Streams</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-16 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">Loading transactions...</p>
            </div>
          ) : data.transactions.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              No recent income transactions found.
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="font-semibold h-12">Transaction ID</TableHead>
                  <TableHead className="font-semibold h-12">Type</TableHead>
                  <TableHead className="font-semibold h-12">Source</TableHead>
                  <TableHead className="font-semibold h-12">Amount</TableHead>
                  <TableHead className="font-semibold h-12">Status</TableHead>
                  <TableHead className="font-semibold h-12">Date</TableHead>
                  <TableHead className="text-right font-semibold h-12">Receipt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.transactions.slice(0, 30).map((tx) => (
                  <TableRow 
                    key={tx.id}
                    onClick={() => handleOpenReceiptModal(tx)}
                    className="cursor-pointer hover:bg-muted/30 transition-colors group"
                  >
                    <TableCell className="font-bold font-mono text-xs text-foreground">{tx.id}</TableCell>
                    <TableCell className="font-medium">{tx.type}</TableCell>
                    <TableCell className="font-medium text-muted-foreground">{tx.source}</TableCell>
                    <TableCell className={`font-bold ${tx.type === 'Refund Fee' ? 'text-red-500' : 'text-emerald-600'}`}>
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
                      <Button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenReceiptModal(tx);
                        }}
                        variant="outline" 
                        size="sm"
                        className="h-8 rounded-full px-3.5 text-xs font-semibold hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" /> View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Smooth Revenue Receipt Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl w-full rounded-3xl p-0 overflow-hidden bg-background border border-border shadow-2xl max-h-[90vh] flex flex-col">
          {selectedTx && (
            <div className="flex flex-col h-full overflow-y-auto">
              
              {/* Header Banner */}
              <div className="bg-slate-900 text-white p-6 sm:p-8 flex items-center justify-between border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-black tracking-tight">{selectedTx.id}</h3>
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {selectedTx.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{selectedTx.date}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 font-medium">Transaction Amount</span>
                  <p className="text-2xl font-black text-[#E86A70]">+{formatCurrencyExact(selectedTx.amount)}</p>
                </div>
              </div>

              {/* Body Content */}
              <div className="p-6 sm:p-8 space-y-6">
                
                {/* Transaction Metadata Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1">
                    <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                      <Receipt className="w-3.5 h-3.5 text-rose-500" /> Transaction Type
                    </span>
                    <p className="font-bold text-slate-900 text-base">{selectedTx.type}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1">
                    <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-rose-500" /> Payment Method
                    </span>
                    <p className="font-bold text-slate-900 text-base">{selectedTx.paymentMethod || 'Online (Razorpay / UPI)'}</p>
                  </div>
                </div>

                {/* Source & Booking Details */}
                <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-rose-500" /> Originating Booking Source
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm pt-1">
                    <div>
                      <span className="text-xs text-slate-400 font-medium">Booking Code</span>
                      <p className="font-bold text-slate-900 text-base">{selectedTx.bookingCode || selectedTx.source}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{selectedTx.propertyName}</p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 font-medium">Customer Name</span>
                      <p className="font-bold text-slate-900 text-base">{selectedTx.customerName || 'Guest User'}</p>
                    </div>
                  </div>
                </div>

                {/* Financial Breakdown Card */}
                <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <BadgeDollarSign className="w-4 h-4 text-rose-500" /> Revenue & Fee Breakdown
                  </h4>
                  <div className="space-y-2.5 text-sm pt-1">
                    <div className="flex justify-between text-slate-600">
                      <span>Base Room Tariff</span>
                      <span className="font-semibold text-slate-900">
                        {formatCurrencyExact(selectedTx.roomPrice || Math.round(selectedTx.amount / 1.05))}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Statutory GST Tax</span>
                      <span className="font-semibold text-slate-900">
                        {formatCurrencyExact(selectedTx.taxes || (selectedTx.amount - Math.round(selectedTx.amount / 1.05)))}
                      </span>
                    </div>
                    {selectedTx.commission > 0 && (
                      <div className="flex justify-between text-purple-700 font-medium">
                        <span>Platform Commission (18%)</span>
                        <span className="font-bold">
                          +{formatCurrencyExact(selectedTx.commission)}
                        </span>
                      </div>
                    )}
                    <div className="h-px bg-slate-200/80 my-2"></div>
                    <div className="flex justify-between items-center text-base font-black">
                      <span className="text-slate-900">Total Transaction Amount</span>
                      <span className="text-[#E86A70] text-lg font-black">
                        +{formatCurrencyExact(selectedTx.amount)}
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Footer Action Buttons */}
              <div className="p-6 bg-slate-50 border-t border-slate-200/80 flex justify-end gap-3 mt-auto">
                <Button 
                  onClick={() => setIsModalOpen(false)} 
                  variant="outline" 
                  className="rounded-xl px-6 h-11 font-semibold border-slate-300 hover:bg-slate-100 text-slate-700"
                >
                  Close
                </Button>
                <Button 
                  onClick={() => window.print()} 
                  className="rounded-xl px-6 h-11 bg-[#E86A70] hover:bg-[#d5585e] text-white font-bold shadow-md transition-all"
                >
                  <Printer className="mr-2 h-4 w-4" /> Print Receipt
                </Button>
              </div>

            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
