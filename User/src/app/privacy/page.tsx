import { Metadata } from 'next';
import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://racoonn.com';

export const metadata: Metadata = {
  title: 'Privacy Policy | Data Protection & Privacy Practices | Racoonn',
  description: 'Learn how Racoonn collects, uses, encrypts, and protects your personal data, payment details, and travel reservations under the Indian DPDP Act, 2023.',
  alternates: {
    canonical: `${siteUrl}/privacy`,
  },
  openGraph: {
    title: 'Privacy Policy | Racoonn',
    description: 'Learn how Racoonn and CIELLE TRAVELS PRIVATE LIMITED protect your personal information and privacy.',
    url: `${siteUrl}/privacy`,
    siteName: 'Racoonn',
    locale: 'en_IN',
    type: 'website',
  },
};

const sections = [
  { id: "overview", num: "1", title: "Overview & Scope" },
  { id: "data-we-collect", num: "2", title: "Information We Collect" },
  { id: "how-we-use", num: "3", title: "How We Use Your Personal Data" },
  { id: "legal-basis", num: "4", title: "Lawful Grounds for Processing (DPDP Act, 2023)" },
  { id: "sharing-disclosure", num: "5", title: "Data Sharing with Hotels & Service Partners" },
  { id: "payment-security", num: "6", title: "Payment Processing & Financial Data" },
  { id: "cookies-analytics", num: "7", title: "Cookies, Web Beacons & Tracking" },
  { id: "data-retention", num: "8", title: "Data Retention & Storage" },
  { id: "security-measures", num: "9", title: "Information Security Measures" },
  { id: "user-rights", num: "10", title: "Your Privacy Rights & Choices" },
  { id: "children-privacy", num: "11", title: "Children's Privacy" },
  { id: "policy-updates", num: "12", title: "Updates to this Privacy Policy" },
  { id: "grievance-contact", num: "13", title: "Grievance Officer & Contact Details" },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white text-slate-800">
      
      {/* Simple, Clean Header matching /terms */}
      <div className="border-b border-slate-200 bg-slate-50/70 pt-28 pb-10">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-xs font-semibold text-rose-600 uppercase tracking-widest mb-2">Legal &amp; Data Protection</p>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-3">
            Privacy Policy
          </h1>
          <p className="text-sm md:text-base text-slate-600 leading-relaxed mb-4">
            How Racoonn collects, handles, stores, and safeguards your personal data across our web platform and reservation systems.
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
            <span>Operated by: <strong>CIELLE TRAVELS PRIVATE LIMITED</strong></span>
            <span>&bull;</span>
            <span>Effective Date: October 12, 2026</span>
            <span>&bull;</span>
            <span>Version 2.1</span>
          </div>
        </div>
      </div>

      {/* Main Body Layout */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        
        {/* Quick Navigation Index */}
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
          <section id="overview" className="scroll-mt-24 border-b border-slate-100 pb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">1. Overview &amp; Scope</h2>
            <p className="mb-3">
              This Privacy Policy describes the privacy practices of <strong>CIELLE TRAVELS PRIVATE LIMITED</strong> (&quot;Racoonn&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), operating the platform at <a href="https://racoonn.com" className="text-rose-600 underline">https://racoonn.com</a> and its allied mobile dashboards and reservation systems.
            </p>
            <p className="mb-3">
              We respect your right to privacy and are committed to safeguarding personal data in accordance with the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong>, the <strong>Information Technology Act, 2000</strong>, and the <strong>Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011</strong>.
            </p>
            <p>
              By accessing our platform, registering an account, or making a travel booking through Racoonn, you consent to the collection, use, and disclosure of your personal data as outlined in this Privacy Policy.
            </p>
          </section>

          {/* 2 */}
          <section id="data-we-collect" className="scroll-mt-24 border-b border-slate-100 pb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">2. Information We Collect</h2>
            <p className="mb-3">We collect several categories of information to provide seamless travel booking services:</p>
            <div className="space-y-3">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <strong className="text-slate-900 block mb-1">A. Personal Identification &amp; Contact Details</strong>
                <p className="text-slate-600 text-sm">Full name, email address, mobile phone number, postal address, date of birth, gender, and government-issued photo identification details (such as Aadhaar, Voter ID, Driving Licence, or Passport details when mandated by hotel check-in regulations).</p>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <strong className="text-slate-900 block mb-1">B. Reservation &amp; Travel Preferences</strong>
                <p className="text-slate-600 text-sm">Check-in and check-out dates, destination choices, room category selections, number of guests and children, dietary preferences, special assistance requests, co-traveller names, and holiday package itineraries.</p>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <strong className="text-slate-900 block mb-1">C. Transactional &amp; Invoicing Data</strong>
                <p className="text-slate-600 text-sm">Booking reference numbers, order history, billing addresses, GSTIN numbers (for corporate business invoicing), and payment transaction IDs returned by our payment gateways.</p>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <strong className="text-slate-900 block mb-1">D. Technical &amp; Usage Information</strong>
                <p className="text-slate-600 text-sm">IP addresses, browser type, device identifiers, operating system version, search queries, page interaction timings, referring URLs, and telemetry collected through Google Analytics (Google Tag ID: G-68XYEXQF98).</p>
              </div>
            </div>
          </section>

          {/* 3 */}
          <section id="how-we-use" className="scroll-mt-24 border-b border-slate-100 pb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">3. How We Use Your Personal Data</h2>
            <p className="mb-3">We utilize your personal data strictly for transparent and legitimate purposes, including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Fulfilling Reservations:</strong> Confirming hotel room allocations, holiday packages, tour guide reservations, and generating official booking vouchers.</li>
              <li><strong>Customer Support &amp; Communication:</strong> Sending booking confirmations via email and SMS, itinerary updates, payment receipts, check-in reminders, and handling cancellation requests.</li>
              <li><strong>Tax &amp; Statutory Compliance:</strong> Generating valid GST tax invoices (under SAC 996311 / SAC 998559) and maintaining accounting ledgers required under Indian taxation laws.</li>
              <li><strong>Fraud Prevention &amp; Safety:</strong> Verifying payment authorizations, detecting suspicious account logins, combating bot attacks, and preventing fraudulent reservations.</li>
              <li><strong>Platform Optimization:</strong> Analyzing search trends and user experience data to improve our search filters, hotel recommendations, and page load speeds.</li>
            </ul>
          </section>

          {/* 4 */}
          <section id="legal-basis" className="scroll-mt-24 border-b border-slate-100 pb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">4. Lawful Grounds for Processing (DPDP Act, 2023)</h2>
            <p className="mb-3">Under Indian data protection jurisprudence, we process your personal data under the following legitimate grounds:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Consent:</strong> When you provide clear, affirmative consent upon signing up or placing a booking.</li>
              <li><strong>Performance of Contract:</strong> To execute the travel booking contract formed between you and the property or tour operator.</li>
              <li><strong>Legal Obligation:</strong> To satisfy statutory accounting, GST audit records, or law enforcement disclosure directives.</li>
              <li><strong>Legitimate Uses:</strong> For safeguarding network security, resolving disputes, and enforcing our <Link href="/terms" className="text-rose-600 underline">Terms of Use</Link>.</li>
            </ul>
          </section>

          {/* 5 */}
          <section id="sharing-disclosure" className="scroll-mt-24 border-b border-slate-100 pb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">5. Data Sharing with Hotels &amp; Service Partners</h2>
            <p className="mb-3">
              Racoonn operates as an aggregator. To execute your travel bookings, we share strictly necessary portions of your personal data with verified third parties:
            </p>
            <div className="space-y-3">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <strong className="text-slate-900 block mb-1">Hotel &amp; Homestay Partners:</strong>
                <p className="text-slate-600 text-sm">We provide the booked property with your primary guest name, phone number, check-in dates, and room selection to ensure seamless check-in and room readiness.</p>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <strong className="text-slate-900 block mb-1">Tour &amp; Transport Operators:</strong>
                <p className="text-slate-600 text-sm">For holiday packages, essential traveler details are shared with our verified tour operators and transfer drivers for pickup arrangements.</p>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <strong className="text-slate-900 block mb-1">Infrastructure &amp; Communication Vendors:</strong>
                <p className="text-slate-600 text-sm">Cloud database providers (Appwrite / AWS), transactional email relays (Nodemailer / SMTP), and SMS notification partners operating under strict confidentiality covenants.</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-600">
              * <em>We do not sell, rent, or trade your personal data to third-party telemarketers or unauthorized advertising networks under any circumstances.</em>
            </p>
          </section>

          {/* 6 */}
          <section id="payment-security" className="scroll-mt-24 border-b border-slate-100 pb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">6. Payment Processing &amp; Financial Data</h2>
            <p className="mb-3">
              Your financial security is paramount. Racoonn integrates with <strong>RBI-authorized, PCI-DSS Level 1 certified payment gateways</strong> (including PhonePe, Cashfree, UPI, and major Indian banking networks).
            </p>
            <p className="mb-3">
              <strong>We never store raw credit card numbers, CVV codes, or net banking passwords on Racoonn servers.</strong> All payment instrument data is encrypted and transmitted directly through tokenized banking gateways. Racoonn only receives a secure transaction token, transaction status (Success/Failure), and payment reference ID.
            </p>
          </section>

          {/* 7 */}
          <section id="cookies-analytics" className="scroll-mt-24 border-b border-slate-100 pb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">7. Cookies, Web Beacons &amp; Tracking</h2>
            <p className="mb-3">
              We use cookies and similar browser tracking technologies to preserve session state, remember your search parameters, and analyze traffic patterns:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Essential Session Cookies:</strong> Required to keep you authenticated, maintain your booking checkout state, and secure web requests.</li>
              <li><strong>Analytics Cookies:</strong> We utilize Google Analytics (gtag.js with measurement ID <code>G-68XYEXQF98</code>) to evaluate aggregated visitor metrics, page view durations, and search funnel drop-offs.</li>
              <li><strong>Preference Cookies:</strong> Used to remember your preferred currency (INR), destination filters, and search dates.</li>
            </ul>
            <p className="mt-3">
              You can instruct your web browser to reject cookies or notify you when a cookie is being sent. However, disabling essential cookies may impact checkout functionality.
            </p>
          </section>

          {/* 8 */}
          <section id="data-retention" className="scroll-mt-24 border-b border-slate-100 pb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">8. Data Retention &amp; Storage</h2>
            <p className="mb-3">
              We retain personal information only for as long as necessary to fulfill the purposes for which it was collected, resolve disputes, and comply with mandatory legal, tax, and auditing requirements in India.
            </p>
            <p>
              Booking transaction records and statutory GST tax invoices are retained for a minimum statutory period of eight (8) years in accordance with Section 36 of the Central Goods and Services Tax Act, 2017. Following the expiration of required retention periods, personal data is permanently deleted or anonymized.
            </p>
          </section>

          {/* 9 */}
          <section id="security-measures" className="scroll-mt-24 border-b border-slate-100 pb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">9. Information Security Measures</h2>
            <p className="mb-3">
              We implement comprehensive technical, administrative, and physical security measures designed to shield your personal data from accidental loss, unauthorized access, and malicious modification:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>End-to-end transport layer security (TLS 1.3 / SSL encryption) on all communications;</li>
              <li>Restricted role-based access control (RBAC) limiting customer data access strictly to authorized support personnel;</li>
              <li>Automated database backups and encrypted cloud storage infrastructure;</li>
              <li>Periodic vulnerability scanning and API endpoint protection against SQL injection and cross-site scripting (XSS).</li>
            </ul>
          </section>

          {/* 10 */}
          <section id="user-rights" className="scroll-mt-24 border-b border-slate-100 pb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">10. Your Privacy Rights &amp; Choices</h2>
            <p className="mb-3">Under the DPDP Act and applicable Indian consumer laws, you possess the following rights regarding your personal data:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Right to Access:</strong> You can request a summary of the personal data we hold about you and your booking history.</li>
              <li><strong>Right to Correction &amp; Erasure:</strong> You can update inaccurate profile information or request the deletion of your account (subject to statutory invoicing retention limits).</li>
              <li><strong>Right to Withdraw Consent:</strong> You may opt out of non-essential promotional communications at any time via unsubscribe links or by emailing us.</li>
              <li><strong>Right of Grievance Redressal:</strong> You have the right to register a grievance with our designated Grievance Officer regarding any data handling concern.</li>
            </ul>
          </section>

          {/* 11 */}
          <section id="children-privacy" className="scroll-mt-24 border-b border-slate-100 pb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">11. Children&apos;s Privacy</h2>
            <p>
              Racoonn does not knowingly collect personal data from individuals under 18 years of age without parental or guardian supervision. Minors may only travel as co-guests on reservations made by an adult legal guardian. If we discover that personal data of a minor has been collected without verifiable parental consent, we will promptly delete such information.
            </p>
          </section>

          {/* 12 */}
          <section id="policy-updates" className="scroll-mt-24 border-b border-slate-100 pb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">12. Updates to this Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time to accommodate evolving legal mandates, technological advancements, or changes in our operational procedures. When updates are published, the revised &quot;Effective Date&quot; at the top of this document will be amended accordingly. We encourage you to review this page periodically.
            </p>
          </section>

          {/* 13 */}
          <section id="grievance-contact" className="scroll-mt-24">
            <h2 className="text-xl font-bold text-slate-900 mb-4">13. Grievance Officer &amp; Contact Details</h2>
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl space-y-4 text-sm">
              <div>
                <p className="font-bold text-slate-900">Data Controller / Operating Entity</p>
                <p className="text-slate-600 mt-1">
                  <strong>CIELLE TRAVELS PRIVATE LIMITED</strong> (operating Racoonn)
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
                  <strong>General Inquiries:</strong> <a href="mailto:info@racoonn.com" className="text-rose-600 underline">info@racoonn.com</a> | +91 8954442144
                </p>
              </div>

              <div className="border-t border-slate-200 pt-3">
                <p className="font-bold text-slate-900">Nodal Grievance &amp; Data Protection Officer</p>
                <p className="text-slate-600 mt-1">
                  Under the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021 and the DPDP Act, 2023:
                </p>
                <p className="text-slate-600 mt-1">
                  <strong>Designation:</strong> Grievance Redressal Officer
                </p>
                <p className="text-slate-600">
                  <strong>Email:</strong> <a href="mailto:info@racoonn.com" className="text-rose-600 underline">info@racoonn.com</a>
                </p>
                <p className="text-slate-500 text-xs mt-1">
                  * Grievances are acknowledged within 48 hours and resolved within thirty (30) days as prescribed by law.
                </p>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
