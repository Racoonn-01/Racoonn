import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Database, Eye, Share2, Lock, Cookie, Server, Mail, ChevronRight } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | Racoonn',
  description: 'Privacy Policy and data handling practices for the Racoonn hotel booking platform.',
};

const sections = [
  { id: "information-collection", title: "1. Information We Collect", icon: Database },
  { id: "how-we-use", title: "2. How We Use Your Data", icon: Eye },
  { id: "data-sharing", title: "3. Data Sharing & Vendors", icon: Share2 },
  { id: "data-security", title: "4. Data Security", icon: Lock },
  { id: "cookies", title: "5. Cookies & Tracking", icon: Cookie },
  { id: "data-retention", title: "6. Data Retention", icon: Server },
  { id: "contact", title: "7. Contact Us", icon: Mail },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 text-slate-800 font-inter selection:bg-emerald-500/20 selection:text-emerald-900">
      
      {/* Hero Header Banner */}
      <div className="relative bg-slate-900 text-white overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-emerald-500/20 blur-[100px]" />
          <div className="absolute bottom-[0%] left-[0%] w-[40%] h-[40%] rounded-full bg-blue-500/20 blur-[100px]" />
          <div className="absolute top-[20%] right-[40%] w-[30%] h-[30%] rounded-full bg-indigo-500/10 blur-[80px]" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-32 pb-24 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-emerald-200 text-sm font-semibold tracking-wide mb-6">
            <ShieldCheck size={16} /> Privacy & Security
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
            Privacy Policy
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl font-light">
            We are committed to protecting your personal information and your right to privacy when you use the Racoonn platform.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4 text-sm text-slate-400 font-medium">
            <span>Effective Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            <span className="w-1 h-1 rounded-full bg-slate-600"></span>
            <span>Version 1.1</span>
          </div>
        </div>
        
        {/* Bottom Curve */}
        <div className="absolute bottom-0 w-full h-12 bg-[#F8FAFC]" style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 0, 0 100%)' }}></div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 -mt-8 relative z-20">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Sticky Sidebar Navigation */}
          <div className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-28 bg-white rounded-3xl shadow-sm shadow-slate-200/50 border border-slate-100 p-6 overflow-hidden">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 px-4">Contents</h3>
              <nav className="space-y-1">
                {sections.map((section) => (
                  <a 
                    key={section.id} 
                    href={`#${section.id}`}
                    className="flex items-center justify-between group px-4 py-3 rounded-2xl hover:bg-slate-50 transition-colors text-slate-600 hover:text-slate-900 font-medium"
                  >
                    <div className="flex items-center gap-3">
                      <section.icon size={18} className="text-slate-400 group-hover:text-emerald-500 transition-colors" />
                      <span className="text-sm">{section.title.split('. ')[1]}</span>
                    </div>
                    <ChevronRight size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 group-hover:-translate-x-1 transition-all" />
                  </a>
                ))}
              </nav>
            </div>
          </div>

          {/* Privacy Content Clauses */}
          <div className="flex-1 space-y-12">
            
            {/* Clause 1 */}
            <section id="information-collection" className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-12 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
                  <Database size={24} />
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900">1. Information We Collect</h2>
              </div>
              <div className="prose prose-slate prose-lg max-w-none text-slate-600 font-normal leading-relaxed">
                <p>
                  We collect personal information that you voluntarily provide to us when you register on the Racoonn Platform, express an interest in obtaining information about us or our products and services, when you participate in activities on the Platform, or otherwise when you contact us.
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-4 marker:text-indigo-500">
                  <li><strong>Personal Data:</strong> Names, phone numbers, email addresses, mailing addresses, usernames, and passwords.</li>
                  <li><strong>Payment Data:</strong> Data necessary to process your payment if you make purchases, such as your payment instrument number and security code. All payment data is stored by our payment processors.</li>
                  <li><strong>Booking Data:</strong> Travel dates, special requests, names of co-travelers, and accommodation preferences.</li>
                </ul>
              </div>
            </section>

            {/* Clause 2 */}
            <section id="how-we-use" className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-12 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                  <Eye size={24} />
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900">2. How We Use Your Data</h2>
              </div>
              <div className="prose prose-slate prose-lg max-w-none text-slate-600 font-normal leading-relaxed">
                <p>
                  We process your information for purposes based on legitimate business interests, the fulfillment of our contract with you, compliance with our legal obligations, and/or your consent. We use personal information collected via our Platform to:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-4 marker:text-emerald-500">
                  <li>Facilitate account creation and authentication and otherwise manage user accounts.</li>
                  <li>Fulfill and manage your bookings and payments made through the Platform.</li>
                  <li>Deliver targeted advertising, promotions, and updates if you have opted in.</li>
                  <li>Respond to user inquiries and offer customer support.</li>
                </ul>
              </div>
            </section>

            {/* Clause 3 */}
            <section id="data-sharing" className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-12 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                  <Share2 size={24} />
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900">3. Data Sharing & Vendors</h2>
              </div>
              <div className="prose prose-slate prose-lg max-w-none text-slate-600 font-normal leading-relaxed">
                <p>
                  To provide our services, we may share your data with third-party vendors, service providers, contractors, or agents who perform services for us or on our behalf. 
                </p>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mt-6">
                  <h4 className="font-bold text-slate-900 mb-2">Hotel Partners (Vendors)</h4>
                  <p className="text-sm">When you book a room, we share essential details (such as your name, contact information, and special requests) with the specific hotel Vendor so they can prepare for your stay and fulfill your reservation.</p>
                </div>
              </div>
            </section>

            {/* Clause 4 */}
            <section id="data-security" className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-12 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                  <Lock size={24} />
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900">4. Data Security</h2>
              </div>
              <div className="prose prose-slate prose-lg max-w-none text-slate-600 font-normal leading-relaxed">
                <p>
                  We have implemented appropriate and reasonable technical and organizational security measures designed to protect the security of any personal information we process. Our platform relies on robust encryption, SSL certificates, and secure cloud infrastructure.
                </p>
                <p>
                  However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure. You should only access the Platform within a secure environment.
                </p>
              </div>
            </section>

            {/* Clause 5 & 6 grouped */}
            <section className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-12 hover:shadow-md transition-shadow space-y-12">
              
              <div id="cookies">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                    <Cookie size={24} />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900">5. Cookies & Tracking</h2>
                </div>
                <div className="prose prose-slate prose-lg max-w-none text-slate-600 font-normal leading-relaxed">
                  <p>
                    We may use cookies and similar tracking technologies (like web beacons and pixels) to access or store information. Specific details regarding our use of these technologies are designed to improve your user experience and maintain platform analytics.
                  </p>
                </div>
              </div>

              <div id="data-retention">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                    <Server size={24} />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900">6. Data Retention</h2>
                </div>
                <div className="prose prose-slate prose-lg max-w-none text-slate-600 font-normal leading-relaxed">
                  <p>
                    We will only keep your personal information for as long as it is necessary for the purposes set out in this privacy notice, unless a longer retention period is required or permitted by law (such as tax, accounting, or other legal requirements).
                  </p>
                </div>
              </div>

            </section>

            {/* Support / Contact Section */}
            <section id="contact" className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-xl p-8 md:p-12 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                <div>
                  <h2 className="text-3xl font-black mb-4 text-white">Privacy Concerns?</h2>
                  <p className="text-slate-300 max-w-md text-lg font-light">
                    If you have questions or comments about your privacy rights, you may email our Data Protection Officer (DPO).
                  </p>
                </div>
                
                <div className="flex flex-col gap-4 w-full md:w-auto shrink-0">
                  <a href="mailto:privacy@racoonn.com" className="flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white px-6 py-4 rounded-2xl font-bold transition-all group">
                    <Mail size={20} className="group-hover:scale-110 transition-transform" />
                    privacy@racoonn.com
                  </a>
                  <Link href="/help" className="flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-500/30">
                    Visit Help Center
                  </Link>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
