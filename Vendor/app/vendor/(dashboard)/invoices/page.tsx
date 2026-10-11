
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { useAuthStore } from "@/store/authStore";

const formatCurrency = (value: number) => {
  return `₹${Math.round(value).toLocaleString('en-IN')}`;
};

const STATUSES = [
  'Invoice Submitted',
  'Under Review',
  'Reconciliation Pending',
  'Approved for Payment',
  'Payment Initiated',
  'Paid',
  'Closed'
];

export default function VendorInvoicesPage() {
  const { user } = useAuthStore();
  
  const getBadgeStyles = (status: string) => {
    switch (status) {
      case 'Invoice Submitted': return 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-0';
      case 'Under Review': return 'bg-amber-100 text-amber-700 hover:bg-amber-200 border-0';
      case 'Reconciliation': return 'bg-orange-100 text-orange-700 hover:bg-orange-200 border-0';
      case 'Approved': return 'bg-lime-100 text-lime-700 hover:bg-lime-200 border-0';
      case 'Payment Initiated': return 'bg-[#e8f0fe] text-[#1a73e8] hover:bg-[#d2e3fc] border-0';
      case 'Paid': return 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0';
      case 'Closed': return 'bg-purple-100 text-purple-700 hover:bg-purple-200 border-0';
      default: return 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-0';
    }
  };
  
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
        if (user?.$id) { invs = invs.filter((inv: any) => inv.vendorId === user.$id); }
        setInvoices(invs);
      }
    } catch (error) {
      console.error("Failed to fetch invoices", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = () => {
    if (!exportStartDate || !exportEndDate) {
      setExportError('Please select both start and end dates');
      return;
    }
    const start = new Date(exportStartDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(exportEndDate);
    end.setHours(23, 59, 59, 999);

    const filtered = invoices.filter(inv => {
      // 1. Only allow Paid invoices
      if (inv.status !== 'Paid' && inv.status !== 'Approved for Payment') {
        return false;
      }
      
      // 2. Filter by date range
      const dStr = inv.issueDate || inv.createdAt;
      if (!dStr) return false;
      const d = new Date(dStr);
      return d >= start && d <= end;
    });
    if (filtered.length === 0) {
      setExportError('No paid invoices found in this date range');
      return;
    }
    const headers = ['Invoice No.', 'Invoice Date', 'Hotel', 'City', 'State', 'Taxable amount', 'GST', 'Net payable', 'Racoonn booking reference', 'Current status', 'Hotel Address', 'Hotel GSTIN'];
    
    const csvContent = [
      headers.join(','),
      ...filtered.map(inv => {
        const invoiceTotal = inv.invoiceTotal || inv.totalAmount || 0;
        const displayedNet = inv.netPayable !== undefined ? inv.netPayable : invoiceTotal;
        const nights = inv.nights || 1;
        const pricePerNight = invoiceTotal / nights;
        const gstRate = pricePerNight <= 7500 ? 0.05 : 0.18;
        const gstMultiplier = 1 + gstRate;
        const userPaysBase = Number((invoiceTotal / gstMultiplier).toFixed(2));
        const commission = inv.otaCommission !== undefined ? inv.otaCommission : Math.round(userPaysBase * 0.18);
        const taxable = Number((userPaysBase - commission).toFixed(2));
        const totalGst = Number((taxable * gstRate).toFixed(2));
        const finalNetPayable = taxable + totalGst;
        
        const parts = (inv.vendorAddress || '').split(',').map((s: string) => s.trim()).filter(Boolean);
        let city = inv.vendorCity || '';
        let state = inv.vendorState || '';
        if (!city || !state) {
           if (parts.length >= 3) {
             const hasPincode = /^\d{6}$/.test(parts[parts.length - 1]);
             if (hasPincode) {
                state = state || parts[parts.length - 2] || '';
                city = city || parts[parts.length - 3] || '';
             } else {
                state = state || parts[parts.length - 1] || '';
                city = city || parts[parts.length - 2] || '';
             }
           } else if (parts.length === 2) {
             state = state || parts[1] || '';
             city = city || parts[0] || '';
           }
        }
        
        return [
          `"${inv.invoiceNumber || inv.id?.slice(0,8) || ''}"`,
          `"${new Date(inv.issueDate || inv.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}"`,
          `"${inv.vendorBusiness || inv.vendorName || ''}"`,
          `"${city}"`,
          `"${state}"`,
          taxable,
          totalGst,
          finalNetPayable,
          `"${inv.bookingIds?.[0]?.substring(0,8) || 'N/A'}"`,
          `"${inv.status || 'Invoice Submitted'}"`,
          `"${inv.vendorAddress || ''}"`,
          `"${inv.vendorGstin || ''}"`
        ].join(',');
      })
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoices_${exportStartDate}_to_${exportEndDate}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setIsExportModalOpen(false);
  };

  const handleDownloadPdf = async (inv: any) => {
    setIsDownloading(inv.id);
    try {
      const doc = new jsPDF();
      doc.setFontSize(24);
      doc.setTextColor(0, 0, 0); 
      doc.text("TAX INVOICE", 14, 22);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text("Hotel Accommodation Services billed to OTA Platform - Racoonn", 14, 30);
      
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`Invoice No: ${inv.invoiceNumber || inv.id?.slice(0,8)}`, 14, 45);
      doc.text(`Date: ${inv.issueDate || new Date().toLocaleDateString()}`, 140, 45);
      doc.text(`Place of Supply: Uttarakhand (05)`, 140, 52);
  
      doc.setDrawColor(0, 0, 0);
      doc.line(14, 58, 196, 58); 
  
      doc.setFontSize(11);
      doc.text("From — Hotel / Service Provider", 14, 70);
      doc.setFontSize(10);
      doc.text(`${inv.vendorBusiness || inv.vendorName || "Vendor"}`, 14, 77);
      doc.text(`India`, 14, 84);
      doc.text(`Email: ${inv.vendorEmail || ""}`, 14, 91);
      const vendorAddressLines = doc.splitTextToSize(inv.vendorAddress || "", 90);
      doc.text(vendorAddressLines, 14, 98);
  
      doc.setFontSize(11);
      doc.text("Bill To — OTA / Aggregator", 110, 70);
      doc.setFontSize(10);
      doc.text(`CIELLE TRAVELS PRIVATE LIMITED`, 110, 77);
      const racoonnAddr = doc.splitTextToSize("B-81, Rose Villa, Samiah Lake City, Rudrapur, Uttarakhand", 85);
      doc.text(racoonnAddr, 110, 84);
      doc.text(`Email: info@racoonn.com`, 110, 94);
      doc.text(`GSTIN: 05AAOCC0859Q1Z0`, 110, 101);
  
      const invoiceTotal = inv.invoiceTotal || inv.totalAmount || 0;
      const displayedNet = inv.netPayable !== undefined ? inv.netPayable : invoiceTotal;
      const nights = inv.nights || 1;
      const pricePerNight = displayedNet / nights;
      const gstRate = pricePerNight <= 7500 ? 0.05 : 0.18;
      const gstMultiplier = 1 + gstRate;
      const taxable = Number((displayedNet / gstMultiplier).toFixed(2));
      const totalGst = Number((displayedNet - taxable).toFixed(2));
      
      autoTable(doc, {
        startY: 120,
        head: [["Description", "SAC", "Taxable Amount"]],
        body: [
          ["Room accommodation charges", "996311", `Rs. ${taxable.toFixed(2)}`]
        ],
        theme: "striped",
        headStyles: { fillColor: [225, 100, 100], textColor: 255, fontStyle: 'bold' }
      });
  
      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 15,
        head: [["GST Summary", "Amount"]],
        body: [
          ["Taxable Value", `Rs. ${taxable.toFixed(2)}`],
          [`IGST (${gstRate * 100}%)`, `Rs. ${totalGst.toFixed(2)}`],
          ["Net Payable (After Commission)", `Rs. ${(inv.netPayable !== undefined ? inv.netPayable : invoiceTotal).toFixed(2)}`]
        ],
        theme: "striped",
        headStyles: { fillColor: [180, 180, 180], textColor: 255, fontStyle: 'bold' }
      });
  
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      const finalY = (doc as any).lastAutoTable.finalY + 20;
      doc.text(
        "This invoice has been generated electronically through the Racoonn platform. It is valid without a physical signature, subject to applicable law\nand electronic authentication requirements.",
        14,
        finalY
      );
      doc.save(`Invoice-${inv.invoiceNumber || inv.id?.slice(0,8)}.pdf`);
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

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-medium tracking-tight">Invoice Overview</h2>
          <p className="text-muted-foreground mt-1">Track all submitted invoices, view details, and export reports.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => { setIsExportModalOpen(true); setExportError(''); }} variant="outline" className="h-10 rounded-full font-medium px-6 flex items-center gap-2">
            <Download className="w-4 h-4" /> Export Data
          </Button>
        </div>
      </div>

      <Card className="shadow-none border-gray-200">
        <div className="p-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="font-semibold text-lg">Recent Invoices</h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input 
                type="text" 
                placeholder="Search invoices..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-64 h-10 pl-9 pr-4 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-slate-300"
              />
            </div>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 pl-3 pr-8 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-slate-300 font-medium text-slate-700 bg-white"
            >
              <option value="All">All Statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow>
                <TableHead className="font-semibold">Invoice No.</TableHead>
                <TableHead className="font-semibold">Invoice Date</TableHead>
                <TableHead className="font-semibold">Hotel</TableHead>
                <TableHead className="font-semibold">Taxable amount</TableHead>
                <TableHead className="font-semibold">GST</TableHead>
                <TableHead className="font-semibold">Net payable</TableHead>
                <TableHead className="font-semibold">Racoonn booking reference</TableHead>
                <TableHead className="font-semibold">Current status</TableHead>
                <TableHead className="text-right font-semibold">Download invoice</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-32 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : filteredInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                    No invoices found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvoices.map((inv) => {
                  const invoiceTotal = inv.invoiceTotal || inv.totalAmount || 0;
                  const status = inv.status || 'Invoice Submitted';
                  const isPositive = status === 'Paid' || status === 'Approved for Payment';
                  const displayedNet = inv.netPayable !== undefined ? inv.netPayable : invoiceTotal;
                  
                  const nights = inv.nights || 1;
                  const pricePerNight = invoiceTotal / nights;
                  const gstRate = pricePerNight <= 7500 ? 0.05 : 0.18;
                  const gstMultiplier = 1 + gstRate;
                  
                  const userPaysBase = Number((invoiceTotal / gstMultiplier).toFixed(2));
                  const commission = inv.otaCommission !== undefined ? inv.otaCommission : Math.round(userPaysBase * 0.18);
                  
                  // Enforce formula: User Pays Base - Commission = Taxable Amount
                  const taxable = Number((userPaysBase - commission).toFixed(2));
                  const totalGst = Number((taxable * gstRate).toFixed(2));
                  const finalNetPayable = taxable + totalGst;
                  
                  const ref = inv.bookingIds && inv.bookingIds.length > 0 ? inv.bookingIds[0].substring(0,8) : "-";
                  
                  return (
                    <TableRow key={inv.id} className="hover:bg-gray-50/50 transition-colors group">
                      <TableCell className="font-medium text-muted-foreground text-sm">
                        {inv.invoiceNumber || inv.id.slice(0, 8)}
                      </TableCell>
                      <TableCell className="font-medium text-muted-foreground text-sm">
                        {new Date(inv.issueDate || inv.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </TableCell>
                      <TableCell className="font-medium">
                        {inv.vendorBusiness || inv.vendorName || "N/A"}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(taxable)}
                      </TableCell>
                      <TableCell className="font-medium text-slate-500">
                        {formatCurrency(totalGst)}
                      </TableCell>
                      <TableCell className={`font-bold ${isPositive ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {isPositive ? '+' : ''}{formatCurrency(finalNetPayable)}
                      </TableCell>
                      <TableCell className="font-medium text-muted-foreground">
                        {ref}
                      </TableCell>
                      <TableCell>
                        <div 
                          className="inline-block transition-opacity"
                        >
                          <Badge 
                            variant="secondary"
                            className={getBadgeStyles(status)}
                          >
                            {status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          onClick={() => handleDownloadPdf(inv)}
                          variant="ghost" 
                          size="sm"
                          disabled={isDownloading === inv.id}
                          className="h-8 px-3 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                        >
                          {isDownloading === inv.id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Export Modal */}
      <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Export Invoices</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">Select a date range to export all invoice data into a CSV file.</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <Input type="date" value={exportStartDate} onChange={(e) => setExportStartDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <Input type="date" value={exportEndDate} onChange={(e) => setExportEndDate(e.target.value)} />
              </div>
            </div>
            {exportError && <p className="text-sm font-medium text-destructive">{exportError}</p>}
          </div>
          <div className="flex justify-end gap-3 border-t pt-4">
            <Button variant="outline" onClick={() => setIsExportModalOpen(false)}>Cancel</Button>
            <Button onClick={handleExportData}>Download CSV</Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
