import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Partner Privacy Policy & Data Governance | Racoonn Host Platform',
  description: 'How Racoonn collects, handles, stores, and protects partner business data, bank details, and guest reservation information under the Indian DPDP Act, 2023.',
};

const sections = [
  { id: "overview", num: "1", title: "Overview & Scope" },
  { id: "data-we-collect", num: "2", title: "Information We Collect from Partners" },
  { id: "how-we-use", num: "3", title: "Purpose of Processing Partner Data" },
  { id: "kyc-banking", num: "4", title: "KYC, Banking & Payout Security" },
  { id: "guest-data-handling", num: "5", title: "Partner Obligations for Guest Data" },
  { id: "data-sharing", num: "6", title: "Data Sharing & Third-Party Processors" },
  { id: "security-measures", num: "7", title: "Data Security & Cloud Infrastructure" },
  { id: "retention", num: "8", title: "Data Retention & Statutory Recordkeeping" },
  { id: "partner-rights", num: "9", title: "Partner Rights & Data Access" },
  { id: "confidentiality", num: "10", title: "Business Confidentiality" },
  { id: "updates", num: "11", title: "Policy Updates" },
  { id: "grievance-contact", num: "12", title: "Partner Grievance Officer & Contact Details" },
];

export default function VendorPrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white text-slate-800">
      
      {/* Clean Document Header matching /terms */}
      <div className="border-b border-slate-200 bg-slate-50/70 pt-16 pb-10">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-xs font-semibold text-rose-600 uppercase tracking-widest mb-2">Partner &amp; Supplier Data Governance</p>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-3">
            Partner Privacy Policy
          </h1>
          <p className="text-sm md:text-base text-slate-600 leading-relaxed mb-4">
            How Racoonn collects, verifies, protects, and governs partner business information, banking credentials, and guest booking telemetry.
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
            <span>Operated by: <strong>CIELLE TRAVELS PRIVATE LIMITED</strong></span>
            <span>&bull;</span>
            <span>Effective Date: October 12, 2026</span>
            <span>&bull;</span>
            <span>Version: v1.0</span>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        
        {/* Quick Navigation Table of Contents */}
        <div className="mb-12 p-6 rounded-xl bg-slate-50 border border-slate-200">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Table of Contents
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-slate-600">
            {sections.map((s) => (
              <a 
                key={s.id} 
                href={`#${s.id}`} 
                className="hover:text-rose-600 hover:underline py-0.5 truncate"
              >
                {s.num}. {s.title}
              </a>
            ))}
          </div>
        </div>

        {/* Content Clauses */}
        <div className="space-y-12 text-sm md:text-base leading-relaxed text-slate-700">

          {/* 1 */}
          <section id="overview" className="scroll-mt-20 border-b border-slate-100 pb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">1. Overview &amp; Scope</h2>
            <p className="mb-3">
              This Partner Privacy Policy outlines how <strong>CIELLE TRAVELS PRIVATE LIMITED</strong> (&quot;Racoonn&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) collects, maintains, verifies, and protects the personal and commercial information of accommodation partners, hotel managers, property owners, and authorized operators (&quot;Partner&quot;, &quot;Host&quot;, or &quot;you&quot;) utilizing the Racoonn Partner Extranet.
            </p>
            <p className="mb-3">
              This policy is formulated in strict compliance with the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong>, the <strong>Information Technology Act, 2000</strong>, and statutory e-commerce regulations in India.
            </p>
            <p>
              By registering on the Racoonn Partner Portal or submitting a property for listing, you acknowledge and consent to the data practices described in this policy.
            </p>
          </section>

          {/* 2 */}
          <section id="data-we-collect" className="scroll-mt-20 border-b border-slate-100 pb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">2. Information We Collect from Partners</h2>
            <p className="mb-3">To facilitate property listings, execute verified bookings, and disburse payouts, we collect the following partner information:</p>
            <div className="space-y-3">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <strong className="text-slate-900 block mb-1">A. Partner Identification &amp; Contact Records</strong>
                <p className="text-slate-600 text-sm">Full name of the property owner, authorized representative details, primary mobile number, alternative emergency contact numbers, email address, and official correspondence address.</p>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <strong className="text-slate-900 block mb-1">B. Business &amp; Statutory KYC Documents</strong>
                <p className="text-slate-600 text-sm">Permanent Account Number (PAN), Goods &amp; Services Tax Identification Number (GSTIN), business registration certificates (Udyam, MSME, Partnership Deed, Certificate of Incorporation), property ownership or lease agreements, and local municipal tourism/trade licenses.</p>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <strong className="text-slate-900 block mb-1">C. Banking &amp; Financial Information</strong>
                <p className="text-slate-600 text-sm">Designated beneficiary name, bank account number, IFSC code, bank branch details, UPI IDs, and cancelled cheques / bank statement proof required for booking payouts and statutory TDS reconciliation.</p>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <strong className="text-slate-900 block mb-1">D. Listing Content &amp; Media</strong>
                <p className="text-slate-600 text-sm">Property photographs, room descriptions, amenity lists, rate plans, seasonal tariffs, geo-coordinates, and property house rules.</p>
              </div>
            </div>
          </section>

          {/* 3 */}
          <section id="how-we-use" className="scroll-mt-20 border-b border-slate-100 pb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">3. Purpose of Processing Partner Data</h2>
            <p className="mb-3">We process partner data exclusively for verified business and legal requirements:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Listing Activation &amp; Marketing:</strong> Publishing authentic property listings and marketing your rooms to travelers across the Racoonn consumer marketplace.</li>
              <li><strong>Reservation Transmission:</strong> Forwarding confirmed guest bookings, reservation details, check-in alerts, and guest requests directly to your partner dashboard and registered contacts.</li>
              <li><strong>Payout Disbursement:</strong> Calculating and crediting booking settlements (net of commission) to your registered bank account within the agreed 72-hour post-checkout settlement cycle.</li>
              <li><strong>Tax Withholding &amp; Compliance:</strong> Complying with statutory Section 194-O (1% TDS on e-commerce operators) and TCS under GST, generating TDS certificates, and filing periodic audit returns.</li>
              <li><strong>Platform Security &amp; Fraud Prevention:</strong> Preventing identity theft, duplicate listing manipulation, unauthorized bank detail changes, and platform abuse.</li>
            </ul>
          </section>

          {/* 4 */}
          <section id="kyc-banking" className="scroll-mt-20 border-b border-slate-100 pb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">4. KYC, Banking &amp; Payout Security</h2>
            <p className="mb-3">
              Partner banking information is treated with highest security. Bank account numbers, IFSC codes, and UPI handles are stored within encrypted database environments with restricted access.
            </p>
            <p className="mb-3">
              <strong>Bank Account Modifications:</strong> Any update or change to your payout bank details requires strict multi-factor verification (OTP verification sent to the partner&apos;s registered primary mobile number and email) to prevent unauthorized interception of partner funds.
            </p>
          </section>

          {/* 5 */}
          <section id="guest-data-handling" className="scroll-mt-20 border-b border-slate-100 pb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">5. Partner Obligations for Guest Data</h2>
            <p className="mb-3">
              When a guest confirms a reservation through Racoonn, essential guest information (such as guest name, phone number, check-in dates, and special requests) is transmitted to the Partner strictly for the purpose of fulfilling the booked stay.
            </p>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm space-y-2 mb-3">
              <p><strong>Mandatory Partner Data Protection Rules:</strong></p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li>Partners must use guest details <em>exclusively</em> to facilitate check-in, room service, and on-property hospitality.</li>
                <li>Partners are strictly prohibited from adding guests to unsolicited WhatsApp broadcast lists, SMS marketing campaigns, or third-party telemarketing databases without independent affirmative consent.</li>
                <li>Partners must maintain physical guest registers and digital guest logs securely in accordance with local police and hotel registration regulations.</li>
              </ul>
            </div>
          </section>

          {/* 6 */}
          <section id="data-sharing" className="scroll-mt-20 border-b border-slate-100 pb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">6. Data Sharing &amp; Third-Party Processors</h2>
            <p className="mb-3">
              Racoonn does not sell or lease partner business records to external advertisers. We disclose partner data only to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Banking &amp; Settlement Gateways:</strong> RBI-licensed banking partners and payout gateways (e.g. Cashfree Payouts, RazorpayX, NEFT/RTGS networks) solely to transfer booking revenues to your account.</li>
              <li><strong>Government &amp; Tax Authorities:</strong> Income Tax Department (for 194-O TDS reporting) and GST authorities in accordance with Indian statutory mandates.</li>
              <li><strong>Guests:</strong> Basic property contact details (property phone, manager contact, Google Maps location) are displayed on booking vouchers so confirmed guests can reach the property.</li>
            </ul>
          </section>

          {/* 7 */}
          <section id="security-measures" className="scroll-mt-20 border-b border-slate-100 pb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">7. Data Security &amp; Cloud Infrastructure</h2>
            <p className="mb-3">
              We employ enterprise-grade technical safeguards including TLS 1.3 end-to-end transport encryption, encrypted database tables, and firewall systems to safeguard your extranet dashboard against unauthorized access or breaches.
            </p>
            <p>
              Partners are responsible for protecting their extranet login credentials. Sharing partner portal passwords with unauthorized third parties is strictly prohibited.
            </p>
          </section>

          {/* 8 */}
          <section id="retention" className="scroll-mt-20 border-b border-slate-100 pb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">8. Data Retention &amp; Statutory Recordkeeping</h2>
            <p className="mb-3">
              We retain partner business records and KYC documents throughout the active duration of the listing relationship. Following any voluntary delisting or termination:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Financial records, payout transaction histories, and tax invoices are retained for a minimum statutory period of eight (8) years under Section 36 of the CGST Act and Indian taxation guidelines.</li>
              <li>Inactive operational files and media assets are permanently purged or archived after all pending settlements and guest claims are fully resolved.</li>
            </ul>
          </section>

          {/* 9 */}
          <section id="partner-rights" className="scroll-mt-20 border-b border-slate-100 pb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">9. Partner Rights &amp; Data Access</h2>
            <p className="mb-3">Under the DPDP Act, partners have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Review, edit, and update property listings, bank information, and contact coordinates via the partner dashboard;</li>
              <li>Request an audit summary of payout settlements, commission deductions, and tax withholdings;</li>
              <li>Request account closure and listing deactivation by providing thirty (30) days&apos; written notice, subject to the fulfillment of existing confirmed bookings.</li>
            </ul>
          </section>

          {/* 10 */}
          <section id="confidentiality" className="scroll-mt-20 border-b border-slate-100 pb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">10. Business Confidentiality</h2>
            <p>
              Both Racoonn and the Partner agree to keep commercial fee structures, commission terms, negotiated rates, and extranet operational metrics strictly confidential, except where disclosure is required by law or judicial authority.
            </p>
          </section>

          {/* 11 */}
          <section id="updates" className="scroll-mt-20 border-b border-slate-100 pb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">11. Policy Updates</h2>
            <p>
              Racoonn may revise this Partner Privacy Policy periodically to reflect technological improvements or regulatory amendments. Updated policies will be published on the Partner Extranet with a revised effective date. Continued access to the partner dashboard constitutes acceptance of the updated terms.
            </p>
          </section>

          {/* 12 */}
          <section id="grievance-contact" className="scroll-mt-20">
            <h2 className="text-xl font-bold text-slate-900 mb-4">12. Partner Grievance Officer &amp; Contact Details</h2>
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl space-y-4 text-sm">
              <div>
                <p className="font-bold text-slate-900">Partner Support &amp; Data Controller</p>
                <p className="text-slate-600 mt-1">
                  <strong>CIELLE TRAVELS PRIVATE LIMITED</strong> (Racoonn Partner Network)
                </p>
                <p className="text-slate-600 mt-1">
                  <strong>CIN:</strong> U79110UR2023PTC015707 &bull; <strong>GSTIN:</strong> 05AAOCC0859Q1Z0
                </p>
                <p className="text-slate-600 mt-1">
                  <strong>Registered Office:</strong> B-81, Rose Villa, Samiah Lake City, Rudrapur, Kichha, Udham Singh Nagar - 263153, Uttarakhand, India
                </p>
                <p className="text-slate-600">
                  <strong>Corporate Office:</strong> Corp. Off.-205 PSA Plaza 2nd Floor 19 Kalyani View, Nainital Road Rudrapur 263153 U.S. Nagar (UK)
                </p>
                <p className="text-slate-600">
                  <strong>Partner Helpdesk:</strong> <a href="mailto:info@racoonn.com" className="text-rose-600 underline">info@racoonn.com</a> | +91 8954442144
                </p>
              </div>

              <div className="border-t border-slate-200 pt-3">
                <p className="font-bold text-slate-900">Partner Data Protection &amp; Grievance Redressal Officer</p>
                <p className="text-slate-600 mt-1">
                  <strong>Email:</strong> <a href="mailto:info@racoonn.com" className="text-rose-600 underline">info@racoonn.com</a>
                </p>
                <p className="text-slate-500 text-xs mt-1">
                  * Partner inquiries and data protection notices are acknowledged within 48 hours and resolved within 30 days as prescribed by law.
                </p>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
