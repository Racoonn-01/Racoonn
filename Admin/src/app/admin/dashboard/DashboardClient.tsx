"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BadgeDollarSign, Users, Building2, CalendarDays, RotateCcw } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export interface KPIData {
  title: string;
  value: string;
  change: string;
  color: string;
  bg: string;
  iconName: "BadgeDollarSign" | "Users" | "Building2" | "CalendarDays" | "RotateCcw";
}

export interface ChartData {
  name: string;
  revenue: number;
}

export interface ActivityData {
  title: string;
  desc: string;
  time: string;
  iconName: "BadgeDollarSign" | "Users" | "Building2" | "CalendarDays" | "RotateCcw";
  color: string;
  bg: string;
}

interface DashboardClientProps {
  kpiData: KPIData[];
  chartData: ChartData[];
  recentActivity: ActivityData[];
}

const iconMap = {
  BadgeDollarSign,
  Users,
  Building2,
  CalendarDays,
  RotateCcw,
}

export default function DashboardClient({ kpiData, chartData, recentActivity }: DashboardClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentFilter = searchParams.get('filter') || 'today'

  const handleFilterChange = (value: string | null) => {
    if (!value) return;
    const params = new URLSearchParams(searchParams)
    params.set('filter', value)
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-end mb-4">
        <Select value={currentFilter} onValueChange={handleFilterChange}>
          <SelectTrigger className="w-45 bg-white">
            <SelectValue placeholder="Select Timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
            <SelectItem value="lifetime">Lifetime</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        {kpiData.map((kpi, i) => {
          const Icon = iconMap[kpi.iconName];
          return (
            <Card key={i} className="group border-border/50 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 bg-card rounded-2xl overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  {kpi.title}
                </CardTitle>
                <div className={`p-2 rounded-xl ${kpi.bg}`}>
                  <Icon className={`h-4 w-4 ${kpi.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight">{kpi.value}</div>
                <p className={`text-sm mt-2 font-medium ${kpi.change.startsWith('+') ? 'text-emerald-500' : kpi.change === '0%' ? 'text-muted-foreground' : 'text-red-500'}`}>
                  {kpi.change} <span className="text-muted-foreground font-normal">from previous period</span>
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Main Content Area */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 rounded-3xl shadow-sm border-border/50 bg-card overflow-hidden">
          <CardHeader className="border-b border-border/50 bg-muted/20">
            <CardTitle>Revenue Analytics</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="min-h-125 h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E86A70" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#E86A70" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#E86A70" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 rounded-3xl shadow-sm border-border/50 bg-card">
          <CardHeader className="border-b border-border/50 bg-muted/20">
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-8">
              {recentActivity.map((activity, i) => {
                const Icon = iconMap[activity.iconName];
                return (
                  <div key={i} className="flex items-start gap-4">
                    <div className={`p-2 rounded-xl mt-1 shrink-0 ${activity.bg}`}>
                      <Icon className={`h-4 w-4 ${activity.color}`} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold leading-none">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{activity.desc}</p>
                      <p className="text-xs text-muted-foreground font-medium">{activity.time}</p>
                    </div>
                  </div>
                )
              })}
              {recentActivity.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  No recent activity found.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
