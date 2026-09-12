"use client";

import React, { useState } from "react";
import {
  KeyRound, Shield, Zap, Copy, Check, Building2, Calendar, Layers, ArrowRight, Terminal, ExternalLink, Code2, Search, Lock, ChevronRight, RefreshCw, BellRing, Activity, Server, Code
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import RacoonnLogo from "@/assets/Racoonn-Logo-03.png";
import { Badge } from "@/components/ui/badge";

type Language = "curl" | "node" | "python";

export default function DevelopersPage() {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

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
    } catch (e) {
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
  ];

  return (
    <div className="min-h-screen bg-brand-sand/30 text-brand-charcoal font-sans selection:bg-brand-coral selection:text-white flex flex-col relative overflow-x-clip">
      
      {/* Decorative Gradients */}
      <div className="fixed top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-brand-coral/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-brand-navy/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-brand-navy/5 bg-white/80 backdrop-blur-xl shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3 group">
              <Image 
                src={RacoonnLogo} 
                alt="Racoonn Logo" 
                className="w-10 h-10 object-contain group-hover:scale-105 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-brand-coral/20 rounded-2xl" 
              />
              <span className="font-extrabold text-xl tracking-tight text-brand-navy flex items-center gap-1.5">
                Racoonn <span className="text-brand-coral/80 font-medium">Developers</span>
              </span>
            </Link>
            <Badge variant="outline" className="hidden sm:inline-flex text-brand-coral border-brand-coral/20 bg-brand-coral/5 text-[11px] font-mono px-2.5 py-0.5 rounded-full uppercase tracking-widest font-bold">
              v1.0.0
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-white/50 border border-brand-navy/10 rounded-full px-4 py-1.5 text-xs text-brand-navy font-medium shadow-inner">
              <span className="h-2 w-2 rounded-full bg-[#10b981] shadow-[0_0_8px_#10b981] animate-pulse"></span>
              <span>API Live: <code className="text-brand-coral font-bold bg-brand-coral/10 px-1.5 py-0.5 rounded-md">api.racoonn.com/v1</code></span>
            </div>
            
            <a 
              href="http://localhost:3000/vendor/settings" 
              className="flex items-center gap-2 bg-brand-coral hover:bg-[#d95d63] text-white px-5 py-2 rounded-full text-sm font-bold transition-all shadow-lg shadow-brand-coral/20 hover:shadow-xl hover:shadow-brand-coral/30 hover:-translate-y-0.5 group"
            >
              <KeyRound className="h-4 w-4 group-hover:rotate-12 transition-transform" />
              Generate API Key
            </a>
          </div>
        </div>
      </header>

      {/* Main Layout with Fixed Sidebar */}
      <div className="max-w-7xl mx-auto px-6 flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-10 py-10 relative z-10">
        
        {/* Left Sticky Sidebar */}
        <aside className="lg:col-span-3 hidden lg:block">
          <div className="sticky top-26 space-y-6">
            <div className="p-4 bg-white/80 backdrop-blur-md rounded-3xl border border-white shadow-xl shadow-brand-navy/5">
              <p className="text-[11px] font-bold uppercase tracking-widest text-brand-navy/50 px-3 py-2 mb-2">Documentation</p>
              <nav className="space-y-1.5">
                {navSections.map((sec) => {
                  const Icon = sec.icon;
                  const isActive = activeTab === sec.id;
                  return (
                    <button
                      key={sec.id}
                      onClick={() => {
                        setActiveTab(sec.id);
                        const el = document.getElementById(sec.id);
                        if (el) {
                          const y = el.getBoundingClientRect().top + window.scrollY - 100;
                          window.scrollTo({ top: y, behavior: 'smooth' });
                        }
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-300 group ${
                        isActive
                          ? "bg-linear-to-r from-brand-coral/10 to-transparent text-brand-coral border border-brand-coral/20 shadow-sm"
                          : "text-brand-navy/70 hover:text-brand-navy hover:bg-white border border-transparent hover:border-brand-navy/5 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-brand-coral/20' : 'bg-transparent group-hover:bg-brand-sand'}`}>
                          <Icon className={`h-4 w-4 ${isActive ? "text-brand-coral" : "text-brand-navy/50 group-hover:text-brand-navy/80"}`} />
                        </div>
                        <span>{sec.label}</span>
                      </div>
                      {isActive && <ChevronRight className="h-4 w-4 text-brand-coral animate-in slide-in-from-left-2" />}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Quick Status Box */}
            <div className="p-5 rounded-3xl bg-linear-to-br from-brand-navy to-[#2a3c5d] border border-brand-navy shadow-2xl text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <Shield size={64} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-white/90 uppercase tracking-widest">Security</span>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-1 rounded-full border border-emerald-500/30 backdrop-blur-md">
                    <Check className="h-3 w-3" /> SHA-256
                  </span>
                </div>
                <p className="text-[12px] text-brand-sky/80 leading-relaxed font-medium">
                  Keys are securely hashed in our integration vault. Never stored in plaintext.
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Content Area */}
        <main className="lg:col-span-9 space-y-24 pb-32">
          
          {/* Section: Overview */}
          <section id="overview" className="space-y-8 scroll-mt-32">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-coral/10 border border-brand-coral/20 text-brand-coral text-xs font-bold shadow-sm animate-in fade-in slide-in-from-bottom-2">
                <Activity className="h-3.5 w-3.5" /> Direct PMS Sync
              </div>
              <h1 className="text-4xl sm:text-5xl font-heading font-black tracking-tight text-brand-navy">
                Partner API <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-coral to-amber-500">Documentation</span>
              </h1>
              <p className="text-brand-navy/70 text-base sm:text-lg leading-relaxed max-w-3xl font-medium">
                Integrate with Racoonn to sync room availability, push dynamic pricing, fetch reservations, and receive webhook notifications in real-time. Designed for certified Property Management Systems (PMS) and Channel Managers.
              </p>
            </div>

            {/* High-level Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { icon: KeyRound, title: "Bearer Token Auth", desc: "Cryptographically secure API keys issued per partner integration.", color: "text-brand-coral", bg: "bg-brand-coral/10", border: "border-brand-coral/20" },
                { icon: Zap, title: "Guaranteed Idempotency", desc: "Mandatory Idempotency-Key on bookings prevents duplicate reservations.", color: "text-[#3b82f6]", bg: "bg-[#3b82f6]/10", border: "border-[#3b82f6]/20" },
                { icon: BellRing, title: "HMAC-Signed Webhooks", desc: "Outbound events signed with HMAC SHA-256 for authentic real-time sync.", color: "text-[#10b981]", bg: "bg-[#10b981]/10", border: "border-[#10b981]/20" }
              ].map((feature, i) => (
                <div key={i} className="p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 group">
                  <div className={`w-12 h-12 rounded-2xl ${feature.bg} flex items-center justify-center font-bold mb-4 border ${feature.border} group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`h-5 w-5 ${feature.color}`} />
                  </div>
                  <h3 className="font-bold text-brand-navy text-[15px] mb-2">{feature.title}</h3>
                  <p className="text-[13px] text-brand-navy/60 leading-relaxed font-medium">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Reusable Section Wrapper */}
          {(() => {
            const Section = ({ id, tag, title, desc, children }: any) => (
              <section id={id} className="space-y-6 scroll-mt-32 pt-8 relative">
                <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-brand-navy/10 to-transparent"></div>
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-brand-coral uppercase tracking-widest font-mono">{tag}</span>
                  <h2 className="text-3xl font-heading font-black text-brand-navy tracking-tight">{title}</h2>
                  <p className="text-sm sm:text-base text-brand-navy/70 font-medium max-w-3xl leading-relaxed">{desc}</p>
                </div>
                {children}
              </section>
            );

            // Reusable Dark Code Block
            const CodeBlock = ({ title, code, id }: { title: string, code: string, id: string }) => (
              <div className="rounded-[20px] border border-[#1e293b] bg-[#0f172a] shadow-2xl overflow-hidden group">
                <div className="px-4 py-3 bg-[#1e293b]/50 border-b border-[#1e293b] flex items-center justify-between backdrop-blur-md">
                  <div className="flex items-center gap-4">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]"></div>
                      <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]"></div>
                      <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]"></div>
                    </div>
                    <span className="text-[#94a3b8] font-mono text-xs font-semibold">{title}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(code, id)}
                    className="flex items-center gap-1.5 text-[#64748b] hover:text-white transition-colors bg-[#1e293b] hover:bg-[#334155] px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider"
                  >
                    {copiedKey === id ? <Check className="h-3.5 w-3.5 text-[#10b981]" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedKey === id ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <div className="p-5 overflow-x-auto">
                  <pre className="text-[13px] font-mono text-[#e2e8f0] leading-relaxed">
                    <code>{code}</code>
                  </pre>
                </div>
              </div>
            );

            return (
              <>
                {/* Section: Authentication */}
                <Section 
                  id="authentication" tag="Security" title="Authentication" 
                  desc={<>All requests to the Partner API must include your partner key in the HTTP <code className="bg-brand-navy/5 text-brand-coral px-1.5 py-0.5 rounded-md font-bold">Authorization</code> header using the standard Bearer scheme.</>}
                >
                  <CodeBlock 
                    title="Authorization Header"
                    id="auth_header"
                    code={`Authorization: Bearer rac_live_partner_7f82c1a89b3f42...`}
                  />
                </Section>

                {/* Section: Rate Limits */}
                <Section 
                  id="rate-limits" tag="Throttling" title="Rate Limits & Quotas" 
                  desc={<>Rate limiting protects inventory consistency. Exceeded quotas return HTTP <code className="bg-brand-navy/5 text-brand-coral px-1.5 py-0.5 rounded-md font-bold">429 Too Many Requests</code> with a <code className="bg-brand-navy/5 text-brand-coral px-1.5 py-0.5 rounded-md font-bold">Retry-After</code> response header.</>}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
                    <div className="p-5 rounded-[20px] bg-white border border-brand-navy/5 shadow-lg shadow-brand-navy/5 space-y-2 hover:-translate-y-1 transition-transform">
                      <div className="flex items-center justify-between font-bold text-brand-navy">
                        <span>Production Environment</span>
                        <Badge variant="secondary" className="bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20 text-[10px] uppercase tracking-widest font-bold">Live</Badge>
                      </div>
                      <p className="text-brand-navy/60 font-medium"><strong>1,000 requests</strong> per minute per partner key.</p>
                    </div>

                    <div className="p-5 rounded-[20px] bg-white border border-brand-navy/5 shadow-lg shadow-brand-navy/5 space-y-2 hover:-translate-y-1 transition-transform">
                      <div className="flex items-center justify-between font-bold text-brand-navy">
                        <span>Sandbox Environment</span>
                        <Badge variant="secondary" className="bg-[#8b5cf6]/10 text-[#8b5cf6] border-[#8b5cf6]/20 text-[10px] uppercase tracking-widest font-bold">Test</Badge>
                      </div>
                      <p className="text-brand-navy/60 font-medium"><strong>100 requests</strong> per minute per test key.</p>
                    </div>
                  </div>
                </Section>

                {/* Section: Properties API */}
                <Section 
                  id="properties" tag="Endpoints" title="Properties & Rooms" 
                  desc={<>Retrieve list of assigned properties and their rooms/units.</>}
                >
                  <div className="rounded-3xl border border-brand-navy/5 bg-white/80 backdrop-blur-xl overflow-hidden space-y-6 p-6 shadow-xl shadow-brand-navy/5">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20 font-mono text-xs px-3 py-1.5 rounded-lg font-black tracking-widest">GET</span>
                        <span className="font-mono text-[15px] font-bold text-brand-navy">/api/v1/properties</span>
                      </div>
                      <Badge variant="outline" className="text-brand-navy/50 border-brand-navy/10 bg-brand-navy/5 text-[10px] font-bold">Scope: properties:read</Badge>
                    </div>

                    <p className="text-[13px] font-medium text-brand-navy/70">
                      Returns paginated property listings. Query parameters: <code className="bg-brand-navy/5 text-brand-coral font-bold px-1.5 py-0.5 rounded">page</code> (default: 1), <code className="bg-brand-navy/5 text-brand-coral font-bold px-1.5 py-0.5 rounded">limit</code> (default: 50, max: 100).
                    </p>

                    <CodeBlock 
                      title="cURL Request" id="curl_prop"
                      code={'curl -X GET "https://api.racoonn.com/v1/properties?page=1&limit=50" \\\n  -H "Authorization: Bearer rac_live_partner_xxxx"'}
                    />
                  </div>
                </Section>

                {/* Section: Availability API */}
                <Section 
                  id="availability" tag="Inventory" title="Availability API" 
                  desc={<>Read and update room count availability and date blockage in real-time.</>}
                >
                  <div className="rounded-3xl border border-brand-navy/5 bg-white/80 backdrop-blur-xl overflow-hidden space-y-6 p-6 shadow-xl shadow-brand-navy/5">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/20 font-mono text-xs px-3 py-1.5 rounded-lg font-black tracking-widest">PUT</span>
                        <span className="font-mono text-[15px] font-bold text-brand-navy">/api/v1/availability</span>
                      </div>
                      <Badge variant="outline" className="text-brand-navy/50 border-brand-navy/10 bg-brand-navy/5 text-[10px] font-bold">Scope: availability:write</Badge>
                    </div>

                    <p className="text-[13px] font-medium text-brand-navy/70">
                      Update single date room count and block status. Dispatches <code className="bg-brand-navy/5 text-brand-coral font-bold px-1.5 py-0.5 rounded">availability.updated</code> event to webhooks.
                    </p>

                    <CodeBlock 
                      title="cURL Request" id="curl_avail"
                      code={`curl -X PUT "https://api.racoonn.com/v1/availability" \\
  -H "Authorization: Bearer rac_live_partner_xxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "roomId": "6a4646c700110e5fdaab",
    "date": "2026-10-15",
    "available": 4,
    "blocked": false
  }'`}
                    />
                  </div>
                </Section>

                {/* Section: Rates API */}
                <Section 
                  id="rates" tag="Pricing" title="Rates & Pricing API" 
                  desc={<>Push updated nightly room pricing from your PMS rate manager.</>}
                >
                  <div className="rounded-3xl border border-brand-navy/5 bg-white/80 backdrop-blur-xl overflow-hidden space-y-6 p-6 shadow-xl shadow-brand-navy/5">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/20 font-mono text-xs px-3 py-1.5 rounded-lg font-black tracking-widest">PUT</span>
                        <span className="font-mono text-[15px] font-bold text-brand-navy">/api/v1/rates</span>
                      </div>
                      <Badge variant="outline" className="text-brand-navy/50 border-brand-navy/10 bg-brand-navy/5 text-[10px] font-bold">Scope: rates:write</Badge>
                    </div>

                    <CodeBlock 
                      title="cURL Request" id="curl_rates"
                      code={`curl -X PUT "https://api.racoonn.com/v1/rates" \\
  -H "Authorization: Bearer rac_live_partner_xxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "roomId": "6a4646c700110e5fdaab",
    "date": "2026-10-15",
    "price": 4500,
    "currency": "INR"
  }'`}
                    />
                  </div>
                </Section>

                {/* Section: Reservations API */}
                <Section 
                  id="reservations" tag="Bookings" title="Reservations & Conflict Guard" 
                  desc={<>Create external reservations with automatic idempotency protection and atomic inventory deductions.</>}
                >
                  <div className="rounded-3xl border border-brand-navy/5 bg-white/80 backdrop-blur-xl overflow-hidden space-y-6 p-6 shadow-xl shadow-brand-navy/5">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20 font-mono text-xs px-3 py-1.5 rounded-lg font-black tracking-widest">POST</span>
                        <span className="font-mono text-[15px] font-bold text-brand-navy">/api/v1/reservations</span>
                      </div>
                      <Badge variant="outline" className="text-brand-navy/50 border-brand-navy/10 bg-brand-navy/5 text-[10px] font-bold">Scope: reservations:create</Badge>
                    </div>

                    <div className="p-4 bg-amber-50 border border-amber-200/60 rounded-2xl text-xs text-amber-900 space-y-2 shadow-sm">
                      <div className="font-bold flex items-center gap-2 text-amber-700 text-sm">
                        <div className="p-1.5 bg-amber-200/50 rounded-md"><Zap className="h-4 w-4" /></div> Mandatory Idempotency-Key
                      </div>
                      <p className="text-[12px] text-amber-800/80 leading-relaxed font-medium">
                        Every reservation creation must supply a unique <code className="bg-amber-200/40 px-1.5 py-0.5 rounded font-bold text-amber-900">Idempotency-Key</code>. Replaying the same key will return the exact existing booking without creating duplicate charges or rooms.
                      </p>
                    </div>

                    <CodeBlock 
                      title="cURL Request" id="curl_res"
                      code={`curl -X POST "https://api.racoonn.com/v1/reservations" \\
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
  }'`}
                    />
                  </div>
                </Section>

                {/* Section: Webhooks */}
                <Section 
                  id="webhooks" tag="Events" title="Outbound Webhooks & HMAC Signatures" 
                  desc={<>Receive instant push notifications when Racoonn bookings are created, updated, or cancelled by guests.</>}
                >
                  <div className="rounded-3xl border border-brand-navy/5 bg-white/80 backdrop-blur-xl overflow-hidden space-y-6 p-6 shadow-xl shadow-brand-navy/5">
                    <div className="space-y-2">
                      <h4 className="text-sm font-bold text-brand-navy">Verifying Webhook Signatures</h4>
                      <p className="text-[13px] text-brand-navy/70 leading-relaxed font-medium">
                        Every webhook request sent by Racoonn includes the <code className="bg-brand-navy/5 text-brand-coral font-bold px-1.5 py-0.5 rounded">X-Racoonn-Signature</code> header. Verify the signature by computing the HMAC SHA-256 of the raw payload string using your secret:
                      </p>
                    </div>

                    <CodeBlock 
                      title="Node.js snippet" id="code_webhooks"
                      code={`const crypto = require('crypto');\nconst expected = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');\nconst isValid = crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));`}
                    />

                    <div className="pt-2">
                      <span className="text-xs font-bold text-brand-navy uppercase tracking-widest">Supported Event Types:</span>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {[
                          "reservation.created", "reservation.updated", "reservation.cancelled",
                          "availability.updated", "rate.updated", "property.updated", "room.updated",
                        ].map((evt) => (
                          <span key={evt} className="text-[11px] font-mono font-bold bg-brand-navy/5 border border-brand-navy/10 text-brand-coral px-2.5 py-1 rounded-lg">
                            {evt}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Section>
              </>
            );
          })()}
        </main>
      </div>
    </div>
  );
}
