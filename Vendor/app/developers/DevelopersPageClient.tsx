"use client";

import React, { useState } from "react";
import {
  KeyRound, Shield, Zap, Copy, Check, Building2, Calendar, Layers,
  Terminal, Lock, ChevronRight, BellRing, Activity, Server, AlertCircle, ArrowLeft
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import RacoonnLogo from "@/assets/Racoonn-Logo-03.png";

export default function DevelopersPageClient() {
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
    { id: "authentication", label: "Authentication & Errors", icon: KeyRound },
    { id: "rate-limits", label: "Rate Limits", icon: Zap },
    { id: "channel-manager", label: "Channel Manager Integration", icon: Activity },
    { id: "properties", label: "Properties & Rooms API", icon: Building2 },
    { id: "availability", label: "Availability API", icon: Calendar },
    { id: "rates", label: "Rates API", icon: Server },
    { id: "reservations", label: "Reservations API", icon: Lock },
    { id: "webhooks", label: "Webhooks & Endpoints", icon: BellRing },
    { id: "sandbox", label: "Sandbox & Testing", icon: Terminal },
  ];

  const Section = ({ id, tag, title, desc, children }: any) => (
    <section id={id} className="space-y-6 scroll-mt-24 pt-8 border-t border-slate-200">
      <div className="space-y-2">
        <span className="text-xs font-bold text-rose-600 uppercase tracking-widest font-mono">{tag}</span>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">{title}</h2>
        <p className="text-sm md:text-base text-slate-600 font-normal max-w-3xl leading-relaxed">{desc}</p>
      </div>
      {children}
    </section>
  );

  const CodeBlock = ({ title, code, id }: { title: string; code: string; id: string }) => (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 shadow-xl overflow-hidden group">
      <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
          </div>
          <span className="text-slate-400 font-mono text-xs">{title}</span>
        </div>
        <button
          onClick={() => copyToClipboard(code, id)}
          className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider cursor-pointer"
        >
          {copiedKey === id ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
          <span>{copiedKey === id ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <div className="p-4 md:p-5 overflow-x-auto text-[13px] font-mono text-slate-200 leading-relaxed">
        <pre><code>{code}</code></pre>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-rose-500 selection:text-white flex flex-col">
      
      {/* Top Header */}
      <header className="border-b border-slate-200 bg-slate-50/80 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3 group">
              <Image 
                src={RacoonnLogo} 
                alt="Racoonn Logo" 
                className="w-9 h-9 object-contain group-hover:scale-105 transition-all rounded-xl" 
              />
              <span className="font-bold text-lg tracking-tight text-slate-900 flex items-center gap-1.5">
                Racoonn <span className="text-rose-600 font-medium">Developers</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              href="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white transition-all shadow-xs"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Portal</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Two-Column Layout */}
      <div className="max-w-7xl mx-auto px-6 flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-10 py-10">
        
        {/* Left Sticky Sidebar */}
        <aside className="lg:col-span-3 hidden lg:block">
          <div className="sticky top-26 space-y-6">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 px-3 py-2 mb-1">Navigation Index</p>
              <nav className="space-y-1">
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
                          const y = el.getBoundingClientRect().top + window.scrollY - 90;
                          window.scrollTo({ top: y, behavior: 'smooth' });
                        }
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : "text-slate-600 hover:text-slate-900 hover:bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-rose-600" : "text-slate-400"}`} />
                        <span className="truncate">{sec.label}</span>
                      </div>
                      {isActive && <ChevronRight className="h-3 w-3 text-rose-600 shrink-0" />}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </aside>

        {/* Right Main Documentation Content */}
        <main className="lg:col-span-9 space-y-16 pb-24">
          
          {/* Overview Section */}
          <section id="overview" className="space-y-6 scroll-mt-24">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                <Activity className="h-3.5 w-3.5" /> Channel Manager &amp; PMS Sync
              </div>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900">
                Partner API Documentation
              </h1>
              <p className="text-slate-600 text-base md:text-lg leading-relaxed max-w-3xl">
                The Racoonn Partner API allows certified Property Management Systems (PMS) and Channel Managers (e.g., STAAH, RateGain, SiteMinder, AxisRooms) to sync room availability, manage dynamic pricing, create &amp; fetch guest reservations, and listen to real-time webhook events.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold mb-3">
                  <KeyRound className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">Bearer Token Auth</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Cryptographically secure API keys hashed via SHA-256 and scoped per partner integration.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold mb-3">
                  <Zap className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">Guaranteed Idempotency</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Mandatory <code>Idempotency-Key</code> on bookings guarantees safe retries and prevents double bookings.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold mb-3">
                  <BellRing className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">HMAC-Signed Webhooks</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Outbound events signed with HMAC SHA-256 signatures for zero-trust delivery verification.
                </p>
              </div>
            </div>
          </section>

          {/* Section: Authentication & Errors */}
          <Section 
            id="authentication" tag="Security &amp; Errors" title="Authentication &amp; Error Handling" 
            desc="Authenticate all incoming requests by supplying your integration API key in the Authorization header. Handle standardized API error envelopes."
          >
            <div className="space-y-4">
              <CodeBlock 
                id="auth-header" 
                title="Authorization Header" 
                code={`Authorization: Bearer rac_live_partner_abc123xyz789\nX-Request-ID: req_partner_1001`} 
              />
              
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-slate-900 text-sm">Standard Error Response Envelope</h4>
                <CodeBlock 
                  id="error-response" 
                  title="4xx / 5xx JSON Error Format" 
                  code={`{
  "success": false,
  "error": {
    "code": "ROOM_NOT_AVAILABLE",
    "message": "The requested room is not available on 2026-10-15.",
    "details": null
  }
}`} 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="font-mono font-bold text-slate-900">401 MISSING_AUTHORIZATION</span>
                  <p className="text-slate-600">Bearer token was missing or revoked in the API registry.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="font-mono font-bold text-slate-900">403 FORBIDDEN</span>
                  <p className="text-slate-600">API Key lacks permission or tenant property authorization.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="font-mono font-bold text-slate-900">409 ROOM_NOT_AVAILABLE</span>
                  <p className="text-slate-600">Room is sold out or blocked on one of the requested dates.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="font-mono font-bold text-slate-900">422 VALIDATION_ERROR</span>
                  <p className="text-slate-600">Request payload failed schema validation (Zod inspection).</p>
                </div>
              </div>
            </div>
          </Section>

          {/* Section: Rate Limits */}
          <Section 
            id="rate-limits" tag="Reliability" title="Rate Limits &amp; Quotas" 
            desc="Standard API limits to protect platform stability and ensure continuous high availability."
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-1">Standard Queries</span>
                <p className="text-2xl font-bold text-slate-900">120 <span className="text-xs font-normal text-slate-500">requests/min</span></p>
                <p className="text-xs text-slate-500 mt-2">Applies to GET properties, rooms, availability, and reservations.</p>
              </div>
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-1">Bulk Price &amp; Inventory Push</span>
                <p className="text-2xl font-bold text-slate-900">30 <span className="text-xs font-normal text-slate-500">requests/min</span></p>
                <p className="text-xs text-slate-500 mt-2">Applies to POST /availability/bulk and POST /rates/bulk endpoints.</p>
              </div>
            </div>
          </Section>

          {/* Section: Channel Manager Integration */}
          <Section 
            id="channel-manager" tag="Architecture" title="Channel Manager Two-Way Sync" 
            desc="How certified Channel Managers and PMS systems synchronize room inventory, pricing, and bookings with Racoonn."
          >
            <div className="space-y-4 text-sm text-slate-600">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900">Two-Way Synchronization Lifecycle</h4>
                <ol className="list-decimal pl-5 space-y-2 text-xs text-slate-600 leading-relaxed">
                  <li><strong>Inbound Inventory (PMS ➔ Racoonn):</strong> Push daily room allocations and rate updates via <code>POST /api/v1/availability/bulk</code> and <code>POST /api/v1/rates/bulk</code>.</li>
                  <li><strong>Instant Booking (Racoonn ➔ PMS):</strong> Racoonn dispatches signed webhooks (<code>reservation.created</code>) when a guest completes a booking on racoonn.com.</li>
                  <li><strong>Direct PMS Bookings (PMS ➔ Racoonn):</strong> PMS sends <code>POST /api/v1/reservations</code> with mandatory <code>Idempotency-Key</code> header to block inventory for walk-ins or other OTAs.</li>
                  <li><strong>Reconciliation:</strong> Channel manager polls <code>GET /api/v1/reservations</code> to verify acknowledged bookings.</li>
                </ol>
              </div>
            </div>
          </Section>

          {/* Section: Properties & Rooms API */}
          <Section 
            id="properties" tag="Core" title="Properties &amp; Rooms API" 
            desc="Fetch listed property metadata, address details, and room categories configured in Racoonn."
          >
            <div className="space-y-4">
              <CodeBlock 
                id="get-properties" 
                title="GET /api/v1/properties" 
                code={`curl -X GET "https://partner.racoonn.com/api/v1/properties?limit=20&page=1" \\
  -H "Authorization: Bearer rac_live_..." \\
  -H "Content-Type: application/json"`} 
              />
              <CodeBlock 
                id="properties-response" 
                title="200 OK Response" 
                code={`{
  "success": true,
  "data": [
    {
      "id": "prop_rudrapur_01",
      "name": "Racoonn Lake View Resort",
      "type": "Resort",
      "status": "active",
      "address": {
        "city": "Rudrapur",
        "state": "Uttarakhand",
        "country": "IN",
        "location": "Lalkuan Highway"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "hasNextPage": false
  }
}`} 
              />

              <div className="pt-2">
                <CodeBlock 
                  id="get-room" 
                  title="GET /api/v1/rooms/{roomId}" 
                  code={`curl -X GET "https://partner.racoonn.com/api/v1/rooms/room_deluxe_01" \\
  -H "Authorization: Bearer rac_live_..."`} 
                />
              </div>
            </div>
          </Section>

          {/* Section: Availability API */}
          <Section 
            id="availability" tag="Inventory" title="Availability API" 
            desc="Query current availability or push bulk allocations and stop-sell flags across calendar dates."
          >
            <div className="space-y-4">
              <CodeBlock 
                id="get-availability" 
                title="GET /api/v1/availability?roomId=room_deluxe_01&from=2026-10-15&to=2026-10-20" 
                code={`curl -X GET "https://partner.racoonn.com/api/v1/availability?roomId=room_deluxe_01&from=2026-10-15&to=2026-10-20" \\
  -H "Authorization: Bearer rac_live_..."`} 
              />

              <CodeBlock 
                id="post-availability-bulk" 
                title="POST /api/v1/availability/bulk" 
                code={`curl -X POST "https://partner.racoonn.com/api/v1/availability/bulk" \\
  -H "Authorization: Bearer rac_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "propertyId": "prop_rudrapur_01",
    "updates": [
      {
        "roomId": "room_deluxe_01",
        "date": "2026-10-15",
        "available": 5,
        "blocked": false,
        "price": 4500
      },
      {
        "roomId": "room_deluxe_01",
        "date": "2026-10-16",
        "available": 0,
        "blocked": true
      }
    ]
  }'`} 
              />

              <CodeBlock 
                id="availability-bulk-response" 
                title="200 OK Bulk Response" 
                code={`{
  "success": true,
  "processed": 2,
  "results": [
    { "roomId": "room_deluxe_01", "date": "2026-10-15", "status": "updated" },
    { "roomId": "room_deluxe_01", "date": "2026-10-16", "status": "updated" }
  ]
}`} 
              />
            </div>
          </Section>

          {/* Section: Rates API */}
          <Section 
            id="rates" tag="Pricing" title="Rates API" 
            desc="Query dynamic tariffs or push bulk nightly rates for active room categories."
          >
            <div className="space-y-4">
              <CodeBlock 
                id="get-rates" 
                title="GET /api/v1/rates?roomId=room_deluxe_01&from=2026-10-15&to=2026-10-20" 
                code={`curl -X GET "https://partner.racoonn.com/api/v1/rates?roomId=room_deluxe_01&from=2026-10-15&to=2026-10-20" \\
  -H "Authorization: Bearer rac_live_..."`} 
              />

              <CodeBlock 
                id="post-rates-bulk" 
                title="POST /api/v1/rates/bulk" 
                code={`curl -X POST "https://partner.racoonn.com/api/v1/rates/bulk" \\
  -H "Authorization: Bearer rac_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "propertyId": "prop_rudrapur_01",
    "updates": [
      {
        "roomId": "room_deluxe_01",
        "date": "2026-10-15",
        "price": 4500,
        "currency": "INR"
      },
      {
        "roomId": "room_deluxe_01",
        "date": "2026-10-16",
        "price": 5200,
        "currency": "INR"
      }
    ]
  }'`} 
              />
            </div>
          </Section>

          {/* Section: Reservations API */}
          <Section 
            id="reservations" tag="Bookings" title="Reservations API" 
            desc="Create reservations with Idempotency-Key, query guest bookings, and cancel reservations with automatic inventory rollback."
          >
            <div className="space-y-4">
              <CodeBlock 
                id="create-reservation" 
                title="POST /api/v1/reservations (Create Reservation)" 
                code={`curl -X POST "https://partner.racoonn.com/api/v1/reservations" \\
  -H "Authorization: Bearer rac_live_..." \\
  -H "Idempotency-Key: PMS-REQ-20261012-9981" \\
  -H "Content-Type: application/json" \\
  -d '{
    "propertyId": "prop_rudrapur_01",
    "roomId": "room_deluxe_01",
    "checkIn": "2026-10-20",
    "checkOut": "2026-10-22",
    "adults": 2,
    "children": 0,
    "guest": {
      "firstName": "Vivek",
      "lastName": "Kumar",
      "email": "vivek.kumar@example.com",
      "phone": "+91 9876543210"
    },
    "totalAmount": 9000,
    "currency": "INR",
    "externalReference": "PMS-BOOKING-9941"
  }'`} 
              />

              <CodeBlock 
                id="get-reservations" 
                title="GET /api/v1/reservations?propertyId=prop_rudrapur_01" 
                code={`curl -X GET "https://partner.racoonn.com/api/v1/reservations?propertyId=prop_rudrapur_01&limit=25" \\
  -H "Authorization: Bearer rac_live_..."`} 
              />

              <CodeBlock 
                id="cancel-reservation" 
                title="POST /api/v1/reservations/{reservationId}/cancel (Cancel Booking)" 
                code={`curl -X POST "https://partner.racoonn.com/api/v1/reservations/res_673fa102/cancel" \\
  -H "Authorization: Bearer rac_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "reason": "Guest requested cancellation via PMS",
    "externalReference": "PMS-CANCEL-102"
  }'`} 
              />
            </div>
          </Section>

          {/* Section: Webhooks & Endpoints */}
          <Section 
            id="webhooks" tag="Real-Time Sync" title="Webhooks &amp; Endpoints" 
            desc="Register your webhook callback URL to receive instantaneous notifications when bookings or inventory change."
          >
            <div className="space-y-4">
              <CodeBlock 
                id="register-webhook" 
                title="POST /api/v1/webhooks/endpoints (Register Webhook URL)" 
                code={`curl -X POST "https://partner.racoonn.com/api/v1/webhooks/endpoints" \\
  -H "Authorization: Bearer rac_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://pms.yourdomain.com/webhooks/racoonn",
    "events": [
      "reservation.created",
      "reservation.updated",
      "reservation.cancelled",
      "availability.updated"
    ]
  }'`} 
              />

              <CodeBlock 
                id="webhook-verify" 
                title="Node.js HMAC SHA-256 Signature Verification" 
                code={`const crypto = require('crypto');

function verifyRacoonnWebhook(rawBody, signatureHeader, secretKey) {
  const hash = crypto
    .createHmac('sha256', secretKey)
    .update(rawBody)
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signatureHeader));
}`} 
              />

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <span className="font-bold text-slate-900 uppercase tracking-wider block">Supported Event Types</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    "reservation.created", "reservation.updated", "reservation.cancelled",
                    "availability.updated", "rate.updated", "property.updated", "room.updated",
                  ].map((evt) => (
                    <span key={evt} className="font-mono bg-white border border-slate-300 text-rose-600 px-2 py-0.5 rounded-md font-semibold">
                      {evt}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          {/* Section: Sandbox */}
          <Section 
            id="sandbox" tag="Testing" title="Sandbox Testing Environment" 
            desc="Safely test your integration flows using dedicated sandbox credentials without affecting real live hotel availability."
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1 font-mono text-xs">
                <span className="text-slate-500 font-semibold">Test Property ID</span>
                <p className="text-slate-900 font-bold text-sm">TEST_PROPERTY_001</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1 font-mono text-xs">
                <span className="text-slate-500 font-semibold">Test Room ID</span>
                <p className="text-slate-900 font-bold text-sm">TEST_ROOM_001</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1 font-mono text-xs">
                <span className="text-slate-500 font-semibold">Key Prefix</span>
                <p className="text-rose-600 font-bold text-sm">rac_test_partner_...</p>
              </div>
            </div>
          </Section>

        </main>
      </div>
    </div>
  );
}
