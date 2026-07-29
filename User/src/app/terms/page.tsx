import React from 'react';
import Link from 'next/link';
import { ShieldCheck, UserCircle, CreditCard, RefreshCcw, Building2, AlertTriangle, Copyright, Mail, ChevronRight } from 'lucide-react';

export const metadata = {
  title: 'Terms & Conditions | Racoonn',
  description: 'Terms and Conditions for using the Racoonn hotel booking platform.',
};

const sections = [
  { id: "introduction", title: "1. Introduction", icon: ShieldCheck },
  { id: "accounts", title: "2. User Accounts", icon: UserCircle },
  { id: "payments", title: "3. Booking & Payments", icon: CreditCard },
  { id: "cancellations", title: "4. Cancellations & Refunds", icon: RefreshCcw },
  { id: "vendor-liability", title: "5. Vendor Responsibilities", icon: Building2 },
  { id: "conduct", title: "6. User Conduct", icon: AlertTriangle },
  { id: "ip", title: "7. Intellectual Property", icon: Copyright },
  { id: "contact", title: "8. Contact Us", icon: Mail },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 text-slate-800 font-inter selection:bg-rose-500/20 selection:text-rose-900">
      
      {/* Hero Header Banner */}
      <div className="relative bg-slate-900 text-white overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-rose-500/20 blur-[100px]" />
          <div className="absolute bottom-[0%] right-[0%] w-[40%] h-[40%] rounded-full bg-blue-500/20 blur-[100px]" />
          <div className="absolute top-[20%] left-[40%] w-[30%] h-[30%] rounded-full bg-indigo-500/10 blur-[80px]" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-32 pb-24 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-rose-200 text-sm font-semibold tracking-wide mb-6">
            <ShieldCheck size={16} /> Legal Documentation
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
            Terms & Conditions
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl font-light">
            Everything you need to know about using the Racoonn platform safely and securely for your bookings.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4 text-sm text-slate-400 font-medium">
            <span>Effective Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            <span className="w-1 h-1 rounded-full bg-slate-600"></span>
            <span>Version 2.0</span>
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
                      <section.icon size={18} className="text-slate-400 group-hover:text-rose-500 transition-colors" />
                      <span className="text-sm">{section.title.split('. ')[1]}</span>
                    </div>
                    <ChevronRight size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 group-hover:-translate-x-1 transition-all" />
                  </a>
                ))}
              </nav>
            </div>
          </div>

          {/* Terms Content Clauses */}
          <div className="flex-1 space-y-12">
            
            {/* Clause 1 */}
            <section id="introduction" className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-12 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                  <ShieldCheck size={24} />
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900">1. Introduction</h2>
              </div>
              <div className="prose prose-slate prose-lg max-w-none text-slate-600 font-normal leading-relaxed">
                <p>
                  Welcome to Racoonn. These Terms and Conditions govern your use of the Racoonn website, mobile application, and services (collectively, the "Platform"). Racoonn operates as an online marketplace connecting guests ("Users") with hotel and property owners ("Vendors"). 
                </p>
                <p>
                  By accessing or using our Platform, you explicitly agree to comply with and be bound by these Terms. If you do not agree with any part of these terms, you must discontinue your use of the Platform immediately.
                </p>
              </div>
            </section>

            {/* Clause 2 */}
            <section id="accounts" className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-12 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                  <UserCircle size={24} />
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900">2. User Accounts</h2>
              </div>
              <div className="prose prose-slate prose-lg max-w-none text-slate-600 font-normal leading-relaxed">
                <p>
                  To unlock the full potential of Racoonn, registration is required. When you create an account with us, you guarantee that the information provided is accurate, complete, and current at all times. Inaccurate or obsolete information may result in the immediate termination of your account on the Platform.
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-4 marker:text-blue-500">
                  <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                  <li>You agree to accept responsibility for any and all activities or actions that occur under your account.</li>
                  <li>You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.</li>
                </ul>
              </div>
            </section>

            {/* Clause 3 */}
            <section id="payments" className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-12 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                  <CreditCard size={24} />
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900">3. Booking & Payments</h2>
              </div>
              <div className="prose prose-slate prose-lg max-w-none text-slate-600 font-normal leading-relaxed">
                <p>
                  When you finalize a reservation through Racoonn, you are establishing a direct, legally binding contractual relationship with the property Vendor.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <h4 className="font-bold text-slate-900 mb-2">Pricing & Taxes</h4>
                    <p className="text-sm">Room rates displayed include the base tariff. During checkout, statutory GST and any selected premium add-ons will be calculated dynamically and clearly itemized prior to payment.</p>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <h4 className="font-bold text-slate-900 mb-2">Secure Transactions</h4>
                    <p className="text-sm">Payments are processed instantly through our RBI-authorized, PCI-DSS compliant payment gateway providers. Racoonn does not store raw credit card numbers.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Clause 4 */}
            <section id="cancellations" className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-12 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                  <RefreshCcw size={24} />
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900">4. Cancellations & Refunds</h2>
              </div>
              <div className="prose prose-slate prose-lg max-w-none text-slate-600 font-normal leading-relaxed">
                <p>
                  Cancellation and prepayment policies vary heavily depending on the property type, time of booking, and specific vendor rules. These conditions are explicitly detailed on the property listing and during the checkout flow.
                </p>
                <p>
                  To cancel a booking, you must utilize the automated cancellation workflow within your Racoonn user dashboard. Refunds, if applicable, are routed back to the original payment method and typically take 5-7 business days to reflect in your statement.
                </p>
                <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl mt-4 flex gap-3 text-orange-900 text-sm">
                  <AlertTriangle className="shrink-0 text-orange-500" size={20} />
                  <p><strong>Note:</strong> Service fees or platform convenience charges levied by Racoonn are strictly non-refundable under any circumstance unless a cancellation is initiated due to a system fault.</p>
                </div>
              </div>
            </section>

            {/* Clause 5 */}
            <section id="vendor-liability" className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-12 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
                  <Building2 size={24} />
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900">5. Vendor Responsibilities</h2>
              </div>
              <div className="prose prose-slate prose-lg max-w-none text-slate-600 font-normal leading-relaxed">
                <p>
                  Racoonn provides a technology platform but does not own, manage, operate, or control the physical properties listed on the application. The Vendors maintain complete autonomy over their hotel operations.
                </p>
                <p>
                  Consequently, Racoonn is not liable for:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-4 marker:text-indigo-500">
                  <li>Discrepancies between listing photos and the actual property condition.</li>
                  <li>Quality of services, hygiene standards, or staff behavior at the property.</li>
                  <li>Any physical injury, loss of property, or damages incurred during your stay.</li>
                </ul>
                <p className="mt-4 text-sm text-slate-500 italic">
                  Any grievances or compensation claims related strictly to the accommodation experience must be directed to the respective property management.
                </p>
              </div>
            </section>

            {/* Clause 6 & 7 grouped */}
            <section id="conduct" className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-12 hover:shadow-md transition-shadow space-y-12">
              
              <div>
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                  <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                    <AlertTriangle size={24} />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900">6. User Conduct</h2>
                </div>
                <div className="prose prose-slate prose-lg max-w-none text-slate-600 font-normal leading-relaxed">
                  <p>
                    By engaging with our platform, you agree to refrain from any abusive, fraudulent, or harmful activities, including but not limited to: creating fake reservations, employing automated scraping bots against our architecture, or transmitting malicious code to compromise platform integrity.
                  </p>
                </div>
              </div>

              <div id="ip">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center shrink-0">
                    <Copyright size={24} />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900">7. Intellectual Property</h2>
                </div>
                <div className="prose prose-slate prose-lg max-w-none text-slate-600 font-normal leading-relaxed">
                  <p>
                    The Racoonn brand, logo, codebase, visual design language, and aggregated content are the exclusive property of Racoonn Ltd. Unauthorized duplication, modification, or distribution of our intellectual assets is strictly prohibited and subject to legal action under international copyright laws.
                  </p>
                </div>
              </div>

            </section>

            {/* Support / Contact Section */}
            <section id="contact" className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-xl p-8 md:p-12 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                <div>
                  <h2 className="text-3xl font-black mb-4 text-white">Still have questions?</h2>
                  <p className="text-slate-300 max-w-md text-lg font-light">
                    Our legal and support teams are available 24/7 to clarify any doubts you might have regarding these policies.
                  </p>
                </div>
                
                <div className="flex flex-col gap-4 w-full md:w-auto shrink-0">
                  <a href="mailto:legal@racoonn.com" className="flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white px-6 py-4 rounded-2xl font-bold transition-all group">
                    <Mail size={20} className="group-hover:scale-110 transition-transform" />
                    legal@racoonn.com
                  </a>
                  <Link href="/help" className="flex items-center justify-center gap-3 bg-rose-500 hover:bg-rose-600 text-white px-6 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-rose-500/30">
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
