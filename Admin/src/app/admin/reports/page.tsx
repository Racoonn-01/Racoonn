"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { BarChart3, PieChart, TrendingUp, Download } from "lucide-react"

export default function ReportsPage() {
  const reports = [
    { id: "GST-2026-Q2", name: "GST 5% & 18% Tax Returns Audit", type: "Tax Compliance", generatedAt: "Jul 27, 2026", format: "CSV / PDF" },
    { id: "RPT-110", name: "Monthly Revenue Summary", type: "Financial", generatedAt: "Jul 1, 2026", format: "PDF/CSV" },
    { id: "RPT-109", name: "Vendor Performance Metrics", type: "Analytics", generatedAt: "Jun 28, 2026", format: "CSV" },
    { id: "RPT-108", name: "User Growth Trends", type: "Growth", generatedAt: "Jun 25, 2026", format: "PDF" },
    { id: "RPT-107", name: "Q2 Executive Board Presentation", type: "Executive", generatedAt: "Jun 15, 2026", format: "PDF" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reports & Analytics</h2>
          <p className="text-muted-foreground mt-1">Generate and view system-wide analytical reports and exports.</p>
        </div>
        <Button>Generate New Report</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Generated</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-muted-foreground">Reports this year</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Exports</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Running automatically</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Storage</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12 GB</div>
            <p className="text-xs text-muted-foreground">Historical report archives</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Accessed</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Financial</div>
            <p className="text-xs text-muted-foreground">Monthly summaries</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Generated At</TableHead>
                <TableHead>Format</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((rpt) => (
                <TableRow key={rpt.id}>
                  <TableCell className="font-medium">{rpt.id}</TableCell>
                  <TableCell>{rpt.name}</TableCell>
                  <TableCell>{rpt.type}</TableCell>
                  <TableCell>{rpt.generatedAt}</TableCell>
                  <TableCell>{rpt.format}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Download</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
