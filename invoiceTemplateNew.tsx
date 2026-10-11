"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
  Loader2,
  Download,
  Search,
  Filter,
  FileText,
  X,
  CreditCard,
  Building2,
  BadgeDollarSign,
  TrendingUp,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value || 0);
};

const statuses = [
  'Invoice Submitted',
  'Under Review',
  'Reconciliation Pending',
  'Approved for Payment',
  'Payment Initiated',
  'Paid',
  'Closed'
];

export default function CustomInvoicesPage({ isVendor = false, vendorId = "" }) {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Export Date Range
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');
  const [exportError, setExportError] = useState('');

  // Status Update Modal
  const [statusModalInv, setStatusModalInv] = useState<any>(null);
  const [newStatus, setNewStatus] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // PDF Loading
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/invoices");
      const data = await res.json();
      if (data.success && Array.isArray(data.invoices)) {
        let invs = data.invoices;
        if (isVendor && vendorId) {
          invs = invs.filter((inv: any) => inv.vendorId === vendorId);
        }
        setInvoices(invs);
      }
    } catch (error) {
      console.error("Failed to fetch invoices", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!statusModalInv || !newStatus) return;
    setIsUpdatingStatus(true);
    try {
      const res = await fetch('/api/invoices', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: statusModalInv.id, status: newStatus })
      });
      if (res.ok) {
        setInvoices(prev => prev.map(inv => inv.id === statusModalInv.id ? { ...inv, status: newStatus } : inv));
        setStatusModalInv(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleExportData = () => {
    if (!exportStartDate || !exportEndDate) {
      setExportError('Please select both start and end dates');
      return;
    }
    const filtered = invoices.filter(inv => {
      const dStr = inv.issueDate || inv.createdAt;
      if (!dStr) return false;
      const d = new Date(dStr);
      return d >= new Date(exportStartDate) && d <= new Date(exportEndDate);
    });
    if (filtered.length === 0) {
      setExportError('No invoices found in this date range');
      return;
    }
    const headers = ['Invoice No.', 'Hotel', 'Taxable amount', 'GST Amount', 'Net payable', 'Racoonn booking reference', 'Current status', 'Hotel Address', 'Hotel GSTIN'];
    
    const csvContent = [
      headers.join(','),
      ...filtered.map(inv => {
        const invoiceTotal = inv.invoiceTotal || inv.totalAmount || 0;
        const nights = inv.nights || 1;
        const pricePerNight = invoiceTotal / nights;
        const gstRate = pricePerNight <= 7500 ? 0.05 : 0.18;
        const gstMultiplier = 1 + gstRate;
        const taxable = inv.taxableValue || Number((invoiceTotal / gstMultiplier).toFixed(2));
        const totalGst = (inv.cgst || inv.sgst || inv.igst) ? (inv.cgst || 0) + (inv.sgst || 0) + (inv.igst || 0) : Number((invoiceTotal - taxable).toFixed(2));
        const platformFee = inv.otaCommission || inv.platformFeeAmount || 0;
        const net = inv.netPayable || (invoiceTotal - platformFee);
        
        return [
          \`"\${inv.invoiceNumber || inv.id?.slice(0,8) || ''}"\`,
          \`"\${inv.vendorBusiness || inv.vendorName || ''}"\`,
          taxable,
          totalGst,
          net,
          \`"\${inv.bookingIds?.[0]?.substring(0,8) || 'N/A'}"\`,
          \`"\${inv.status || 'Invoice Submitted'}"\`,
          \`"\${inv.vendorAddress || ''}"\`,
          \`"\${inv.vendorGstNumber || inv.vendorGstin || ''}"\`
        ].join(',');
      })
    ].join('\\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = \`invoices_\${exportStartDate}_to_\${exportEndDate}.csv\`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setIsExportModalOpen(false);
  };

  const handleDownloadPdf = async (inv: any) => {
    setIsDownloading(inv.id);
    try {
      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.setTextColor(225, 29, 72); 
      doc.text("Racoonn Platform", 14, 22);
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text("Tax Invoice", 14, 30);
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(\`Invoice No.: \${inv.invoiceNumber || inv.id?.slice(0,8)}\`, 14, 45);
      doc.text(\`Hotel: \${inv.vendorBusiness || inv.vendorName}\`, 14, 52);
      doc.text(\`Racoonn booking reference: \${inv.bookingIds?.[0]?.substring(0,8) || 'N/A'}\`, 14, 59);
      doc.text(\`Current status: \${inv.status || 'Invoice Submitted'}\`, 14, 66);
      
      const vendorAddrLines = doc.splitTextToSize(inv.vendorAddress || "Vendor Address", 85);
      doc.text(vendorAddrLines, 14, 75);
      
      const invoiceTotal = inv.invoiceTotal || inv.totalAmount || 0;
      const nights = inv.nights || 1;
      const pricePerNight = invoiceTotal / nights;
      const gstRate = pricePerNight <= 7500 ? 0.05 : 0.18;
      const gstMultiplier = 1 + gstRate;
      const taxable = inv.taxableValue || Number((invoiceTotal / gstMultiplier).toFixed(2));
      const platformFee = inv.otaCommission || inv.platformFeeAmount || 0;
      const netPayout = inv.netPayable || (invoiceTotal - platformFee);
      const cgst = inv.cgst || (invoiceTotal - taxable)/2;
      const sgst = inv.sgst || (invoiceTotal - taxable)/2;
      const igst = inv.igst || 0;
      
      autoTable(doc, {
        startY: 95,
        head: [['Description', 'Amount']],
        body: [
          ['Taxable amount', formatCurrency(taxable)],
          [\`CGST (\${(gstRate*100)/2}%)\`, formatCurrency(cgst)],
          [\`SGST (\${(gstRate*100)/2}%)\`, formatCurrency(sgst)],
          ['IGST', formatCurrency(igst)],
          ['Net payable', formatCurrency(netPayout)],
        ],
        theme: 'striped',
        headStyles: { fillColor: [232, 106, 112] },
      });
      
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      const finalY = (doc as any).lastAutoTable.finalY || 150;
      doc.text(
        "This invoice has been generated electronically through the Racoonn platform. It is valid without a physical signature, subject to applicable law and electronic authentication requirements.",
        14,
        finalY + 20,
        { maxWidth: 180 }
      );
      
      doc.save(\`Invoice-\${inv.invoiceNumber || inv.id?.slice(0,8)}.pdf\`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDownloading(null);
    }
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      if (statusFilter !== 'All' && (inv.status || 'Invoice Submitted') !== statusFilter) {
        return false;
      }
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (inv.invoiceNumber?.toLowerCase()?.includes(q) || inv.bookingIds?.[0]?.toLowerCase()?.includes(q) || inv.vendorName?.toLowerCase()?.includes(q) || inv.vendorBusiness?.toLowerCase()?.includes(q));
    }).sort((a, b) => new Date(b.createdAt || b.issueDate || 0).getTime() - new Date(a.createdAt || a.issueDate || 0).getTime());
  }, [invoices, searchQuery, statusFilter]);

  const totalInvoices = filteredInvoices.length;
  const totalTaxable = filteredInvoices.reduce((acc, inv) => {
    const it = inv.invoiceTotal || inv.totalAmount || 0;
    const n = inv.nights || 1;
    const rate = (it / n) <= 7500 ? 0.05 : 0.18;
    return acc + (inv.taxableValue || (it / (1 + rate)));
  }, 0);
  
  const totalNet = filteredInvoices.reduce((acc, inv) => {
    const it = inv.invoiceTotal || inv.totalAmount || 0;
    const fee = inv.otaCommission || inv.platformFeeAmount || 0;
    return acc + (inv.netPayable || (it - fee));
  }, 0);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 bg-slate-50/30 min-h-screen">
      {/* Header section matching Revenue Overview */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Invoice Overview
          </h1>
          <p className="text-slate-500 mt-1">
            Track all submitted invoices, view details, and export reports.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button onClick={() => { setIsExportModalOpen(true); setExportError(''); }} variant="outline" className="h-10 px-4 rounded-xl border-slate-200 text-slate-700 font-semibold gap-2 whitespace-nowrap">
            <Download className="w-4 h-4" /> Export Data
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="rounded-3xl border border-gray-200 shadow-sm bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Invoices</span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">
              {totalInvoices}
            </div>
            <div className="flex items-center text-xs font-semibold text-emerald-600 mt-2">
              <TrendingUp className="w-3 h-3 mr-1" />
              All time records
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-gray-200 shadow-sm bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Taxable</span>
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                <BadgeDollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">
              {formatCurrency(totalTaxable)}
            </div>
            <div className="flex items-center text-xs font-semibold text-purple-600 mt-2">
              <TrendingUp className="w-3 h-3 mr-1" />
              Before GST & Fees
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-gray-200 shadow-sm bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Net Payable</span>
              <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">
              {formatCurrency(totalNet)}
            </div>
            <div className="flex items-center text-xs font-semibold text-rose-600 mt-2">
              <TrendingUp className="w-3 h-3 mr-1" />
              Vendor Payout Amount
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="rounded-3xl border border-gray-200 shadow-sm bg-white overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <h2 className="text-lg font-extrabold text-slate-900">Recent Invoices</h2>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input 
                type="text" 
                placeholder="Search by ID or Hotel..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#E86A70]/20"
              />
            </div>
            <div className="relative w-full md:w-auto">
              <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-3 z-10" />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full md:w-auto h-10 pl-9 pr-8 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#E86A70]/20 appearance-none font-medium text-slate-700 relative z-0"
              >
                <option value="All">All Statuses</option>
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="border-b border-gray-100 hover:bg-transparent">
                  <TableHead className="font-semibold h-12">Invoice No.</TableHead>
                  <TableHead className="font-semibold h-12">Hotel</TableHead>
                  <TableHead className="font-semibold h-12">Taxable amount</TableHead>
                  <TableHead className="font-semibold h-12">GST Amount</TableHead>
                  <TableHead className="font-semibold h-12">Net payable</TableHead>
                  <TableHead className="font-semibold h-12">Booking Ref.</TableHead>
                  <TableHead className="font-semibold h-12">Status</TableHead>
                  <TableHead className="text-right font-semibold h-12">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" />
                    </TableCell>
                  </TableRow>
                ) : filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                      No invoices found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((inv) => {
                    const invoiceTotal = inv.invoiceTotal || inv.totalAmount || 0;
                    const nights = inv.nights || 1;
                    const pricePerNight = invoiceTotal / nights;
                    const gstRate = pricePerNight <= 7500 ? 0.05 : 0.18;
                    const gstMultiplier = 1 + gstRate;
                    
                    const taxable = inv.taxableValue || Number((invoiceTotal / gstMultiplier).toFixed(2));
                    const totalGst = (inv.cgst || inv.sgst || inv.igst) ? (inv.cgst || 0) + (inv.sgst || 0) + (inv.igst || 0) : Number((invoiceTotal - taxable).toFixed(2));
                    const platformFee = inv.otaCommission || inv.platformFeeAmount || 0;
                    const net = inv.netPayable || (invoiceTotal - platformFee);
                    
                    const ref = inv.bookingIds && inv.bookingIds.length > 0 ? inv.bookingIds[0].substring(0,8) : "-";
                    const status = inv.status || 'Invoice Submitted';
                    const isPositive = status === 'Paid' || status === 'Approved for Payment';
                    
                    return (
                      <TableRow key={inv.id} className="hover:bg-muted/30 transition-colors group">
                        <TableCell className="font-medium font-mono text-xs text-foreground">
                          {inv.invoiceNumber || inv.id.slice(0, 8)}
                        </TableCell>
                        <TableCell className="font-medium text-muted-foreground">
                          {inv.vendorBusiness || inv.vendorName || "N/A"}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(taxable)}
                        </TableCell>
                        <TableCell className="font-medium text-slate-500">
                          {formatCurrency(totalGst)}
                        </TableCell>
                        <TableCell className={\`font-bold \${isPositive ? 'text-emerald-600' : 'text-slate-700'}\`}>
                          {isPositive ? '+' : ''}{formatCurrency(net)}
                        </TableCell>
                        <TableCell className="font-medium text-muted-foreground">
                          {ref}
                        </TableCell>
                        <TableCell>
                          <div 
                            onClick={() => { setStatusModalInv(inv); setNewStatus(status); }}
                            className="cursor-pointer inline-block hover:opacity-80 transition-opacity"
                          >
                            <Badge 
                              variant={isPositive ? "default" : "secondary"}
                              className={isPositive ? "bg-rose-500/10 text-rose-600 border-rose-500/20" : "bg-slate-100 text-slate-600"}
                            >
                              {status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            onClick={() => handleDownloadPdf(inv)}
                            variant="outline" 
                            size="sm"
                            disabled={isDownloading === inv.id}
                            className="h-8 rounded-full px-4 text-xs font-semibold bg-[#E86A70]/10 text-[#E86A70] hover:bg-[#E86A70]/20 border-transparent shadow-none"
                          >
                            {isDownloading === inv.id ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Download className="w-3.5 h-3.5 mr-1.5" />}
                            Download
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Export Modal */}
      <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
        <DialogContent className="sm:max-w-md bg-white p-0 overflow-hidden rounded-2xl">
          <DialogHeader className="p-6 border-b border-slate-100">
            <DialogTitle className="text-xl font-bold text-slate-800">Export Invoices</DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-4">
            <p className="text-sm text-slate-500">Select a date range to export all invoice data into a CSV file.</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Start Date</label>
                <input type="date" value={exportStartDate} onChange={(e) => setExportStartDate(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#E86A70]" />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1.5 block">End Date</label>
                <input type="date" value={exportEndDate} onChange={(e) => setExportEndDate(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#E86A70]" />
              </div>
            </div>
            {exportError && <p className="text-sm font-medium text-rose-500 bg-rose-50 px-3 py-2 rounded-lg">{exportError}</p>}
          </div>
          <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsExportModalOpen(false)} className="font-semibold text-slate-600 hover:bg-slate-200">Cancel</Button>
            <Button onClick={handleExportData} className="bg-[#E86A70] hover:bg-[#D65A60] text-white font-semibold shadow-sm">
              <Download className="w-4 h-4 mr-2" /> Download CSV
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Update Status Modal */}
      {statusModalInv && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-100">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-800">Update Status</h3>
              <button onClick={() => setStatusModalInv(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-500">
                Update the status for Invoice <strong>{statusModalInv.invoiceNumber || statusModalInv.id?.slice(0, 8)}</strong>.
              </p>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1.5 block">New Status</label>
                <select 
                  value={newStatus} 
                  onChange={e => setNewStatus(e.target.value)} 
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:outline-none focus:border-[#E86A70] bg-white text-sm"
                >
                  <option value="">Select Status</option>
                  {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setStatusModalInv(null)} className="font-semibold text-slate-600 hover:bg-slate-200">Cancel</Button>
              <Button onClick={handleUpdateStatus} disabled={!newStatus || isUpdatingStatus} className="bg-[#E86A70] hover:bg-[#D65A60] text-white font-semibold">
                {isUpdatingStatus ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Confirm Update
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
