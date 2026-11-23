"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import Link from "next/link";
import { KeyRound, Webhook, ExternalLink, ArrowRight, ShieldCheck } from "lucide-react";

export default function Page() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 max-w-5xl"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-heading font-bold text-secondary">Channel Manager Integrations</h2>
          <p className="text-muted-foreground mt-1">
            Connect external Channel Managers (Channex, SiteMinder, RateGain) to Racoonn using the Partner API.
          </p>
        </div>
        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-200">
          Partner API Active
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm ring-1 ring-slate-200 rounded-2xl">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Partner API Keys</CardTitle>
                <CardDescription className="text-xs">Create and manage keys for Channel Managers</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <p className="text-sm text-slate-600">
              Generate cryptographically hashed API keys (e.g. <code>rac_live_partner_...</code>) with granular permissions for Channex or SiteMinder.
            </p>
            <Link href="/admin/integrations/api-keys">
              <Button className="w-full gap-2">
                Manage API Keys <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm ring-1 ring-slate-200 rounded-2xl">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                <Webhook className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Webhooks & Events</CardTitle>
                <CardDescription className="text-xs">Outbound 2-way sync notifications</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <p className="text-sm text-slate-600">
              Configure HMAC SHA-256 signed webhooks to push reservation and availability updates to external systems in real-time.
            </p>
            <Link href="/admin/integrations/webhooks">
              <Button variant="outline" className="w-full gap-2">
                View Webhook Deliveries <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm ring-1 ring-slate-200 rounded-2xl p-6 bg-linear-to-r from-slate-900 to-slate-800 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <h3 className="font-semibold text-lg">Racoonn Partner API Documentation</h3>
            </div>
            <p className="text-xs text-slate-300">
              Explore curl examples, endpoint specifications, and sandbox guidelines for Channel Managers.
            </p>
          </div>
          <Link href="/developers" target="_blank">
            <Button variant="secondary" className="gap-2 shrink-0">
              <ExternalLink className="h-4 w-4" /> Open Developer Docs
            </Button>
          </Link>
        </div>
      </Card>
    </motion.div>
  );
}
