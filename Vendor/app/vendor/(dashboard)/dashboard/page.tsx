"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, CalendarCheck, IndianRupee, Percent, Star, Clock, ArrowUpRight, ArrowDownRight, MoreHorizontal, CalendarIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { databases, appwriteConfig, client } from "@/lib/appwrite/client";
import { Query } from "appwrite";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";



const stats = [
  {
    title: "Total Properties",
    value: "0",
    icon: Building2,
    trend: "0 added this month",
    trendPositive: true,
    colorClass: "text-indigo-600",
    bgClass: "bg-indigo-50",
  },
  {
    title: "Total Bookings",
    value: "0",
    icon: CalendarCheck,
    trend: "0% vs last month",
    trendPositive: true,
    colorClass: "text-emerald-600",
    bgClass: "bg-emerald-50",
  },
  {
    title: "Monthly Revenue",
    value: "₹0",
    icon: IndianRupee,
    trend: "0% vs last month",
    trendPositive: true,
    colorClass: "text-amber-600",
    bgClass: "bg-amber-50",
  },
  {
    title: "Occupancy Rate",
    value: "0%",
    icon: Percent,
    trend: "0% vs last month",
    trendPositive: true,
    colorClass: "text-violet-600",
    bgClass: "bg-violet-50",
  },
  {
    title: "Average Rating",
    value: "0.0",
    icon: Star,
    trend: "0.0 vs last month",
    trendPositive: true,
    colorClass: "text-orange-600",
    bgClass: "bg-orange-50",
  },
  {
    title: "Pending Check-ins",
    value: "0",
    icon: Clock,
    trend: "No pending check-ins",
    trendPositive: true,
    colorClass: "text-sky-600",
    bgClass: "bg-sky-50",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-100 ring-1 ring-slate-900/5 min-w-30">
        <p className="text-sm font-bold text-slate-400 mb-1">{label}</p>
        <p className="text-2xl font-black text-[#E86A70]">
          ₹{payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

const avatarColors = [
  "bg-indigo-50 text-indigo-600",
  "bg-emerald-50 text-emerald-600",
  "bg-amber-50 text-amber-600",
  "bg-violet-50 text-violet-600",
  "bg-sky-50 text-sky-600"
];

export default function DashboardOverview() {
  const { user } = useAuthStore();
  const [propertyCount, setPropertyCount] = useState<number>(0);
  const [totalBookings, setTotalBookings] = useState<number>(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState<number>(0);
  const [pendingCheckins, setPendingCheckins] = useState<number>(0);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [timeframe, setTimeframe] = useState<string>("today");
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [chartData, setChartData] = useState([
    { name: "Mon", total: 0 },
    { name: "Tue", total: 0 },
    { name: "Wed", total: 0 },
    { name: "Thu", total: 0 },
    { name: "Fri", total: 0 },
    { name: "Sat", total: 0 },
    { name: "Sun", total: 0 },
  ]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      try {
        const isWithinTimeframe = (dateString: string, tf: string) => {
          if (tf === 'all-time') return true;
          const date = new Date(dateString);
          const now = new Date();
          if (tf === 'today') {
            return date.toDateString() === now.toDateString();
          } else if (tf === 'weekly') {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return date >= weekAgo;
          } else if (tf === 'monthly') {
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return date >= monthAgo;
          } else if (tf === 'yearly') {
            const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            return date >= yearAgo;
          }
          return true;
        };

        // Fetch properties
        const propsRes = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.propertyCollectionId,
          [Query.equal("vendorId", user.$id)]
        );
        setPropertyCount(propsRes.total || propsRes.documents.length);
        const vendorPropertyIds = propsRes.documents.map((p: any) => p.$id);

        // Fetch bookings
        const bookingsRes = await databases.listDocuments(
          appwriteConfig.databaseId,
          "bookings"
        );
        const bookings = bookingsRes.documents.filter((b: any) => vendorPropertyIds.includes(b.hotelId) && isWithinTimeframe(b.$createdAt, timeframe));
        setTotalBookings(bookings.length);

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

        // Fetch reviews
        const reviewsRes = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.reviewCollectionId || "reviews",
          [Query.equal("vendorId", user.$id)]
        );
        const reviews = reviewsRes.documents.filter((r: any) => isWithinTimeframe(r.$createdAt, timeframe));
        let avgRating = 0;
        if (reviews.length > 0) {
          const sum = reviews.reduce((acc: number, r: any) => acc + (r.rating || 5), 0);
          avgRating = sum / reviews.length;
        }
        
        let revenue = 0;
        let pending = 0;
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const newChartData = [
          { name: "Mon", total: 0 },
          { name: "Tue", total: 0 },
          { name: "Wed", total: 0 },
          { name: "Thu", total: 0 },
          { name: "Fri", total: 0 },
          { name: "Sat", total: 0 },
          { name: "Sun", total: 0 },
        ];

        bookings.forEach(booking => {
          // Calculate revenue only if the booking is not cancelled
          if (booking.status !== 'Cancelled') {
            const payment = paymentsRes.documents.find(p => p.bookingId === booking.$id);
            if (payment && payment.totalAmount) {
              const amount = Number(payment.totalAmount);
              revenue += amount;
              
              const date = new Date(booking.$createdAt);
              const dayName = days[date.getDay()];
              const dayData = newChartData.find(d => d.name === dayName);
              if (dayData) {
                dayData.total += amount;
              }
            }
          }
          
          // Calculate pending check-ins
          if (booking.status === 'Confirmed' && new Date(booking.checkIn) > new Date()) {
            pending++;
          }
        });

        // Map recent bookings
        const mappedRecentBookings = bookings
          .sort((a, b) => new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime())
          .slice(0, 5)
          .map(booking => {
            const guest = guestsRes.documents.find(g => g.bookingId === booking.$id);
            const payment = paymentsRes.documents.find(p => p.bookingId === booking.$id);
            return {
              id: booking.$id,
              guestName: guest ? `${guest.firstName} ${guest.lastName}` : 'Unknown',
              property: booking.hotelName || 'Property',
              amount: payment ? `₹${payment.totalAmount}` : '₹0',
              status: booking.status
            };
          });

        setMonthlyRevenue(revenue);
        setPendingCheckins(pending);
        setAverageRating(avgRating);
        setRecentBookings(mappedRecentBookings);
        setChartData(newChartData);

      } catch (error) {
        console.error("Dashboard fetch error:", error);
      }
    };

    fetchDashboardData();

    // Subscribe to realtime updates for bookings
    const unsubscribe = client.subscribe(
      `databases.${appwriteConfig.databaseId}.collections.bookings.documents`,
      (response) => {
        // When a booking is created, updated, or deleted, re-fetch the data instantly
        fetchDashboardData();
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user, timeframe]);

  // Update stats array dynamically based on fetched data
  const dynamicStats = stats.map(stat => {
    if (stat.title === "Total Properties") {
      return { ...stat, value: propertyCount.toString() };
    }
    if (stat.title === "Total Bookings") {
      return { ...stat, value: totalBookings.toString() };
    }
    if (stat.title === "Monthly Revenue") {
      return { ...stat, value: `₹${monthlyRevenue.toLocaleString()}` };
    }
    if (stat.title === "Pending Check-ins") {
      return { ...stat, value: pendingCheckins.toString() };
    }
    if (stat.title === "Average Rating") {
      return { ...stat, value: averageRating.toFixed(1) };
    }
    return stat;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <div className="w-44">
          <Select value={timeframe} onValueChange={(val) => val && setTimeframe(val)}>
            <SelectTrigger className="h-10 bg-white border-slate-200 font-semibold text-slate-700 shadow-sm rounded-xl focus:ring-2 focus:ring-[#E86A70]/20 focus:border-[#E86A70]">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-slate-400" />
                <SelectValue placeholder="Select timeframe" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200" alignItemWithTrigger={false}>
              <SelectItem value="today" className="font-medium cursor-pointer rounded-lg">Today</SelectItem>
              <SelectItem value="weekly" className="font-medium cursor-pointer rounded-lg">This Week</SelectItem>
              <SelectItem value="monthly" className="font-medium cursor-pointer rounded-lg">This Month</SelectItem>
              <SelectItem value="yearly" className="font-medium cursor-pointer rounded-lg">This Year</SelectItem>
              <SelectItem value="all-time" className="font-medium cursor-pointer rounded-lg">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {dynamicStats.map((stat) => (
          <motion.div key={stat.title} variants={item}>
            <Card className="border-0 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-white ring-1 ring-slate-100 rounded-xl overflow-hidden group cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-3xl font-heading font-bold text-secondary tracking-tight">{stat.value}</h3>
                    </div>
                  </div>
                  <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${stat.bgClass}`}>
                    <stat.icon className={`h-6 w-6 ${stat.colorClass}`} />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  {stat.trendPositive ? (
                    <span className="flex items-center text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md font-medium">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      {stat.trend}
                    </span>
                  ) : (
                    <span className="flex items-center text-red-600 bg-red-50 px-2 py-0.5 rounded-md font-medium">
                      <ArrowDownRight className="h-3 w-3 mr-1" />
                      {stat.trend}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-0 shadow-sm ring-1 ring-slate-100 rounded-xl bg-white overflow-hidden">
          <CardHeader className="border-b border-slate-100 pb-4 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-heading font-semibold text-secondary">Revenue Overview</CardTitle>
              <button className="text-slate-400 hover:text-slate-600 transition-colors">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="pt-6 pl-0 pr-4">
            <div className="h-75 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E86A70" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#E86A70" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#94a3b8" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    padding={{ left: 20, right: 20 }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                    width={60}
                  />
                  <Tooltip 
                    content={<CustomTooltip />}
                    cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#E86A70"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorTotal)"
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#E86A70' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3 border-0 shadow-sm ring-1 ring-slate-100 rounded-xl bg-white overflow-hidden">
          <CardHeader className="border-b border-slate-100 pb-4 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-heading font-semibold text-secondary">Recent Bookings</CardTitle>
              <Link href="/vendor/bookings" className="bg-[#E86A70]/10 text-[#E86A70] hover:bg-[#E86A70] hover:text-white px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300">
                View All
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {recentBookings.length > 0 ? (
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                        {booking.guestName.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-secondary group-hover:text-primary transition-colors">{booking.guestName}</p>
                        <p className="text-xs text-slate-500">{booking.property}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-secondary">{booking.amount}</p>
                      <span className={`inline-block px-2 py-0.5 mt-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        booking.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' :
                        booking.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                        booking.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <CalendarIcon className="w-10 h-10 text-slate-200 mb-3" />
                <p className="text-sm font-medium text-slate-600">No recent bookings</p>
                <p className="text-xs text-slate-400 mt-1">Bookings will appear here once guests book your properties.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
