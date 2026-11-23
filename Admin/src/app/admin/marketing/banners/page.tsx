"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"

export default function Page() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-3xl font-heading font-bold text-secondary">Banner Management</h2>
        <p className="text-muted-foreground mt-1">Manage and view details for banner management.</p>
      </div>

      <Card className="border-0 shadow-sm ring-1 ring-slate-100 rounded-2xl">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-6">
          <CardTitle className="font-heading">Banner Management Configuration</CardTitle>
          <CardDescription>This section is currently under development.</CardDescription>
        </CardHeader>
        <CardContent className="p-8 flex items-center justify-center min-h-[300px]">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl mx-auto flex items-center justify-center text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-800">Page Coming Soon</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              We are working on integrating the necessary APIs and components for the Banner Management page.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
