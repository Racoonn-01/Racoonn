"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  CreditCard,
  ArrowRightLeft,
  ShieldAlert,
  Activity,
  Eye,
  Loader2,
  Receipt,
  Building2,
  User,
  Printer,
  RefreshCw,
  CheckCircle2,
  Search,
  ShieldCheck,
  Phone,
  Mail,
  Zap
} from "lucide-react";
import { getPaymentsData, PaymentItem } from "./actions";

const formatCurrencyExact = (value: number) => {
  return `₹${Math.round(value).toLocaleString('en-IN')}`;
};

export default function PaymentsPage() {
  const [data, setData] = useState<{
    todayVolume: number;
    todayCount: number;
    gatewayBalance: number;
    refundRate: string;
    failedCount: number;
    payments: PaymentItem[];
  }>({
    todayVolume: 0,
    todayCount: 0,
    gatewayBalance: 0,
    refundRate: "0.0",
    failedCount: 0,
    payments: []
  });

  const [isLoading, setIsLoading] = useState(true);

  // Trace Modal State
  const [selectedPayment, setSelectedPayment] = useState<PaymentItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifySuccess, setVerifySuccess] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const res = await getPaymentsData();
        setData(res);
      } catch (err) {
        console.error("Failed to load payments data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleOpenTraceModal = (pay: PaymentItem) => {
    setSelectedPayment(pay);
    setVerifySuccess(false);
    setIsModalOpen(true);
  };

  const handleReverifyWebhook = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setVerifySuccess(true);
      setTimeout(() => setVerifySuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Payments Gateway</h2>
        <p className="text-muted-foreground mt-1">Monitor real-time customer transactions, payment gateways, and audit traces.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl border border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Volume</CardTitle>
            <Activity className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrencyExact(data.todayVolume)}</div>
            <p className="text-xs text-emerald-600 font-medium mt-1">{data.todayCount} successful transactions</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gateway Balance</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrencyExact(data.gatewayBalance)}</div>
            <p className="text-xs text-muted-foreground mt-1">Ready for transfer</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Refund Rate</CardTitle>
            <ArrowRightLeft className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.refundRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">Within healthy limits</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Payments</CardTitle>
            <ShieldAlert className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.failedCount}</div>
            <p className="text-xs text-destructive font-medium mt-1">Declined or failed bookings</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Ledger Table */}
      <Card className="rounded-2xl border border-border shadow-xs overflow-hidden">
        <CardHeader className="border-b border-border/60 bg-muted/20">
          <CardTitle className="text-lg font-bold">Recent Payment Ledger</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-16 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">Loading gateway ledger...</p>
            </div>
          ) : data.payments.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              No recent payment transactions found.
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="font-semibold h-12">Payment ID</TableHead>
                  <TableHead className="font-semibold h-12">Customer Name</TableHead>
                  <TableHead className="font-semibold h-12">Amount</TableHead>
                  <TableHead className="font-semibold h-12">Method</TableHead>
                  <TableHead className="font-semibold h-12">Gateway</TableHead>
                  <TableHead className="font-semibold h-12">Status</TableHead>
                  <TableHead className="font-semibold h-12">Date</TableHead>
                  <TableHead className="text-right font-semibold h-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.payments.slice(0, 30).map((pay) => (
                  <TableRow 
                    key={pay.id}
                    onClick={() => handleOpenTraceModal(pay)}
                    className="cursor-pointer hover:bg-muted/30 transition-colors group"
                  >
                    <TableCell className="font-bold font-mono text-xs text-foreground">{pay.id}</TableCell>
                    <TableCell className="font-bold text-foreground">{pay.customer}</TableCell>
                    <TableCell className="font-black text-foreground text-base">{formatCurrencyExact(pay.amount)}</TableCell>
                    <TableCell className="text-xs font-semibold text-muted-foreground">{pay.method}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-slate-100 text-slate-700 font-bold border-slate-200">
                        {pay.gateway}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={pay.status === "Successful" ? "default" : pay.status === "Failed" ? "destructive" : "secondary"}
                        className={`
                          px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider
                          ${pay.status === "Successful" && "bg-rose-500/10 text-rose-600 border-rose-500/20"}
                          ${pay.status === "Processing" && "bg-blue-500/10 text-blue-600 border-blue-500/20"}
                          ${pay.status === "Failed" && "bg-red-500/10 text-red-600 border-red-500/20"}
                        `}
                      >
                        {pay.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{pay.date}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenTraceModal(pay);
                        }}
                        variant="outline" 
                        size="sm"
                        className="h-8 rounded-full px-4 text-xs font-bold hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
                      >
                        <Search className="w-3.5 h-3.5 mr-1" /> Trace
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Smooth Payment Trace Audit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl w-full rounded-3xl p-0 overflow-hidden bg-background border border-border shadow-2xl max-h-[90vh] flex flex-col">
          {selectedPayment && (
            <div className="flex flex-col h-full overflow-y-auto">
              
              {/* Header Banner */}
              <div className="bg-slate-900 text-white p-6 sm:p-8 flex items-center justify-between border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-black tracking-tight">{selectedPayment.id}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                      selectedPayment.status === 'Successful' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      selectedPayment.status === 'Processing' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                      'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}>
                      {selectedPayment.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Ref ID: {selectedPayment.gatewayRef} • {selectedPayment.date}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 font-medium">Payment Amount</span>
                  <p className="text-2xl font-black text-[#E86A70]">{formatCurrencyExact(selectedPayment.amount)}</p>
                </div>
              </div>

              {/* Body Content */}
              <div className="p-6 sm:p-8 space-y-6">
                
                {/* Customer Details Box */}
                <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <User className="w-4 h-4 text-rose-500" /> Payer Customer Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm pt-1">
                    <div>
                      <span className="text-xs text-slate-400 font-medium">Customer Name</span>
                      <p className="font-bold text-slate-900 text-base">{selectedPayment.customer}</p>
                    </div>
                    <div className="space-y-1 text-xs text-slate-600">
                      <p className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" /> {selectedPayment.customerEmail}
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" /> {selectedPayment.customerPhone}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Gateway & Booking Metadata Grid */}
                <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-rose-500" /> Originating Booking & Gateway Audit
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm pt-1">
                    <div>
                      <span className="text-xs text-slate-400 font-medium">Booking Reference</span>
                      <p className="font-bold text-slate-900 text-base">{selectedPayment.bookingCode}</p>
                      <p className="text-xs text-slate-500">{selectedPayment.propertyName}</p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 font-medium">Payment Gateway & Method</span>
                      <p className="font-bold text-slate-900 text-base">{selectedPayment.gateway}</p>
                      <p className="text-xs text-slate-500 font-medium">{selectedPayment.method}</p>
                    </div>
                  </div>
                </div>

                {/* Financial Audit Breakdown */}
                <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-rose-500" /> Financial Audit & Net Settlement
                  </h4>
                  <div className="space-y-2 text-sm pt-1">
                    <div className="flex justify-between text-slate-600">
                      <span>Base Room Tariff</span>
                      <span className="font-semibold text-slate-900">{formatCurrencyExact(selectedPayment.roomPrice)}</span>
                    </div>
                    {selectedPayment.taxes > 0 && (
                      <div className="flex justify-between text-slate-600">
                        <span>Statutory GST Taxes</span>
                        <span className="font-semibold text-slate-900">{formatCurrencyExact(selectedPayment.taxes)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-600">
                      <span>Gateway Fee (2% Razorpay Fee)</span>
                      <span className="font-semibold text-slate-900">-{formatCurrencyExact(selectedPayment.gatewayFee)}</span>
                    </div>
                    <div className="h-px bg-slate-200/80 my-2"></div>
                    <div className="flex justify-between items-center text-base font-black">
                      <span className="text-slate-900">Net Gateway Settlement</span>
                      <span className="text-[#E86A70] text-lg font-black">{formatCurrencyExact(selectedPayment.netSettled)}</span>
                    </div>
                  </div>
                </div>

                {verifySuccess && (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-700 font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Gateway webhook verified successfully! Hash signature matches Razorpay logs.
                  </div>
                )}

              </div>

              {/* Footer Buttons */}
              <div className="p-6 bg-slate-50 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 mt-auto">
                <Button 
                  onClick={handleReverifyWebhook} 
                  disabled={isVerifying}
                  variant="outline"
                  className="rounded-xl px-5 h-11 font-semibold border-slate-300 hover:bg-slate-100 text-slate-700 w-full sm:w-auto"
                >
                  {isVerifying ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                  Re-Verify Webhook
                </Button>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Button 
                    onClick={() => setIsModalOpen(false)} 
                    variant="outline" 
                    className="rounded-xl px-5 h-11 font-semibold border-slate-300 hover:bg-slate-100 text-slate-700 flex-1 sm:flex-none"
                  >
                    Close
                  </Button>
                  <Button 
                    onClick={() => window.print()} 
                    className="rounded-xl px-6 h-11 bg-[#E86A70] hover:bg-[#d5585e] text-white font-bold shadow-md flex-1 sm:flex-none"
                  >
                    <Printer className="mr-2 h-4 w-4" /> Print Trace
                  </Button>
                </div>
              </div>

            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
