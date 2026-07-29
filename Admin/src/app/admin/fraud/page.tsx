"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  ShieldAlert,
  AlertTriangle,
  ShieldCheck,
  Lock,
  Search,
  Eye,
  Loader2,
  CheckCircle2,
  XCircle,
  Ban,
  Building2,
  User,
  Globe,
  DollarSign,
  Activity,
  FileSpreadsheet,
  RefreshCw,
  Sparkles
} from "lucide-react";
import {
  getFraudMonitoringData,
  resolveFraudIncident,
  FraudIncidentItem
} from "./actions";

const formatCurrency = (val: number) => `₹${Math.round(val).toLocaleString('en-IN')}`;

export default function FraudPage() {
  const [data, setData] = useState<{
    totalAlertsCount: number;
    highRiskCount: number;
    quarantinedVolume: number;
    totalProtectedVolume: number;
    platformRiskRatio: string;
    incidents: FraudIncidentItem[];
  }>({
    totalAlertsCount: 0,
    highRiskCount: 0,
    quarantinedVolume: 0,
    totalProtectedVolume: 0,
    platformRiskRatio: "0.0%",
    incidents: []
  });

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedIncident, setSelectedIncident] = useState<FraudIncidentItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const res = await getFraudMonitoringData();
      setData(res);
    } catch (err) {
      console.error("Failed to load fraud monitoring data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredIncidents = useMemo(() => {
    return data.incidents.filter(inc => {
      if (activeTab === "all") return true;
      if (activeTab === "critical") return inc.riskLevel === "CRITICAL" || inc.riskLevel === "HIGH";
      if (activeTab === "medium") return inc.riskLevel === "MEDIUM" || inc.riskLevel === "LOW";
      if (activeTab === "quarantined") return inc.status.includes("Quarantined") || inc.status === "Blocked";
      if (activeTab === "resolved") return inc.status === "Resolved";
      return true;
    });
  }, [data.incidents, activeTab]);

  const handleOpenInspectModal = (inc: FraudIncidentItem) => {
    setSelectedIncident(inc);
    setIsModalOpen(true);
  };

  const handleAction = async (action: "resolve" | "block" | "quarantine") => {
    if (!selectedIncident) return;
    try {
      setIsProcessing(true);
      await resolveFraudIncident(selectedIncident.id, action);
      
      const updatedStatus = action === "resolve" ? "Resolved" : action === "block" ? "Blocked" : "Quarantined font-bold";
      setData(prev => ({
        ...prev,
        incidents: prev.incidents.map(item => item.id === selectedIncident.id ? { ...item, status: updatedStatus as any } : item)
      }));

      setSelectedIncident(prev => prev ? { ...prev, status: updatedStatus as any } : null);
    } catch (err) {
      console.error("Failed to update incident:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Fraud Detection & Risk Security</h2>
          <p className="text-muted-foreground mt-1">Real-time security monitoring, high-risk transaction quarantine, and fraud heuristics.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadData} variant="outline" className="rounded-full h-10 px-5 font-semibold">
            <RefreshCw className="w-4 h-4 mr-2" /> Re-scan Database
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl border border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged Risk Alerts</CardTitle>
            <ShieldAlert className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalAlertsCount}</div>
            <p className="text-xs text-rose-600 font-medium mt-1">{data.highRiskCount} Critical / High Risk</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quarantined Volume</CardTitle>
            <Lock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.quarantinedVolume)}</div>
            <p className="text-xs text-amber-600 font-medium mt-1">Held pending verification</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Risk Ratio</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.platformRiskRatio}</div>
            <p className="text-xs text-emerald-600 font-medium mt-1">Within healthy threshold</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Secured Volume</CardTitle>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.totalProtectedVolume)}</div>
            <p className="text-xs text-muted-foreground mt-1">Protected transactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Card */}
      <Card className="rounded-2xl border border-border shadow-xs overflow-hidden">
        {/* Toolbar & Filter Tabs */}
        <div className="p-4 border-b flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/10">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-700">Filter By Risk:</span>
            <div className="flex p-1 bg-muted/50 rounded-full">
              {[
                { id: "all", label: "All Alerts" },
                { id: "critical", label: "Critical & High" },
                { id: "medium", label: "Medium Risk" },
                { id: "quarantined", label: "Quarantined" },
                { id: "resolved", label: "Resolved" }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-1 rounded-full text-xs font-semibold capitalize transition-all ${
                    activeTab === tab.id
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Incidents Table */}
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-16 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">Scanning database for suspicious activities...</p>
            </div>
          ) : filteredIncidents.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm flex flex-col items-center gap-2">
              <ShieldCheck className="w-10 h-10 text-emerald-500/80" />
              <p className="font-bold text-foreground">No suspicious fraud incidents found.</p>
              <p className="text-xs">All database transactions and accounts match safety heuristics.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="font-semibold h-12">Incident ID</TableHead>
                  <TableHead className="font-semibold h-12">Target Entity</TableHead>
                  <TableHead className="font-semibold h-12">Risk Level</TableHead>
                  <TableHead className="font-semibold h-12">Risk Score</TableHead>
                  <TableHead className="font-semibold h-12">Triggered Risk Heuristics</TableHead>
                  <TableHead className="font-semibold h-12">Amount</TableHead>
                  <TableHead className="font-semibold h-12">Status</TableHead>
                  <TableHead className="text-right font-semibold h-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIncidents.map((inc) => (
                  <TableRow 
                    key={inc.id}
                    onClick={() => handleOpenInspectModal(inc)}
                    className="cursor-pointer hover:bg-muted/30 transition-colors group"
                  >
                    <TableCell className="font-bold font-mono text-xs text-foreground">{inc.id}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground text-sm">{inc.targetName}</span>
                        <span className="text-xs text-muted-foreground font-mono">{inc.targetEmail}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={`
                          px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider
                          ${inc.riskLevel === "CRITICAL" && "bg-rose-500/10 text-rose-600 border-rose-500/20"}
                          ${inc.riskLevel === "HIGH" && "bg-rose-500/10 text-rose-600 border-rose-500/20"}
                          ${inc.riskLevel === "MEDIUM" && "bg-amber-500/10 text-amber-600 border-amber-500/20"}
                          ${inc.riskLevel === "LOW" && "bg-slate-500/10 text-slate-600 border-slate-500/20"}
                        `}
                      >
                        {inc.riskLevel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-black text-rose-600 text-xs bg-rose-50 px-2 py-1 rounded-md border border-rose-200">
                        {inc.riskScore}/100
                      </span>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="text-xs text-slate-700 font-medium truncate">
                        {inc.reasons[0]}
                      </p>
                    </TableCell>
                    <TableCell className="font-bold text-foreground text-sm">
                      {inc.amount > 0 ? formatCurrency(inc.amount) : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={inc.status === "Resolved" ? "default" : "secondary"}
                        className={`
                          px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider
                          ${inc.status === "Resolved" && "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"}
                          ${inc.status.includes("Quarantined") && "bg-amber-500/10 text-amber-600 border-amber-500/20"}
                          ${inc.status === "Blocked" && "bg-rose-500/10 text-rose-600 border-rose-500/20"}
                          ${inc.status === "Flagged" && "bg-blue-500/10 text-blue-600 border-blue-500/20"}
                        `}
                      >
                        {inc.status.includes("Quarantined") ? "Quarantined" : inc.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenInspectModal(inc);
                        }}
                        variant="outline" 
                        size="sm"
                        className="h-8 rounded-full px-3.5 text-xs font-bold hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
                      >
                        <Search className="w-3.5 h-3.5 mr-1" /> Inspect & Resolve
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Smooth Fraud Inspection Popup Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl w-full rounded-3xl p-0 overflow-hidden bg-background border border-border shadow-2xl max-h-[90vh] flex flex-col">
          {selectedIncident && (
            <div className="flex flex-col h-full overflow-y-auto">
              
              {/* Header Banner */}
              <div className="bg-slate-900 text-white p-6 sm:p-8 flex items-center justify-between border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-black tracking-tight">{selectedIncident.id}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                      selectedIncident.riskLevel === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                      selectedIncident.riskLevel === 'HIGH' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                      'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {selectedIncident.riskLevel} RISK ({selectedIncident.riskScore}/100)
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Detected on {selectedIncident.detectedAt} • Real ID: {selectedIncident.realId}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 font-medium">Risk Status</span>
                  <p className="text-xl font-black text-[#E86A70]">{selectedIncident.status.includes("Quarantined") ? "Quarantined" : selectedIncident.status}</p>
                </div>
              </div>

              {/* Body Content */}
              <div className="p-6 sm:p-8 space-y-6">
                
                {/* Target Entity Profile */}
                <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <User className="w-4 h-4 text-rose-500" /> Target Entity Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm pt-1">
                    <div>
                      <span className="text-xs text-slate-400 font-medium">Entity Name & Role</span>
                      <p className="font-bold text-slate-900 text-base">{selectedIncident.targetName}</p>
                      <p className="text-xs text-slate-500">{selectedIncident.targetRole} • {selectedIncident.propertyName}</p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 font-medium">Contact Email & IP Trace</span>
                      <p className="font-semibold text-slate-800 font-mono text-xs">{selectedIncident.targetEmail}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 font-mono">
                        <Globe className="w-3 h-3 text-slate-400" /> {selectedIncident.ipAddress} ({selectedIncident.location})
                      </p>
                    </div>
                  </div>
                </div>

                {/* Triggered Risk Factors */}
                <div className="p-5 rounded-2xl bg-rose-50/50 border border-rose-200/80 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-600" /> Triggered Heuristic Security Flags
                  </h4>
                  <ul className="space-y-2 pt-1">
                    {selectedIncident.reasons.map((reason, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs font-semibold text-rose-900 bg-white p-3 rounded-xl border border-rose-200 shadow-2xs">
                        <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Financial Value at Risk */}
                {selectedIncident.amount > 0 && (
                  <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-rose-500" /> Financial Value Under Audit
                    </h4>
                    <div className="flex justify-between items-center text-base font-black pt-1">
                      <span className="text-slate-700">Flagged Transaction Value</span>
                      <span className="text-[#E86A70] text-xl font-black">{formatCurrency(selectedIncident.amount)}</span>
                    </div>
                  </div>
                )}

              </div>

              {/* Footer Actions */}
              <div className="p-6 bg-slate-50 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 mt-auto">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button 
                    onClick={() => handleAction("resolve")} 
                    disabled={isProcessing}
                    className="rounded-xl px-5 h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md flex-1 sm:flex-none"
                  >
                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                    Approve & Mark Safe
                  </Button>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button 
                    onClick={() => handleAction("quarantine")} 
                    disabled={isProcessing}
                    variant="outline"
                    className="rounded-xl px-5 h-11 font-semibold border-amber-300 text-amber-800 hover:bg-amber-50 flex-1 sm:flex-none"
                  >
                    <Lock className="w-4 h-4 mr-2 text-amber-600" /> Quarantine Funds
                  </Button>
                  <Button 
                    onClick={() => handleAction("block")} 
                    disabled={isProcessing}
                    variant="destructive"
                    className="rounded-xl px-5 h-11 font-bold shadow-md flex-1 sm:flex-none"
                  >
                    <Ban className="w-4 h-4 mr-2" /> Block Entity
                  </Button>
                </div>
              </div>

            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
