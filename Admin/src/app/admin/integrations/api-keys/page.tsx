"use client";

import React, { useState, useEffect } from "react";
import {
  KeyRound,
  Plus,
  Shield,
  Clock,
  RefreshCw,
  Copy,
  Check,
  Ban,
  Activity,
  Server,
  Zap,
  CheckCircle2,
  AlertCircle,
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
import { ALL_PARTNER_PERMISSIONS } from "@/lib/partner-api/types";
import Link from "next/link";

interface PartnerKey {
  id: string;
  name: string;
  partner: string;
  keyPrefix: string;
  environment: "production" | "sandbox";
  status: "active" | "revoked" | "expired";
  permissions: string[];
  createdBy?: string;
  createdAt: string;
  lastUsedAt?: string | null;
  rateLimit?: number;
  stats?: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    avgResponseTimeMs: number;
  };
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<PartnerKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createdKeyData, setCreatedKeyData] = useState<{ rawKey: string; name: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // Form state
  const [partnerName, setPartnerName] = useState("");
  const [partnerIdentifier, setPartnerIdentifier] = useState("");
  const [environment, setEnvironment] = useState<"production" | "sandbox">("production");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([...ALL_PARTNER_PERMISSIONS]);
  const [submitting, setSubmitting] = useState(false);

  const fallbackCopyText = (text: string) => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Fallback copy failed:", e);
    }
  };

  const fetchKeys = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/integrations/api-keys");
      const json = await res.json();
      if (json.success) {
        setKeys(json.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch API keys:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await fetch("/api/admin/integrations/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: partnerName,
          partner: partnerIdentifier,
          environment,
          permissions: selectedPermissions,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setCreatedKeyData({ rawKey: json.data.rawKey, name: json.data.name });
        setCreateModalOpen(false);
        setPartnerName("");
        setPartnerIdentifier("");
        fetchKeys();
      } else {
        alert(json.error || "Failed to create API key");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "active" ? "revoked" : "active";
    if (confirm(`Are you sure you want to mark this API key as ${nextStatus}?`)) {
      try {
        const res = await fetch(`/api/admin/integrations/api-keys/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextStatus }),
        });
        const json = await res.json();
        if (json.success) {
          fetchKeys();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleRegenerate = async (id: string) => {
    if (confirm("Regenerating an API key will revoke the existing secret immediately. Proceed?")) {
      try {
        const res = await fetch(`/api/admin/integrations/api-keys/${id}`, {
          method: "POST",
        });
        const json = await res.json();
        if (json.success) {
          setCreatedKeyData({ rawKey: json.data.rawKey, name: "Regenerated Key" });
          fetchKeys();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const togglePermission = (perm: string) => {
    if (selectedPermissions.includes(perm)) {
      setSelectedPermissions(selectedPermissions.filter((p) => p !== perm));
    } else {
      setSelectedPermissions([...selectedPermissions, perm]);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Partner API Keys
            </h1>
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs px-2 py-0.5">
              v1 Live
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Provision and manage secure API credentials for external PMS and Channel Managers (Channex, SiteMinder, RateGain).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/developers" target="_blank">
            <Button variant="outline" size="sm" className="gap-2">
              <ExternalLink className="h-4 w-4" />
              API Docs
            </Button>
          </Link>
          <Button onClick={() => setCreateModalOpen(true)} className="gap-2 bg-primary text-primary-foreground">
            <Plus className="h-4 w-4" />
            Create Partner Key
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl shadow-xs border-border/60">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Integrations</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {keys.filter((k) => k.status === "active").length}
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Zap className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-xs border-border/60">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Production Keys</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {keys.filter((k) => k.environment === "production").length}
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Server className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-xs border-border/60">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sandbox Keys</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {keys.filter((k) => k.environment === "sandbox").length}
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <Activity className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-xs border-border/60">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Security Architecture</p>
              <p className="text-sm font-bold text-emerald-600 mt-1 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> SHA-256 Hashed
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Shield className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Connected Keys List */}
      <Card className="rounded-2xl shadow-xs border-border/60 overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-border/60 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Connected Integrations</CardTitle>
              <CardDescription className="text-xs">
                Active partner connections syncing inventory, pricing, and reservations.
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={fetchKeys} className="h-8 gap-1.5 text-xs text-muted-foreground">
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Loading integration credentials...</div>
          ) : keys.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto text-muted-foreground mb-3">
                <KeyRound className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-foreground">No Partner API Keys</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
                Get started by creating an API key for your first external Channel Manager or PMS integration.
              </p>
              <Button onClick={() => setCreateModalOpen(true)} size="sm">
                + Create Partner Key
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {keys.map((k) => (
                <div key={k.id} className="p-5 hover:bg-muted/20 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-foreground text-base">{k.name}</span>
                      <Badge
                        variant={k.status === "active" ? "default" : "destructive"}
                        className="capitalize text-xs font-medium"
                      >
                        {k.status}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className={k.environment === "production" ? "bg-blue-500/10 text-blue-700" : "bg-purple-500/10 text-purple-700"}
                      >
                        {k.environment}
                      </Badge>
                      <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground">
                        {k.partner}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground font-mono">
                      <span>Key: <strong className="text-foreground">{k.keyPrefix}••••••••••••••••••••••••</strong></span>
                      <span>•</span>
                      <span>Rate Limit: {k.rateLimit || (k.environment === "sandbox" ? 100 : 1000)} req/min</span>
                      <span>•</span>
                      <span>Created: {new Date(k.createdAt).toLocaleDateString()}</span>
                      {k.lastUsedAt && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-600 font-sans">Last Used: {new Date(k.lastUsedAt).toLocaleString()}</span>
                        </>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1 mt-2">
                      {k.permissions.map((p) => (
                        <span key={p} className="text-[10px] bg-muted/60 text-muted-foreground px-1.5 py-0.5 rounded">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Right side stats & actions */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRegenerate(k.id)}
                      className="text-xs h-8"
                    >
                      Regenerate
                    </Button>
                    <Button
                      variant={k.status === "active" ? "destructive" : "outline"}
                      size="sm"
                      onClick={() => handleToggleStatus(k.id, k.status)}
                      className="text-xs h-8 gap-1.5"
                    >
                      {k.status === "active" ? (
                        <>
                          <Ban className="h-3.5 w-3.5" /> Revoke
                        </>
                      ) : (
                        "Activate"
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Creation Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle className="text-xl">Create Partner API Key</DialogTitle>
              <DialogDescription>
                Issue a secure API credential allowing an external PMS or Channel Manager to connect to Racoonn.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="keyName">Integration Name</Label>
                <Input
                  id="keyName"
                  placeholder="e.g. Channex Production"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="partnerSlug">Partner Identifier</Label>
                <Input
                  id="partnerSlug"
                  placeholder="e.g. channex, siteminder, rategain"
                  value={partnerIdentifier}
                  onChange={(e) => setPartnerIdentifier(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">Unique identifier used for rate limits and audit logs.</p>
              </div>

              <div className="grid gap-2">
                <Label>Environment</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEnvironment("production")}
                    className={`p-3 rounded-xl border text-left text-sm transition-all ${
                      environment === "production"
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20 font-medium"
                        : "border-border hover:bg-muted/40"
                    }`}
                  >
                    <div className="font-semibold">Production</div>
                    <div className="text-xs text-muted-foreground mt-0.5">1,000 req/min limit</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEnvironment("sandbox")}
                    className={`p-3 rounded-xl border text-left text-sm transition-all ${
                      environment === "sandbox"
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20 font-medium"
                        : "border-border hover:bg-muted/40"
                    }`}
                  >
                    <div className="font-semibold">Sandbox / Testing</div>
                    <div className="text-xs text-muted-foreground mt-0.5">100 req/min limit</div>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Granular Permissions</Label>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedPermissions(
                        selectedPermissions.length === ALL_PARTNER_PERMISSIONS.length
                          ? []
                          : [...ALL_PARTNER_PERMISSIONS]
                      )
                    }
                    className="text-xs text-primary hover:underline"
                  >
                    {selectedPermissions.length === ALL_PARTNER_PERMISSIONS.length ? "Deselect All" : "Select All"}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 border rounded-xl p-3 max-h-48 overflow-y-auto bg-muted/20">
                  {ALL_PARTNER_PERMISSIONS.map((perm) => (
                    <label
                      key={perm}
                      className="flex items-center gap-2 text-xs cursor-pointer hover:text-foreground text-muted-foreground"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(perm)}
                        onChange={() => togglePermission(perm)}
                        className="rounded border-border"
                      />
                      <span>{perm}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Generating..." : "Generate Key"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* One-Time Secret Reveal Modal */}
      <Dialog open={!!createdKeyData} onOpenChange={() => setCreatedKeyData(null)}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <CheckCircle2 className="h-5 w-5" />
              <DialogTitle>Partner API Key Generated</DialogTitle>
            </div>
            <DialogDescription className="text-sm font-medium text-amber-600">
              Copy this API key now. For security reasons, Racoonn will never display the full key again.
            </DialogDescription>
          </DialogHeader>

          <div className="p-4 bg-muted/60 border rounded-xl space-y-2 my-2">
            <Label className="text-xs text-muted-foreground">Generated Secret Key</Label>
            <div className="flex items-center gap-2">
              <code className="text-xs font-mono font-bold bg-background p-2.5 rounded-lg border flex-1 break-all text-primary select-all">
                {createdKeyData?.rawKey}
              </code>
              <Button
                size="sm"
                onClick={() => {
                  if (createdKeyData?.rawKey) {
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                      navigator.clipboard.writeText(createdKeyData.rawKey).then(() => {
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }).catch(() => {
                        // Fallback below
                        fallbackCopyText(createdKeyData.rawKey);
                      });
                    } else {
                      fallbackCopyText(createdKeyData.rawKey);
                    }
                  }
                }}
                className="gap-1.5 shrink-0"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setCreatedKeyData(null)} className="w-full">
              I Have Securely Saved This Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
