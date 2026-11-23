#!/bin/bash

declare -A pages=(
  ["payments"]="Payments"
  ["payouts"]="Payouts"
  ["reviews"]="Reviews"
  ["support"]="Support"
  ["marketing"]="Marketing"
  ["cms"]="CMS"
  ["reports"]="Reports"
  ["notifications"]="Notifications"
  ["fraud"]="Fraud Detection"
  ["audit"]="Audit Logs"
  ["roles"]="Role Management"
)

for folder in "${!pages[@]}"; do
  title="${pages[$folder]}"
  
  cat << TSX > "src/app/admin/$folder/page.tsx"
"use client"

import { Card } from "@/components/ui/card"
import { Construction } from "lucide-react"

export default function ${folder^}Page() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="relative rounded-3xl overflow-hidden bg-primary text-primary-foreground p-8 md:p-12 shadow-md">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">${title}</h2>
          <p className="text-primary-foreground/80 max-w-lg text-lg">
            This module is currently under construction. Check back soon for updates.
          </p>
        </div>
      </div>
      
      <Card className="rounded-3xl shadow-sm border-border/50 bg-card p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
        <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <Construction className="h-10 w-10 text-primary" />
        </div>
        <h3 className="text-2xl font-bold mb-2">Coming Soon</h3>
        <p className="text-muted-foreground max-w-md">
          We are working hard to build the ${title} feature. It will be available in an upcoming release.
        </p>
      </Card>
    </div>
  )
}
TSX

  echo "Created placeholder for $title in src/app/admin/$folder/page.tsx"
done
