import { appwriteServer } from "@/lib/appwrite/server";
import DashboardClient, { KPIData, ChartData, ActivityData } from "./DashboardClient";
import { Query } from "node-appwrite";

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID!;
const VENDOR_COLLECTION = "6a3e0fd9da7df0d38588"; // Hardcoded for now based on discovery

// Format currency
const formatCurrency = (value: number) => {
  if (value >= 1000000) return `₹${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value}`;
};

// Calculate percentage change
const getChange = (current: number, previous: number) => {
  if (previous === 0) return current > 0 ? "+100%" : "0%";
  const diff = ((current - previous) / previous) * 100;
  return `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`;
};

// Helper for relative time
const getRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds} secs ago`;
  const diffInMins = Math.floor(diffInSeconds / 60);
  if (diffInMins < 60) return `${diffInMins} mins ago`;
  const diffInHours = Math.floor(diffInMins / 60);
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} days ago`;
};

export default async function DashboardPage({ searchParams }: { searchParams?: { filter?: string } }) {
  const filter = searchParams?.filter || 'today';
  let kpiData: KPIData[] | null = null;
  let chartData: ChartData[] | null = null;
  let recentActivity: ActivityData[] | null = null;

  try {
    const db = appwriteServer.databases;

    // Fetch properties
    const properties = await db.listDocuments(DATABASE_ID, 'properties', [Query.limit(100), Query.orderDesc('$createdAt')]);
    const activeProperties = properties.documents.filter(p => p.status?.toLowerCase() === 'approved' || p.status?.toLowerCase() === 'active').length;

    // Fetch bookings
    const bookings = await db.listDocuments(DATABASE_ID, 'bookings', [Query.limit(100), Query.orderDesc('$createdAt')]);
    
    // Fetch payments
    const payments = await db.listDocuments(DATABASE_ID, 'booking_payments', [Query.limit(1000), Query.orderDesc('$createdAt')]);
    
    // Fetch vendors
    const vendors = await db.listDocuments(DATABASE_ID, VENDOR_COLLECTION, [Query.limit(20), Query.orderDesc('$createdAt')]);

    // Current date logic for month comparisons

    const now = new Date();
    
    let currentPeriodStart = new Date(0);
    let previousPeriodStart = new Date(0);
    let previousPeriodEnd = new Date(0);
    let isLifetime = false;
    
    switch (filter) {
      case 'today':
        currentPeriodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        previousPeriodStart = new Date(currentPeriodStart.getTime() - 24 * 60 * 60 * 1000);
        previousPeriodEnd = new Date(currentPeriodStart.getTime() - 1);
        break;
      case 'weekly':
        currentPeriodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        previousPeriodStart = new Date(currentPeriodStart.getTime() - 7 * 24 * 60 * 60 * 1000);
        previousPeriodEnd = new Date(currentPeriodStart.getTime() - 1);
        break;
      case 'yearly':
        currentPeriodStart = new Date(now.getFullYear(), 0, 1);
        previousPeriodStart = new Date(currentPeriodStart.getFullYear() - 1, 0, 1);
        previousPeriodEnd = new Date(currentPeriodStart.getTime() - 1);
        break;
      case 'lifetime':
        isLifetime = true;
        break;
      case 'monthly':
      default:
        currentPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        previousPeriodStart = new Date(currentPeriodStart.getFullYear(), currentPeriodStart.getMonth() - 1, 1);
        previousPeriodEnd = new Date(currentPeriodStart.getTime() - 1);
        break;
    }

    let totalRevenue = 0;
    let currentPeriodRevenue = 0;
    let previousPeriodRevenue = 0;
    let totalCommission = 0;
    let previousPeriodCommission = 0;


    const chartDataMap: Record<string, number> = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Pre-fill chart data based on filter so the chart is never empty
    if (filter === 'today') {
      for (let i = 0; i < 24; i++) chartDataMap[i + ":00"] = 0;
    } else if (filter === 'weekly') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        chartDataMap[d.toLocaleDateString('en-US', { weekday: 'short' })] = 0;
      }
    } else if (filter === 'monthly') {
      for (let i = 30; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        chartDataMap[d.getDate().toString()] = 0;
      }
    } else {
      monthNames.forEach(m => chartDataMap[m] = 0);
    }


    payments.documents.forEach(payment => {
      const amount = payment.totalAmount || 0;
      const commission = payment.serviceFees || (amount * 0.15);
      
      const date = new Date(payment.$createdAt);
      
      if (isLifetime) {
        totalRevenue += amount;
        totalCommission += commission;
        currentPeriodRevenue += amount;
      } else {
        if (date >= currentPeriodStart) {
          currentPeriodRevenue += amount;
          totalRevenue += amount;
          totalCommission += commission;
        } else if (date >= previousPeriodStart && date <= previousPeriodEnd) {
          previousPeriodRevenue += amount;
          previousPeriodCommission += commission;
        }
      }

      // Chart aggregation
      let key = "";
      if (filter === 'today') {
        key = date.getHours() + ":00";
      } else if (filter === 'weekly') {
        key = date.toLocaleDateString('en-US', { weekday: 'short' });
      } else if (filter === 'monthly') {
        key = date.getDate().toString();
      } else {
        key = monthNames[date.getMonth()];
      }
      if (!chartDataMap[key]) chartDataMap[key] = 0;
      if (isLifetime || date >= currentPeriodStart) {
          chartDataMap[key] += amount;
      }
    });

    let currentPeriodBookings = 0;
    let previousPeriodBookings = 0;
    bookings.documents.forEach(b => {
      const date = new Date(b.$createdAt);
      if (isLifetime || date >= currentPeriodStart) currentPeriodBookings++;
      else if (date >= previousPeriodStart && date <= previousPeriodEnd) previousPeriodBookings++;
    });

    let currentPeriodProps = 0;
    let previousPeriodProps = 0;
    properties.documents.forEach(p => {
      if (p.status?.toLowerCase() !== 'approved' && p.status?.toLowerCase() !== 'active') return;
      const date = new Date(p.$createdAt);
      if (isLifetime || date >= currentPeriodStart) currentPeriodProps++;
      else if (date >= previousPeriodStart && date <= previousPeriodEnd) previousPeriodProps++;
    });

    kpiData = [
      { 
        title: "Total Revenue", 
        value: formatCurrency(totalRevenue), 
        iconName: "BadgeDollarSign", 
        change: getChange(currentPeriodRevenue, previousPeriodRevenue), 
        color: "text-blue-500", 
        bg: "bg-blue-500/10" 
      },
      { 
        title: `${filter.charAt(0).toUpperCase() + filter.slice(1)} Revenue`, 
        value: formatCurrency(currentPeriodRevenue), 
        iconName: "BadgeDollarSign", 
        change: getChange(currentPeriodRevenue, previousPeriodRevenue), 
        color: "text-emerald-500", 
        bg: "bg-emerald-500/10" 
      },
      { 
        title: "Commission Earnings", 
        value: formatCurrency(totalCommission), 
        iconName: "BadgeDollarSign", 
        change: getChange(totalCommission, previousPeriodCommission), 
        color: "text-violet-500", 
        bg: "bg-violet-500/10" 
      },
      { 
        title: "Total Bookings", 
        value: isLifetime ? bookings.total.toString() : currentPeriodBookings.toString(), 
        iconName: "CalendarDays", 
        change: getChange(currentPeriodBookings, previousPeriodBookings), 
        color: "text-orange-500", 
        bg: "bg-orange-500/10" 
      },
      { 
        title: "Active Properties", 
        value: isLifetime ? activeProperties.toString() : currentPeriodProps.toString(), 
        iconName: "Building2", 
        change: getChange(currentPeriodProps, previousPeriodProps), 
        color: "text-pink-500", 
        bg: "bg-pink-500/10" 
      },
    ];

    // Chart Data
    chartData = Object.keys(chartDataMap).map(key => ({
      name: key,
      revenue: chartDataMap[key]
    }));
    // To preserve the chronological order we established in pre-fill, we'll re-map based on the original Object.keys order since we didn't use pure numbers for keys except monthly. Wait, for monthly, JS object keys might sort numerically automatically.
    // Let's just create chartData array directly during prefill? 
    // Actually, it's easier to just recreate chartData by iterating the keys of chartDataMap in insertion order, but since JS sorts numeric keys (like '1', '2'), we'll just sort them correctly here if needed.
    
    if (filter === 'today') {
      chartData.sort((a, b) => parseInt(a.name.split(':')[0]) - parseInt(b.name.split(':')[0]));
    } else if (filter === 'monthly') {
      // Monthly is days of the month, so numeric keys get auto-sorted by JS 1,2,3... 31.
      // That's fine for a month view.
    } else if (filter === 'yearly' || filter === 'lifetime') {
      // Keep monthNames order
      chartData.sort((a, b) => monthNames.indexOf(a.name) - monthNames.indexOf(b.name));
    }
    // weekly is short names, might be tricky to sort, but Object.keys usually preserves insertion order for strings.


    // Recent Activity (Merge recent properties, bookings, vendors)
    const activities: Array<{
      title: string;
      desc: string;
      timeStr: string;
      time: string;
      iconName: "BadgeDollarSign" | "Users" | "Building2" | "CalendarDays";
      color: string;
      bg: string;
    }> = [];

    vendors.documents.slice(0, 7).forEach(v => {
      activities.push({
        title: "New vendor registered",
        desc: `${v.businessName || v.firstName || 'A vendor'} joined the platform.`,
        timeStr: v.$createdAt,
        time: getRelativeTime(v.$createdAt),
        iconName: "Users",
        color: "text-purple-500",
        bg: "bg-purple-500/10"
      });
    });

    // Sort descending by time
    activities.sort((a, b) => new Date(b.timeStr).getTime() - new Date(a.timeStr).getTime());

    recentActivity = activities.slice(0, 7).map(a => ({
      title: a.title,
      desc: a.desc,
      time: a.time,
      iconName: a.iconName,
      color: a.color,
      bg: a.bg
    }));
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    // Data fetching failed
  }

  if (!kpiData || !chartData || !recentActivity) {
    return (
      <div className="p-8 text-center text-red-500">
        <h2 className="text-xl font-bold mb-4">Error loading dashboard data</h2>
        <p>Please check your database connection and credentials.</p>
      </div>
    );
  }

  return <DashboardClient kpiData={kpiData} chartData={chartData} recentActivity={recentActivity} />;
}
