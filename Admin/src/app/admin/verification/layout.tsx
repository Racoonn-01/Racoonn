"use client"

import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"

import { Suspense } from "react"

function VerificationLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const params = new URLSearchParams(searchParams.toString())
    if (e.target.value) {
      params.set('q', e.target.value)
    } else {
      params.delete('q')
    }
    router.replace(`${pathname}?${params.toString()}`)
  }
  
  const tabs = [
    { label: "KYC Verification", value: "kyc" },
    { label: "Pending", value: "pending" },
    { label: "Approved", value: "approved" },
    { label: "Rejected", value: "rejected" },
  ]

  return (
    <div className="space-y-8 pb-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-foreground">Verification Center</h2>
          <p className="text-muted-foreground mt-1 text-lg">Review and manage vendor compliance documents securely.</p>
        </div>
      </div>

      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden p-6">
        <div className="w-full">
          {/* Custom Tabs List */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div className="flex flex-wrap h-auto gap-1 bg-muted/30 p-1 rounded-2xl w-full sm:w-auto overflow-x-auto justify-start">
              {tabs.map((tab) => {
                const isActive = pathname === `/admin/verification/${tab.value}`
                return (
                  <Link 
                    key={tab.value} 
                    href={`/admin/verification/${tab.value}`}
                    className={`rounded-xl px-4 py-2 capitalize transition-all text-sm font-medium ${
                      isActive 
                        ? 'bg-background text-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    {tab.label}
                  </Link>
                )
              })}
            </div>
            
            {/* Toolbar Area */}
            <div className="flex w-full sm:w-auto items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search documents..." 
                  className="w-full pl-9 bg-background border-muted-foreground/20 rounded-full h-10" 
                  defaultValue={searchParams.get('q') || ''}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
          </div>
          
          <div className="mt-0 outline-none">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VerificationLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading verification center...</div>}>
      <VerificationLayoutContent>{children}</VerificationLayoutContent>
    </Suspense>
  )
}
