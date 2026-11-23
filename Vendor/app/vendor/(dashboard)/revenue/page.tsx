"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IndianRupee, Download, ArrowUpRight, Wallet } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Jan", revenue: 4000, profit: 2400 },
  { name: "Feb", revenue: 3000, profit: 1398 },
  { name: "Mar", revenue: 2000, profit: 9800 },
  { name: "Apr", revenue: 2780, profit: 3908 },
  { name: "May", revenue: 1890, profit: 4800 },
  { name: "Jun", revenue: 2390, profit: 3800 },
  { name: "Jul", revenue: 3490, profit: 4300 },
];

export default function RevenuePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-heading font-bold text-secondary">Revenue & Payouts</h2>
          <p className="text-slate-500 mt-1">Track your earnings, view analytics, and manage payouts.</p>
        </div>
        <Button variant="outline" className="border-slate-200 text-slate-600 gap-2">
          <Download className="w-4 h-4" />
          Export Report
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-0 shadow-sm ring-1 ring-slate-100 rounded-xl bg-linear-to-br from-primary to-rose-600 text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white/80 text-sm font-medium">Available Balance</p>
                <h3 className="text-4xl font-heading font-bold mt-2">₹12,450.00</h3>
              </div>
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Wallet className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-6">
              <Button className="w-full bg-white text-primary hover:bg-slate-50 font-bold">
                Withdraw Funds
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm ring-1 ring-slate-100 rounded-xl bg-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-sm font-medium">Pending Clearance</p>
                <h3 className="text-3xl font-heading font-bold text-secondary mt-2">₹3,240.00</h3>
              </div>
              <div className="p-3 bg-amber-50 text-amber-500 rounded-xl">
                <IndianRupee className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-6 flex items-center text-sm text-slate-500">
              Expected clearance in 2-3 business days
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm ring-1 ring-slate-100 rounded-xl bg-white overflow-hidden relative">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-sm font-medium">Total Earnings (YTD)</p>
                <h3 className="text-3xl font-heading font-bold text-secondary mt-2">₹84,320.00</h3>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-emerald-400/20 to-transparent rounded-full blur-2xl -mr-10 -mt-10" />
              <div className="p-3 bg-emerald-50 text-emerald-500 rounded-xl relative z-10">
                <IndianRupee className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-6 flex items-center text-sm text-emerald-600 font-medium">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              14% higher than last year
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm ring-1 ring-slate-100 rounded-xl bg-white overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50">
          <CardTitle className="text-lg font-heading font-semibold text-secondary">Earnings Overview</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-96 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="revenue" fill="#E86A70" radius={[4, 4, 0, 0]} name="Gross Revenue" />
                <Bar dataKey="profit" fill="#1F2E4A" radius={[4, 4, 0, 0]} name="Net Profit" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
