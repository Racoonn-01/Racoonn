"use client";

import React, { useState } from "react";
import {
  KeyRound,
  Shield,
  Zap,
  Copy,
  Check,
  Building2,
  Calendar,
  Layers,
  ArrowRight,
  Terminal,
  ExternalLink,
  Code2,
  Search,
  Lock,
  ChevronRight,
  RefreshCw,
  BellRing,
  Activity,
  Server,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Language = "curl" | "node" | "python";

export default function DevelopersPage() {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [activeLang, setActiveLang] = useState<Language>("curl");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const copyToClipboard = (text: string, id: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopiedKey(id);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      console.error(e);
    }
  };

  const navSections = [
    { id: "overview", label: "Overview", icon: Layers },
    { id: "authentication", label: "Authentication", icon: KeyRound },
    { id: "rate-limits", label: "Rate Limits", icon: Zap },
    { id: "properties", label: "Properties API", icon: Building2 },
    { id: "availability", label: "Availability API", icon: Calendar },
    { id: "rates", label: "Rates API", icon: Server },
    { id: "reservations", label: "Reservations API", icon: Lock },
    { id: "webhooks", label: "Webhooks & Sync", icon: BellRing },
    { id: "sandbox", label: "Sandbox & Testing", icon: Terminal },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-200 font-sans selection:bg-rose-500 selection:text-white flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-[#0B0F19]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="flex items-center gap-2 group">
              <span className="h-8 w-8 rounded-xl bg-linear-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-rose-500/20 group-hover:scale-105 transition-transform">
                R
              </span>
              <span className="font-extrabold text-lg tracking-tight text-white">
                Racoonn <span className="text-slate-400 font-normal">Developers</span>
              </span>
            </Link>
            <Badge variant="outline" className="text-rose-400 border-rose-500/30 bg-rose-500/10 text-[11px] font-mono px-2 py-0.5">
              v1.0.0 Live
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Production: <code>api.racoonn.com/v1</code></span>
            </div>

            <Link href="/admin/integrations/api-keys">
              <Button size="sm" className="bg-linear-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white shadow-md shadow-rose-500/25 rounded-xl text-xs gap-1.5 h-8">
                <KeyRound className="h-3.5 w-3.5" />
                Manage API Keys
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Layout with Fixed Sidebar */}
      <div className="max-w-7xl mx-auto px-6 flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 py-8">
        {/* Left Sticky Sidebar */}
        <aside className="lg:col-span-3">
          <div className="sticky top-24 space-y-4">
            <div className="p-3 bg-slate-900/50 rounded-2xl border border-slate-800/80">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">API Guides & Reference</p>
              <nav className="space-y-1 mt-1">
                {navSections.map((sec) => {
                  const Icon = sec.icon;
                  const isActive = activeTab === sec.id;
                  return (
                    <button
                      key={sec.id}
                      onClick={() => {
                        setActiveTab(sec.id);
                        const el = document.getElementById(sec.id);
                        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-xs"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`h-4 w-4 ${isActive ? "text-rose-400" : "text-slate-500"}`} />
                        <span>{sec.label}</span>
                      </div>
                      {isActive && <ChevronRight className="h-3.5 w-3.5 text-rose-400" />}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Quick Status Box */}
            <div className="p-4 rounded-2xl bg-linear-to-b from-slate-900/80 to-slate-950 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Partner Security</span>
                <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <Shield className="h-3 w-3" /> SHA-256 Hashed
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Keys are never stored plaintext. Only hashes and prefixes are preserved in the integration vault.
              </p>
            </div>
          </div>
        </aside>

        {/* Right Content Area */}
        <main className="lg:col-span-9 space-y-16 pb-20">
          {/* Section: Overview */}
          <section id="overview" className="space-y-6 scroll-mt-28">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
                <Activity className="h-3.5 w-3.5" /> Direct PMS / Channel Manager Synchronization
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                Racoonn Partner API Documentation
              </h1>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-3xl">
                The Racoonn Partner API allows certified Property Management Systems (PMS) and Channel Managers (e.g. Channex, SiteMinder, RateGain) to sync room availability, manage dynamic pricing, fetch reservations, and receive webhook notifications in real-time.
              </p>
            </div>

            {/* High-level Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-2">
                <div className="h-9 w-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold">
                  <KeyRound className="h-4 w-4" />
                </div>
                <h3 className="font-bold text-white text-sm">Bearer Token Auth</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Cryptographically secure API keys issued per partner integration.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-2">
                <div className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
                  <Zap className="h-4 w-4" />
                </div>
                <h3 className="font-bold text-white text-sm">Guaranteed Idempotency</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Mandatory <code>Idempotency-Key</code> on bookings prevents duplicate reservations.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-2">
                <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                  <BellRing className="h-4 w-4" />
                </div>
                <h3 className="font-bold text-white text-sm">HMAC-Signed Webhooks</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Outbound events signed with HMAC SHA-256 for authentic real-time sync.
                </p>
              </div>
            </div>
          </section>

          {/* Section: Authentication */}
          <section id="authentication" className="space-y-4 scroll-mt-28 border-t border-slate-800/80 pt-10">
            <div className="space-y-1">
              <span className="text-xs font-bold text-rose-500 uppercase tracking-wider font-mono">Security</span>
              <h2 className="text-2xl font-bold text-white">Authentication</h2>
              <p className="text-xs sm:text-sm text-slate-400">
                All requests to the Partner API must include your partner key in the HTTP <code>Authorization</code> header using the standard Bearer scheme.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#060911] overflow-hidden">
              <div className="px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono">Authorization Header</span>
                <button
                  onClick={() => copyToClipboard("Authorization: Bearer rac_live_partner_xxxxxxxxxxxxxxxxxxxxxxxx", "auth_header")}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
                >
                  {copiedKey === "auth_header" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedKey === "auth_header" ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <pre className="p-4 text-xs font-mono text-rose-400 overflow-x-auto">
                <code>Authorization: Bearer rac_live_partner_7f82c1a89b3f42...</code>
              </pre>
            </div>
          </section>

          {/* Section: Rate Limits */}
          <section id="rate-limits" className="space-y-4 scroll-mt-28 border-t border-slate-800/80 pt-10">
            <div className="space-y-1">
              <span className="text-xs font-bold text-rose-500 uppercase tracking-wider font-mono">Throttling</span>
              <h2 className="text-2xl font-bold text-white">Rate Limits & Quotas</h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Rate limiting protects inventory consistency. Exceeded quotas return HTTP <code>429 Too Many Requests</code> with a <code>Retry-After</code> response header.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between font-semibold text-white">
                  <span>Production Environment</span>
                  <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 text-[10px]">Production</Badge>
                </div>
                <p className="text-slate-400 text-xs"><strong>1,000 requests</strong> per minute per partner key.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between font-semibold text-white">
                  <span>Sandbox / Testing Environment</span>
                  <Badge variant="secondary" className="bg-purple-500/10 text-purple-400 text-[10px]">Sandbox</Badge>
                </div>
                <p className="text-slate-400 text-xs"><strong>100 requests</strong> per minute per test key.</p>
              </div>
            </div>
          </section>

          {/* Section: Properties API */}
          <section id="properties" className="space-y-6 scroll-mt-28 border-t border-slate-800/80 pt-10">
            <div className="space-y-1">
              <span className="text-xs font-bold text-rose-500 uppercase tracking-wider font-mono">Endpoints</span>
              <h2 className="text-2xl font-bold text-white">Properties & Rooms</h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Retrieve list of assigned properties and their rooms/units.
              </p>
            </div>

            {/* Endpoint: GET Properties */}
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 overflow-hidden space-y-4 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-xs px-2.5 py-1 rounded-lg font-bold">GET</span>
                  <span className="font-mono text-sm font-semibold text-white">/api/v1/properties</span>
                </div>
                <Badge variant="outline" className="text-slate-400 text-[10px]">Required Scope: properties:read</Badge>
              </div>

              <p className="text-xs text-slate-300">
                Returns paginated property listings. Query parameters: <code>page</code> (default: 1), <code>limit</code> (default: 50, max: 100).
              </p>

              <div className="rounded-xl border border-slate-800 bg-[#060911] overflow-hidden">
                <div className="px-4 py-2 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>cURL Request</span>
                  <button
                    onClick={() => copyToClipboard(`curl -X GET "https://api.racoonn.com/v1/properties?page=1&limit=50" \\\n  -H "Authorization: Bearer rac_live_partner_xxxx"`, "curl_prop")}
                    className="hover:text-white flex items-center gap-1"
                  >
                    {copiedKey === "curl_prop" ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedKey === "curl_prop" ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto">
                  <code>{`curl -X GET "https://api.racoonn.com/v1/properties?page=1&limit=50" \\
  -H "Authorization: Bearer rac_live_partner_xxxx"`}</code>
                </pre>
              </div>
            </div>

            {/* Endpoint: GET Rooms */}
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 overflow-hidden space-y-4 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-xs px-2.5 py-1 rounded-lg font-bold">GET</span>
                  <span className="font-mono text-sm font-semibold text-white">/api/v1/properties/{`{propertyId}`}/rooms</span>
                </div>
                <Badge variant="outline" className="text-slate-400 text-[10px]">Required Scope: rooms:read</Badge>
              </div>

              <p className="text-xs text-slate-300">
                Returns the room inventory models, maximum occupancy, and room types for the specified property.
              </p>
            </div>
          </section>

          {/* Section: Availability API */}
          <section id="availability" className="space-y-6 scroll-mt-28 border-t border-slate-800/80 pt-10">
            <div className="space-y-1">
              <span className="text-xs font-bold text-rose-500 uppercase tracking-wider font-mono">Inventory</span>
              <h2 className="text-2xl font-bold text-white">Availability API</h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Read and update room count availability and date blockage in real-time.
              </p>
            </div>

            {/* PUT Availability */}
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 overflow-hidden space-y-4 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono text-xs px-2.5 py-1 rounded-lg font-bold">PUT</span>
                  <span className="font-mono text-sm font-semibold text-white">/api/v1/availability</span>
                </div>
                <Badge variant="outline" className="text-slate-400 text-[10px]">Required Scope: availability:write</Badge>
              </div>

              <p className="text-xs text-slate-300">
                Update single date room count and block status. Dispatches <code>availability.updated</code> event to webhooks.
              </p>

              <div className="rounded-xl border border-slate-800 bg-[#060911] overflow-hidden">
                <div className="px-4 py-2 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>cURL Request</span>
                  <button
                    onClick={() => copyToClipboard(`curl -X PUT "https://api.racoonn.com/v1/availability" \\\n  -H "Authorization: Bearer rac_live_partner_xxxx" \\\n  -H "Content-Type: application/json" \\\n  -d '{"roomId":"6a4646c700110e5fdaab","date":"2026-10-15","available":4,"blocked":false}'`, "curl_avail")}
                    className="hover:text-white flex items-center gap-1"
                  >
                    {copiedKey === "curl_avail" ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedKey === "curl_avail" ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto">
                  <code>{`curl -X PUT "https://api.racoonn.com/v1/availability" \\
  -H "Authorization: Bearer rac_live_partner_xxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "roomId": "6a4646c700110e5fdaab",
    "date": "2026-10-15",
    "available": 4,
    "blocked": false
  }'`}</code>
                </pre>
              </div>

              {/* Bulk availability note */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                <span>Also supports batch date updates:</span>
                <code className="text-rose-400 font-bold">POST /api/v1/availability/bulk</code>
              </div>
            </div>
          </section>

          {/* Section: Rates API */}
          <section id="rates" className="space-y-6 scroll-mt-28 border-t border-slate-800/80 pt-10">
            <div className="space-y-1">
              <span className="text-xs font-bold text-rose-500 uppercase tracking-wider font-mono">Pricing</span>
              <h2 className="text-2xl font-bold text-white">Rates & Pricing API</h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Push updated nightly room pricing from your PMS rate manager.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 overflow-hidden space-y-4 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono text-xs px-2.5 py-1 rounded-lg font-bold">PUT</span>
                  <span className="font-mono text-sm font-semibold text-white">/api/v1/rates</span>
                </div>
                <Badge variant="outline" className="text-slate-400 text-[10px]">Required Scope: rates:write</Badge>
              </div>

              <div className="rounded-xl border border-slate-800 bg-[#060911] overflow-hidden">
                <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto">
                  <code>{`curl -X PUT "https://api.racoonn.com/v1/rates" \\
  -H "Authorization: Bearer rac_live_partner_xxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "roomId": "6a4646c700110e5fdaab",
    "date": "2026-10-15",
    "price": 4500,
    "currency": "INR"
  }'`}</code>
                </pre>
              </div>
            </div>
          </section>

          {/* Section: Reservations API */}
          <section id="reservations" className="space-y-6 scroll-mt-28 border-t border-slate-800/80 pt-10">
            <div className="space-y-1">
              <span className="text-xs font-bold text-rose-500 uppercase tracking-wider font-mono">Bookings</span>
              <h2 className="text-2xl font-bold text-white">Reservations & Conflict Guard</h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Create external reservations with automatic idempotency protection and atomic inventory deductions.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 overflow-hidden space-y-4 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono text-xs px-2.5 py-1 rounded-lg font-bold">POST</span>
                  <span className="font-mono text-sm font-semibold text-white">/api/v1/reservations</span>
                </div>
                <Badge variant="outline" className="text-slate-400 text-[10px]">Required Scope: reservations:create</Badge>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5" /> Mandatory Idempotency-Key Header
                </div>
                <p className="text-[11px] text-amber-300/80">
                  Every reservation creation must supply a unique <code>Idempotency-Key</code> (e.g. <code>PMS-RES-99812</code>). Replaying the same key will return the exact existing booking without creating duplicate charges or rooms.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-[#060911] overflow-hidden">
                <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto">
                  <code>{`curl -X POST "https://api.racoonn.com/v1/reservations" \\
  -H "Authorization: Bearer rac_live_partner_xxxx" \\
  -H "Idempotency-Key: PMS-BOOKING-99812" \\
  -H "Content-Type: application/json" \\
  -d '{
    "propertyId": "6a868a860030fc3f495d",
    "roomId": "6a4646c700110e5fdaab",
    "externalReference": "CHANNEX-REF-7711",
    "checkIn": "2026-10-15",
    "checkOut": "2026-10-18",
    "adults": 2,
    "guest": {
      "firstName": "Rohit",
      "lastName": "Sharma",
      "email": "rohit@example.com",
      "phone": "+919876543210"
    }
  }'`}</code>
                </pre>
              </div>

              {/* Cancellation Endpoint */}
              <div className="border-t border-slate-800 pt-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono text-xs px-2 py-0.5 rounded font-bold">POST</span>
                  <span className="font-mono text-xs text-white">/api/v1/reservations/{`{id}`}/cancel</span>
                </div>
                <p className="text-xs text-slate-400">
                  Cancels the reservation, restores available room inventory, and dispatches a <code>reservation.cancelled</code> webhook.
                </p>
              </div>
            </div>
          </section>

          {/* Section: Webhooks */}
          <section id="webhooks" className="space-y-6 scroll-mt-28 border-t border-slate-800/80 pt-10">
            <div className="space-y-1">
              <span className="text-xs font-bold text-rose-500 uppercase tracking-wider font-mono">Events</span>
              <h2 className="text-2xl font-bold text-white">Outbound Webhooks & HMAC Signatures</h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Receive instant push notifications when Racoonn bookings are created, updated, or cancelled by guests.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-white">Verifying Webhook Signatures</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Every webhook request sent by Racoonn includes the <code>X-Racoonn-Signature</code> header. Verify the signature by computing the HMAC SHA-256 of the raw payload string using your secret:
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-[#060911] p-4 text-xs font-mono text-slate-300">
                <span className="text-slate-500">// Node.js verification snippet</span><br />
                const crypto = require(&apos;crypto&apos;);<br />
                const expected = crypto.createHmac(&apos;sha256&apos;, webhookSecret).update(rawBody).digest(&apos;hex&apos;);<br />
                const isValid = crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
              </div>

              <div className="border-t border-slate-800 pt-3">
                <span className="text-xs font-semibold text-slate-300">Supported Event Types:</span>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[
                    "reservation.created",
                    "reservation.updated",
                    "reservation.cancelled",
                    "availability.updated",
                    "rate.updated",
                    "property.updated",
                    "room.updated",
                  ].map((evt) => (
                    <span key={evt} className="text-[11px] font-mono bg-slate-950 border border-slate-800 text-rose-400 px-2 py-0.5 rounded-md">
                      {evt}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Section: Sandbox */}
          <section id="sandbox" className="space-y-6 scroll-mt-28 border-t border-slate-800/80 pt-10">
            <div className="space-y-1">
              <span className="text-xs font-bold text-rose-500 uppercase tracking-wider font-mono">Sandbox</span>
              <h2 className="text-2xl font-bold text-white">Sandbox Testing Environment</h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Safely test your integration flows using dedicated sandbox credentials without affecting real live hotel availability.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-[#060911] border border-slate-800 space-y-1 font-mono text-xs">
                <span className="text-slate-500">Test Property ID</span>
                <p className="text-rose-400 font-bold text-sm">TEST_PROPERTY_001</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#060911] border border-slate-800 space-y-1 font-mono text-xs">
                <span className="text-slate-500">Test Room ID</span>
                <p className="text-blue-400 font-bold text-sm">TEST_ROOM_001</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#060911] border border-slate-800 space-y-1 font-mono text-xs">
                <span className="text-slate-500">Key Prefix</span>
                <p className="text-purple-400 font-bold text-sm">rac_test_partner_...</p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
