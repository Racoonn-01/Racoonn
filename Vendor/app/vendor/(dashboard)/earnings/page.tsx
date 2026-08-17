"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IndianRupee, Download, ArrowUpRight, Wallet, TrendingUp, Calendar as CalendarIcon, FileText, CheckCircle2, Clock } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

import { useEffect, useState } from "react";
import { databases, appwriteConfig } from "@/lib/appwrite/client";
import { Query } from "appwrite";
import { useAuthStore } from "@/store/authStore";
import { jsPDF } from "jspdf";

export default function EarningsPage() {
  const { user } = useAuthStore();
  const [dateFilter, setDateFilter] = useState("");
  const [netEarnings, setNetEarnings] = useState(0);
  const [upcomingPayout, setUpcomingPayout] = useState(0);
  const [pendingClearance, setPendingClearance] = useState(0);
  const [revenueData, setRevenueData] = useState([
    { name: "Jan", amount: 0 },
    { name: "Feb", amount: 0 },
    { name: "Mar", amount: 0 },
    { name: "Apr", amount: 0 },
    { name: "May", amount: 0 },
    { name: "Jun", amount: 0 },
    { name: "Jul", amount: 0 },
  ]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    const fetchEarningsData = async () => {
      if (!user) return;
      try {
        // Fetch bookings
        const propertiesRes = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.propertyCollectionId || "Properties",
          [Query.equal("vendorId", user.$id)]
        );
        const vendorPropertyIds = propertiesRes.documents.map((p: any) => p.$id);

        const bookingsRes = await databases.listDocuments(
          appwriteConfig.databaseId,
          "bookings"
        );
        const allBookings = bookingsRes.documents.filter(b => vendorPropertyIds.includes(b.hotelId));
        
        // Fetch payments
        const paymentsRes = await databases.listDocuments(
          appwriteConfig.databaseId,
          "booking_payments"
        );
        
        // Fetch guests
        const guestsRes = await databases.listDocuments(
          appwriteConfig.databaseId,
          "booking_guests"
        );

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        let net = 0;
        let upcoming = 0;
        let pending = 0;
        
        const mappedBookings = allBookings.map((b: any) => {
          const payment = paymentsRes.documents.find(p => p.bookingId === b.$id);
          const guest = guestsRes.documents.find(g => g.bookingId === b.$id);
          const totalAmt = payment ? Number(payment.totalAmount) : 0;
          const commission = Math.round(totalAmt * 0.1); // 10% platform fee
          const netAmt = totalAmt - commission;
          
          const checkInDate = new Date(b.checkIn);
          const checkOutDate = new Date(b.checkOut);
          const isCurrentMonth = checkInDate.getMonth() === currentMonth && checkInDate.getFullYear() === currentYear;
          
          if (b.status === 'Completed' && isCurrentMonth) {
            net += netAmt;
          }
          if (b.status === 'Confirmed' && checkInDate > now) {
            upcoming += netAmt;
          }
          if (b.status === 'Completed' && checkOutDate <= now) {
            pending += netAmt;
          }

          return {
            id: b.$id,
            guest: guest ? `${guest.firstName} ${guest.lastName}` : 'Unknown',
            dates: `${new Date(b.checkIn).toLocaleDateString()} - ${new Date(b.checkOut).toLocaleDateString()}`,
            total: `₹${totalAmt.toLocaleString()}`,
            commission: `₹${commission.toLocaleString()}`,
            net: `₹${netAmt.toLocaleString()}`,
            rawNet: netAmt,
            createdAt: b.$createdAt
          };
        });

        // Map to charts (last 7 months)
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const newChartData: Array<{ name: string; amount: number; month: number; year: number }> = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          newChartData.push({ name: monthNames[d.getMonth()], amount: 0, month: d.getMonth(), year: d.getFullYear() });
        }

        allBookings.forEach((b: any) => {
          if (b.status !== 'Cancelled') {
            const payment = paymentsRes.documents.find(p => p.bookingId === b.$id);
            if (payment) {
              const date = new Date(b.$createdAt);
              const chartItem = newChartData.find(item => item.month === date.getMonth() && item.year === date.getFullYear());
              if (chartItem) {
                chartItem.amount += Number(payment.totalAmount);
              }
            }
          }
        });

        setNetEarnings(net);
        setUpcomingPayout(upcoming);
        setPendingClearance(pending);
        setBookings(mappedBookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        
        // Ensure chart data matches Recharts expectation
        setRevenueData(newChartData.map(d => ({ name: d.name, amount: d.amount })));
        
        // Payouts (mocked from bookings since no payouts collection exists)
        setPayouts(mappedBookings.filter(b => b.rawNet > 0).slice(0, 5).map(b => ({
          id: `PO-${b.id.substring(0, 6).toUpperCase()}`,
          date: new Date(b.createdAt).toLocaleDateString(),
          period: 'Weekly',
          amount: b.net,
          status: 'Processed'
        })));

      } catch (err) {
        console.error("Failed to load earnings data", err);
      }
    };
    fetchEarningsData();
  }, [user]);

  const handleDownloadStatement = () => {
    // Generate CSV
    const headers = ["Booking ID", "Guest", "Dates", "Total Price", "Platform Fee", "Net Earnings"];
    const csvContent = [
      headers.join(","),
      ...bookings.map(b => `"${b.id}","${b.guest}","${b.dates}","${b.total}","${b.commission}","${b.net}"`)
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `earnings_statement_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const handleDownloadInvoice = (payout: any) => {
    const doc = new jsPDF();
    
    // Convert '₹' to 'Rs.' since jsPDF standard fonts don't render ₹ well
    const formattedAmount = payout.amount.replace('₹', 'Rs. ');
    
    // Add Racoonn Logo Image
    const img = new Image();
    img.src = '/racoonn-logo-text.png'; 
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL("image/png");
        // Logo top left
        doc.addImage(dataUrl, 'PNG', 15, 15, 40, (40 * img.height) / img.width);
      }
      
      // Top Right Company Details
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.setFont("helvetica", "normal");
      doc.text("Racoonn Platform", 195, 20, { align: "right" });
      doc.text("support@racoonn.com", 195, 25, { align: "right" });
      doc.text("+91 80000 00000", 195, 30, { align: "right" });
      
      // Invoice Title & Badge
      doc.setFontSize(24);
      doc.setTextColor(31, 46, 74);
      doc.setFont("helvetica", "bold");
      doc.text("PAYOUT STATEMENT", 15, 55);
      
      // Status Badge
      const statusX = doc.getTextWidth("PAYOUT STATEMENT") + 25;
      doc.setFontSize(10);
      doc.setFillColor(payout.status === 'Processed' ? 209 : 219, payout.status === 'Processed' ? 250 : 234, payout.status === 'Processed' ? 229 : 254);
      doc.setTextColor(payout.status === 'Processed' ? 6 : 37, payout.status === 'Processed' ? 95 : 99, payout.status === 'Processed' ? 70 : 235);
      doc.roundedRect(statusX, 47, doc.getTextWidth(payout.status.toUpperCase()) + 10, 8, 2, 2, 'F');
      doc.text(payout.status.toUpperCase(), statusX + 5, 52.5);
      
      // Divider
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(15, 65, 195, 65);
      
      // Statement Info Grid
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.setFont("helvetica", "bold");
      doc.text("PAYOUT ID", 15, 80);
      doc.text("DATE ISSUED", 75, 80);
      doc.text("PAYOUT PERIOD", 135, 80);
      
      doc.setFont("helvetica", "normal");
      doc.setTextColor(15, 23, 42);
      doc.text(payout.id, 15, 88);
      doc.text(payout.date, 75, 88);
      doc.text(payout.period, 135, 88);
      
      // Secondary Divider
      doc.line(15, 100, 195, 100);
      
      // Account Details (Host)
      doc.setFont("helvetica", "bold");
      doc.setTextColor(100, 116, 139);
      doc.text("ISSUED TO:", 15, 115);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(15, 23, 42);
      doc.text(user?.name || "Host Partner", 15, 122);
      doc.text(user?.email || "", 15, 128);
      
      // Amount Section Card
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(15, 145, 180, 50, 4, 4, 'F');
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(100, 116, 139);
      doc.text("Total Payout Amount", 25, 160);
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(32);
      doc.setTextColor(31, 46, 74);
      doc.text(formattedAmount, 25, 178);
      
      // Disclaimer
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text("This payout includes all earnings from check-outs during the statement period,", 15, 210);
      doc.text("minus the standard platform service fees.", 15, 215);
      
      // Footer
      doc.setDrawColor(226, 232, 240);
      doc.line(15, 275, 195, 275);
      doc.setFont("helvetica", "italic");
      doc.text("This is an auto-generated statement by the Racoonn Platform. For any queries, contact support.", 105, 285, { align: "center" });

      doc.save(`Racoonn_Payout_${payout.id}.pdf`);
    };
    
    img.onerror = () => {
      doc.setFontSize(22);
      doc.text("RACOONN PAYOUT STATEMENT", 15, 30);
      doc.save(`Racoonn_Payout_${payout.id}.pdf`);
    };
  };


  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h2 className="text-3xl font-heading font-bold text-secondary">Earnings & Payouts</h2>
            <p className="text-slate-500 mt-1">Track your revenue, view payouts, and download invoices.</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 w-full md:w-auto"
              title="Filter by Date"
            />
            <Button onClick={handleDownloadStatement} className="bg-[#1F2E4A] hover:bg-[#151E2D] text-white rounded-xl shadow-sm gap-2 whitespace-nowrap">
              <Download className="w-4 h-4" /> Download Statement
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-0 shadow-sm ring-1 ring-slate-100 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -mr-8 -mt-8" />
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Wallet className="w-6 h-6" />
              </div>
              <span className="flex items-center text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md font-medium text-xs">
                <ArrowUpRight className="w-3 h-3 mr-1" /> 14%
              </span>
            </div>
            <h3 className="text-slate-500 font-medium text-sm">Net Earnings (This Month)</h3>
            <p className="text-3xl font-heading font-bold text-secondary mt-1">₹{netEarnings.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm ring-1 ring-slate-100 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl -mr-8 -mt-8" />
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-slate-500 font-medium text-sm">Upcoming Payout</h3>
            <p className="text-3xl font-heading font-bold text-secondary mt-1">₹{upcomingPayout.toLocaleString()}</p>
            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
              <CalendarIcon className="w-3 h-3" /> Scheduled for Nov 01
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm ring-1 ring-slate-100 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl -mr-8 -mt-8" />
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <IndianRupee className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-slate-500 font-medium text-sm">Pending Clearance</h3>
            <p className="text-3xl font-heading font-bold text-secondary mt-1">₹{pendingClearance.toLocaleString()}</p>
            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
              <Clock className="w-3 h-3" /> From recently checked-out guests
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-slate-100/80 p-1.5 rounded-xl w-full justify-start overflow-x-auto h-auto inline-flex gap-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm text-slate-500 rounded-lg py-2.5 px-5 flex items-center gap-2.5 font-medium transition-all">
            <TrendingUp className="w-4 h-4" /> Overview
          </TabsTrigger>
          <TabsTrigger value="payouts" className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm text-slate-500 rounded-lg py-2.5 px-5 flex items-center gap-2.5 font-medium transition-all">
            <Wallet className="w-4 h-4" /> Payout History
          </TabsTrigger>
          <TabsTrigger value="bookings" className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm text-slate-500 rounded-lg py-2.5 px-5 flex items-center gap-2.5 font-medium transition-all">
            <FileText className="w-4 h-4" /> Booking Earnings
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="overview" className="space-y-6 outline-none">
            <Card className="border-0 shadow-sm ring-1 ring-slate-100 rounded-2xl overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4 pt-6 px-6">
                <CardTitle className="font-heading text-xl">Revenue Trend</CardTitle>
                <CardDescription className="text-slate-500">Your net earnings over the last 7 months.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} width={60} />
                      <Tooltip cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorEarnings)" activeDot={{ r: 6, fill: '#10b981' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payouts" className="space-y-6 outline-none">
            <Card className="border-0 shadow-sm ring-1 ring-slate-100 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100 text-xs uppercase tracking-wider font-semibold text-slate-500">
                      <th className="p-4 pl-6 font-medium">Payout ID</th>
                      <th className="p-4 font-medium">Date</th>
                      <th className="p-4 font-medium">Period</th>
                      <th className="p-4 font-medium">Amount</th>
                      <th className="p-4 font-medium">Status</th>
                      <th className="p-4 pr-6 font-medium text-right">Invoice</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {payouts.filter(p => !dateFilter || (new Date(p.date).toISOString().startsWith(dateFilter))).length > 0 ? (
                      payouts.filter(p => !dateFilter || (new Date(p.date).toISOString().startsWith(dateFilter))).map((payout) => (
                        <tr key={payout.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-4 pl-6 font-mono font-medium text-slate-600">{payout.id}</td>
                          <td className="p-4 text-slate-600 font-medium">{payout.date}</td>
                          <td className="p-4 text-slate-500">{payout.period}</td>
                          <td className="p-4 font-bold text-secondary">{payout.amount}</td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide ${payout.status === 'Processed' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                              {payout.status === 'Processed' && <CheckCircle2 className="w-3 h-3" />}
                              {payout.status}
                            </span>
                          </td>
                          <td className="p-4 pr-6 text-right">
                            <Button onClick={() => handleDownloadInvoice(payout)} variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10">
                              <Download className="w-4 h-4 mr-1.5" /> PDF
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-16 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                              <Wallet className="h-8 w-8 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-heading font-semibold text-secondary">No payouts yet</h3>
                            <p className="text-slate-500 mt-1">Your payout history will appear here once your earnings are processed.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6 outline-none">
            <Card className="border-0 shadow-sm ring-1 ring-slate-100 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100 text-xs uppercase tracking-wider font-semibold text-slate-500">
                      <th className="p-4 pl-6 font-medium">Booking ID</th>
                      <th className="p-4 font-medium">Guest</th>
                      <th className="p-4 font-medium">Dates</th>
                      <th className="p-4 font-medium">Total Price</th>
                      <th className="p-4 font-medium">Platform Fee</th>
                      <th className="p-4 font-medium">Your Earnings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {bookings.filter((b) => !dateFilter || b.createdAt.startsWith(dateFilter)).length > 0 ? (
                      bookings.filter((b) => !dateFilter || b.createdAt.startsWith(dateFilter)).map((booking) => (
                        <tr key={booking.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-4 pl-6 font-mono font-medium text-slate-600">{booking.id}</td>
                          <td className="p-4 font-semibold text-secondary">{booking.guest}</td>
                          <td className="p-4 text-slate-500">{booking.dates}</td>
                          <td className="p-4 text-slate-600">{booking.total}</td>
                          <td className="p-4 text-slate-500">{booking.commission}</td>
                          <td className="p-4 font-bold text-secondary">{booking.net}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-16 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                              <FileText className="h-8 w-8 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-heading font-semibold text-secondary">No earnings yet</h3>
                            <p className="text-slate-500 mt-1">Earnings from bookings will appear here after guests check out.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
