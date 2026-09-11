"use client";

import React, { useState, useEffect } from "react";
import {
  Webhook,
  Plus,
  RefreshCw,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Send,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function WebhooksPage() {
  const [endpoints, setEndpoints] = useState<any[]>([]);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/integrations/webhooks");
      const json = await res.json();
      if (json.success) {
        setEndpoints(json.endpoints || []);
        setDeliveries(json.deliveries || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Webhooks & Event Deliveries
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time event notifications for external PMS & Channel Managers with HMAC SHA-256 signatures and exponential retry logs.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={fetchData} className="gap-2 self-start sm:self-center">
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Endpoints List */}
        <div className="md:col-span-2 space-y-4">
          <Card className="rounded-2xl shadow-xs border-border/60">
            <CardHeader className="bg-muted/30 border-b border-border/60 px-6 py-4">
              <CardTitle className="text-base font-semibold">Registered Webhook Subscriptions</CardTitle>
              <CardDescription className="text-xs">
                Partner webhook URLs listening for Racoonn reservation and availability lifecycle events.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-border/40">
              {loading ? (
                <div className="p-8 text-center text-sm text-muted-foreground">Loading endpoints...</div>
              ) : endpoints.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No webhook endpoints registered yet. Partners can register endpoints via <code>POST /api/v1/webhooks/endpoints</code>.
                </div>
              ) : (
                endpoints.map((ep) => (
                  <div key={ep.$id} className="p-4 flex items-center justify-between gap-4 hover:bg-muted/20">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground">{ep.partner}</span>
                        <Badge variant="outline" className="text-xs">{ep.status}</Badge>
                      </div>
                      <div className="text-xs font-mono text-muted-foreground break-all">{ep.url}</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(ep.events || []).map((ev: string) => (
                          <span key={ev} className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono">
                            {ev}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right text-xs text-muted-foreground shrink-0">
                      <div>Secret: <span className="font-mono">whsec_••••••••</span></div>
                      {ep.lastDeliveryAt && (
                        <div className="text-[11px] text-emerald-600 mt-1">
                          Delivered: {new Date(ep.lastDeliveryAt).toLocaleTimeString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Deliveries Feed */}
        <div>
          <Card className="rounded-2xl shadow-xs border-border/60">
            <CardHeader className="bg-muted/30 border-b border-border/60 px-5 py-4">
              <CardTitle className="text-base font-semibold">Recent Deliveries</CardTitle>
              <CardDescription className="text-xs">Outbound webhook dispatch audit trail.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-border/40 max-h-[500px] overflow-y-auto">
              {deliveries.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground">No recent delivery attempts.</div>
              ) : (
                deliveries.map((del) => (
                  <div key={del.$id} className="p-3.5 hover:bg-muted/20 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground font-mono">{del.eventType}</span>
                      <Badge
                        variant={del.status === "success" ? "default" : "destructive"}
                        className="text-[10px] px-1.5 py-0"
                      >
                        {del.status}
                      </Badge>
                    </div>
                    <div className="text-muted-foreground flex items-center justify-between text-[11px]">
                      <span>Attempt #{del.attempt}</span>
                      <span>{del.responseTime ? `${del.responseTime}ms` : ""}</span>
                    </div>
                    {del.error && (
                      <p className="text-destructive text-[11px] font-mono truncate">{del.error}</p>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
