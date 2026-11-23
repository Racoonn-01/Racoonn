"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import Link from "next/link";
import { KeyRound, Building, ArrowRight, ShieldAlert, Cpu } from "lucide-react";

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
          <h2 className="text-3xl font-heading font-bold text-secondary">PMS Integrations</h2>
          <p className="text-muted-foreground mt-1">
            Allow external Property Management Systems to manage availability, rates, and bookings in Racoonn.
          </p>
        </div>
        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
          Partner API Ready
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm ring-1 ring-slate-200 rounded-2xl">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Cpu className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">PMS Partner Credentials</CardTitle>
                <CardDescription className="text-xs">Issue scoped keys for PMS clients</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <p className="text-sm text-slate-600">
              Each external PMS integration connects via a dedicated Racoonn API key, ensuring isolation and independent audit logs.
            </p>
            <Link href="/admin/integrations/api-keys">
              <Button className="w-full gap-2">
                Configure PMS Keys <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm ring-1 ring-slate-200 rounded-2xl">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                <Building className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Property Mapping</CardTitle>
                <CardDescription className="text-xs">Tenant property access boundary</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <p className="text-sm text-slate-600">
              Control which hotels and properties each external PMS can access. Prevent cross-property data leakage.
            </p>
            <Link href="/admin/properties">
              <Button variant="outline" className="w-full gap-2">
                View Properties <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
