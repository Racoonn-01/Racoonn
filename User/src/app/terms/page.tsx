import { Metadata } from 'next';
import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://racoonn.com';

export const metadata: Metadata = {
  title: 'Terms of Use & Service Agreement | Racoonn',
  description: 'Read the Terms of Use, platform rules, and booking agreement for Racoonn, operated by CIELLE TRAVELS PRIVATE LIMITED.',
  alternates: {
    canonical: `${siteUrl}/terms`,
  },
  openGraph: {
    title: 'Terms of Use | Racoonn',
    description: 'Terms of Use, platform guidelines, and booking agreement for Racoonn.',
    url: `${siteUrl}/terms`,
    siteName: 'Racoonn',
    locale: 'en_IN',
    type: 'website',
  },
};

const sections = [
  { id: "parties", num: "1", title: "Parties and Agreement" },
  { id: "definitions", num: "2", title: "Definitions" },
  { id: "scope", num: "3", title: "Scope of Services" },
  { id: "licence", num: "4", title: "Licence and Access" },
  { id: "restrictions", num: "5", title: "Usage Restrictions" },
  { id: "responsibilities", num: "6", title: "Client Responsibilities" },
  { id: "availability", num: "7", title: "Platform Availability" },
  { id: "bookings-payments", num: "8", title: "Bookings, Prices and Payments" },
  { id: "invoices-taxes", num: "9", title: "Invoices and Taxes" },
  { id: "cancellations-refunds", num: "10", title: "Cancellation, Modification and Refunds" },
  { id: "ip", num: "11", title: "Intellectual Property" },
  { id: "confidentiality", num: "12", title: "Confidentiality" },
  { id: "privacy", num: "13", title: "Data Privacy and Security" },
  { id: "disclaimers", num: "14", title: "Disclaimers" },
  { id: "indemnity", num: "15", title: "Indemnity" },
  { id: "liability", num: "16", title: "Limitation of Liability" },
  { id: "force-majeure", num: "17", title: "Force Majeure" },
  { id: "term-termination", num: "18", title: "Term and Termination" },
  { id: "feedback", num: "19", title: "Feedback" },
  { id: "changes", num: "20", title: "Changes to the Terms" },
  { id: "general", num: "21", title: "General Provisions" },
  { id: "dispute-resolution", num: "22", title: "Dispute Resolution and Governing Law" },
  { id: "contact-details", num: "23", title: "Contact Details & Grievance Redressal" },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white text-slate-800">
      
      {/* Simple, Clean Header */}
      <div className="border-b border-slate-200 bg-slate-50/70 pt-28 pb-10">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-xs font-semibold text-rose-600 uppercase tracking-widest mb-2">Legal &amp; Compliance</p>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-3">
            Terms of Use
          </h1>
          <p className="text-sm md:text-base text-slate-600 leading-relaxed mb-4">
            Racoonn Travel Platform &bull; Operative Master Service Agreement &amp; Platform Guidelines
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
            <span>Operated by: <strong>CIELLE TRAVELS PRIVATE LIMITED</strong></span>
            <span>&bull;</span>
            <span>Effective Date: October 12, 2026</span>
            <span>&bull;</span>
            <span>Version 2.4</span>
          </div>
        </div>
      </div>

      {/* Main Body with Clean Layout */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        
        {/* Quick Quick Navigation Index */}
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
          <section id="parties" className="scroll-mt-24 border-b border-slate-100 pb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">1. Parties and Agreement</h2>
            <p className="mb-4">
              These Terms of Use (&quot;Terms&quot;) constitute an electronic agreement between <strong>CIELLE TRAVELS PRIVATE LIMITED</strong>, operating the Racoonn platform (&quot;Racoonn&quot;, &quot;we&quot;, &quot;us&quot; or &quot;Facilitator&quot;), and the business, organization or authorized individual subscribing for or using Racoonn’s business travel and booking services (&quot;Client&quot;, &quot;you&quot; or &quot;your&quot;).
            </p>
            <p className="mb-4">
              By signing an Order Form, creating or using a Business or Guest Account, or accessing the Racoonn platform and services, you acknowledge that you have read, understood and accepted these Terms. These Terms, together with any applicable Order Form, Annexures, Booking Conditions and Privacy Policy, constitute the Agreement.
            </p>
            <p className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600">
              <strong>Order of Precedence:</strong> If there is an inconsistency, the following order shall apply: (1) Order Form; (2) applicable Annexures or special commercial terms; (3) these Terms.
            </p>
          </section>

          {/* 2 */}
          <section id="definitions" className="scroll-mt-24 border-b border-slate-100 pb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">2. Definitions</h2>
            <ul className="space-y-3">
              <li><strong>Applicable Laws:</strong> All laws, rules, regulations, orders and directions having force of law in India and applicable to the parties or Services.</li>
              <li><strong>Affiliate:</strong> An entity that directly or indirectly controls, is controlled by, or is under common control with a party.</li>
              <li><strong>Authorised User:</strong> An employee, agent, representative or other person authorised by the Client to use Racoonn.</li>
              <li><strong>Business Account:</strong> The Client’s administrative account through which Authorised Users may access the Services.</li>
              <li><strong>Confidential Information:</strong> Non-public business, commercial, technical, financial, customer, supplier, pricing, product, software, operational and other information disclosed in connection with the Agreement.</li>
              <li><strong>Force Majeure Event:</strong> An event beyond the reasonable control of the affected party, including natural disasters, government action, war, terrorism, civil unrest, strikes, network failures, fire, flood, epidemic/pandemic or similar events.</li>
              <li><strong>Intellectual Property Rights:</strong> Copyright, trademarks, patents, designs, database rights, domain names, software rights, trade secrets, know-how and other intellectual or industrial property rights.</li>
              <li><strong>Listing Price:</strong> The price supplied by the relevant Service Provider and displayed through Racoonn.</li>
              <li><strong>Order Form:</strong> A commercial or contractual document accepted by the Client and Racoonn describing applicable Services, fees, term or other agreed conditions.</li>
              <li><strong>Platform:</strong> Racoonn’s websites (racoonn.com), mobile applications, dashboards, booking systems, APIs, processes and other authorized digital channels.</li>
              <li><strong>Primary Service Provider:</strong> The third-party hotel, airline, bus operator, cab provider, activity provider, tour operator or other supplier ultimately responsible for delivering the Travel Service.</li>
              <li><strong>Service Fee:</strong> The fee payable to Racoonn for its facilitation or platform services, as specified in the applicable Order Form or Booking.</li>
              <li><strong>Services:</strong> Racoonn’s technology and facilitation services enabling the Client and its Authorised Users to search, enquire, reserve, book, manage and obtain information relating to Travel Services.</li>
              <li><strong>Travel Services:</strong> The underlying travel services, including hotels, flights, buses, cabs, trains, activities, tours, transfers, packages or other travel products supplied by Primary Service Providers.</li>
            </ul>
          </section>

          {/* 3 */}
          <section id="scope" className="scroll-mt-24 border-b border-slate-100 pb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">3. Scope of Services</h2>
            <p className="mb-3">
              Racoonn provides a technology-enabled travel booking and facilitation platform. Unless expressly stated in an Order Form, Racoonn acts as an intermediary/aggregator and is not the actual supplier of the underlying Travel Services.
            </p>
            <p className="mb-3">
              Each Travel Service may be governed by the separate terms, fare rules, cancellation rules, check-in rules and other conditions of the applicable Primary Service Provider. The Client agrees to comply with those conditions.
            </p>
            <p>
              Racoonn may facilitate bookings, availability search, reservation requests, payment collection or processing, booking confirmations, cancellation requests, reporting and customer support, depending on the Service purchased.
            </p>
          </section>

          {/* 4 */}
          <section id="licence" className="scroll-mt-24 border-b border-slate-100 pb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">4. Licence and Access</h2>
            <p className="mb-3">
              Subject to these Terms, Racoonn grants the Client a limited, non-exclusive, non-transferable and revocable right to access and use the Services for its internal travel requirements.
            </p>
            <p className="mb-3">
              The Client is responsible for all actions and omissions of its Authorised Users and shall ensure that all Authorised Users comply with these Terms.
            </p>
            <p>
              Client credentials may not be shared or transferred. The Client must promptly notify Racoonn of suspected unauthorized access.
            </p>
          </section>

          {/* 5 */}
          <section id="restrictions" className="scroll-mt-24 border-b border-slate-100 pb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">5. Usage Restrictions</h2>
            <p className="mb-3">The Client shall not, and shall not permit any Authorised User to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>copy, reproduce or create a database from the Platform or its content except as expressly permitted;</li>
              <li>remove or alter Racoonn’s copyright, trademark, security or proprietary notices;</li>
              <li>modify, adapt, translate, reverse engineer, decompile or disassemble the Platform;</li>
              <li>resell, sublicense, lease, distribute or commercially exploit the Services except as expressly authorized;</li>
              <li>use automated tools, bots, scrapers or other mechanisms to extract Platform data without written permission;</li>
              <li>attempt to bypass authentication, security, licensing or access controls;</li>
              <li>introduce malware, viruses or other harmful code;</li>
              <li>use the Services for unlawful, fraudulent or unauthorized activities; or</li>
              <li>use the Services to develop or operate a competing product using Racoonn’s proprietary content or systems.</li>
            </ul>
          </section>

          {/* 6 */}
          <section id="responsibilities" className="scroll-mt-24 border-b border-slate-100 pb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">6. Client Responsibilities</h2>
            <p className="mb-3">
              The Client shall provide accurate information and reasonable cooperation necessary for Racoonn to provide the Services. The Client is responsible for its devices, internet/network connectivity, account security, traveller information, booking instructions and compliance with applicable laws.
            </p>
            <p>
              The Client shall ensure that its corporate travel policies and internal approvals are properly communicated to Authorised Users. Racoonn may provide booking controls where agreed, but the Client remains responsible for its internal policy administration.
            </p>
          </section>

          {/* 7 */}
          <section id="availability" className="scroll-mt-24 border-b border-slate-100 pb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">7. Platform Availability</h2>
            <p className="mb-3">
              Racoonn will use commercially reasonable efforts to make the Platform available. Availability may be interrupted for maintenance, upgrades, security events, technical failures, third-party failures or circumstances beyond Racoonn’s reasonable control.
            </p>
            <p>
              Racoonn does not guarantee uninterrupted or error-free operation. Where reasonably practicable, Racoonn will work to restore affected Services.
            </p>
          </section>

          {/* 8 */}
          <section id="bookings-payments" className="scroll-mt-24 border-b border-slate-100 pb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">8. Bookings, Prices and Payments</h2>
            <p className="mb-3">
              The Client may be shown a Listing Price, applicable taxes, Service Fees, payment charges and other amounts before completing a Booking. Prices and availability may change until confirmation.
            </p>
            <p className="mb-3">
              A Booking becomes confirmed only when Racoonn or the relevant Service Provider issues a confirmation/reference number or other confirmation through an authorized channel.
            </p>
            <p className="mb-3">
              The Client authorizes Racoonn, where applicable, to facilitate reservations and payment arrangements with Primary Service Providers.
            </p>
            <p>
              Service Fees and other commercial charges shall be as stated in the applicable Order Form or Booking. If amounts due remain unpaid after the applicable due date, Racoonn may suspend access after notice, subject to applicable law and contractual rights.
            </p>
          </section>

          {/* 9 */}
          <section id="invoices-taxes" className="scroll-mt-24 border-b border-slate-100 pb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">9. Invoices and Taxes</h2>
            <p className="mb-3">
              Racoonn (through <strong>CIELLE TRAVELS PRIVATE LIMITED</strong>, GSTIN: 05AAOCC0859Q1Z0) will issue invoices for amounts for which it is legally responsible to invoice. A Primary Service Provider may separately issue an invoice for the underlying Travel Service where applicable.
            </p>
            <p>
              Each party shall comply with applicable GST, withholding tax and other tax obligations applicable to it. Neither party assumes the other party’s tax liabilities arising from that other party’s non-compliance.
            </p>
          </section>

          {/* 10 */}
          <section id="cancellations-refunds" className="scroll-mt-24 border-b border-slate-100 pb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">10. Cancellation, Modification and Refunds</h2>
            <p className="mb-3">
              Bookings are subject to the cancellation, modification, refund and no-show policies applicable to the relevant Travel Service. Racoonn may facilitate eligible cancellation or refund requests but the underlying refund may depend on the Primary Service Provider, payment gateway, bank and applicable Booking terms.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4 p-4 rounded-lg bg-slate-50 border border-slate-200 text-sm">
              <div>
                <strong className="block text-slate-900 mb-1">Standard Hotel Bookings:</strong>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  <li>Free cancellation up to 48 hours prior to check-in.</li>
                  <li>Cancellations within 48 hours incur a 1-night retention fee.</li>
                  <li>No-shows are 100% non-refundable.</li>
                </ul>
              </div>
              <div>
                <strong className="block text-slate-900 mb-1">Holiday Packages:</strong>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  <li>Free cancellation up to 7 days before departure.</li>
                  <li>50% retention charge between 3 to 7 days.</li>
                  <li>Non-refundable within 72 hours of departure.</li>
                </ul>
              </div>
            </div>
            <p>
              Approved refunds are processed to the original payment method within 5 to 7 business days. Any non-refundable Service Fee or payment gateway charge shall be treated according to the applicable commercial and Booking terms.
            </p>
          </section>

          {/* 11 */}
          <section id="ip" className="scroll-mt-24 border-b border-slate-100 pb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">11. Intellectual Property</h2>
            <p className="mb-3">
              Racoonn and/or its licensors retain all right, title and interest in the Platform, software, interfaces, designs, databases, content, trademarks, technology and Services, including modifications and improvements.
            </p>
            <p>
              Except for the limited access right expressly granted under these Terms, no intellectual property rights are transferred to the Client.
            </p>
          </section>

          {/* 12 */}
          <section id="confidentiality" className="scroll-mt-24 border-b border-slate-100 pb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">12. Confidentiality</h2>
            <p className="mb-3">
              Each party receiving Confidential Information shall use it only for purposes of the Agreement, protect it using reasonable security measures, and not disclose it except to authorized employees, Affiliates, professional advisers, service providers or where required by law.
            </p>
            <p>
              Confidentiality obligations shall survive expiry or termination of the Agreement for so long as the information remains confidential, subject to applicable law.
            </p>
          </section>

          {/* 13 */}
          <section id="privacy" className="scroll-mt-24 border-b border-slate-100 pb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">13. Data Privacy and Security</h2>
            <p className="mb-3">
              The parties shall process personal data in accordance with applicable data-protection law and Racoonn’s <Link href="/privacy" className="text-rose-600 underline font-medium">Privacy Policy</Link>. Where the Client provides traveller or employee personal data to Racoonn, the Client represents that it has the authority and lawful basis necessary for such disclosure and processing.
            </p>
            <p className="mb-3">
              Racoonn may share necessary information with Primary Service Providers, payment processors, technology vendors, support providers and other authorized partners solely as reasonably necessary to provide the Services or comply with law.
            </p>
            <p>
              Racoonn will maintain reasonable technical and organizational security measures appropriate to the nature of the information processed.
            </p>
          </section>

          {/* 14 */}
          <section id="disclaimers" className="scroll-mt-24 border-b border-slate-100 pb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">14. Disclaimers</h2>
            <p className="mb-3">
              To the maximum extent permitted by law, the Platform and Services are provided on an &quot;as is&quot; and &quot;as available&quot; basis. Racoonn does not warrant that the Platform will always be uninterrupted, error-free or meet every Client requirement.
            </p>
            <p>
              Racoonn does not control or guarantee the quality, safety, legality, availability, accuracy or performance of third-party Travel Services. The Primary Service Provider remains responsible for delivery of its Travel Service, subject to applicable law.
            </p>
          </section>

          {/* 15 */}
          <section id="indemnity" className="scroll-mt-24 border-b border-slate-100 pb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">15. Indemnity</h2>
            <p className="mb-3">
              To the maximum extent permitted by law, each party shall indemnify the other against third-party claims, losses and reasonable costs arising from its material breach of the Agreement, violation of applicable law, infringement of third-party intellectual property rights, fraud, gross negligence or wilful misconduct, subject to applicable law and the agreed claim process.
            </p>
            <p>
              The indemnified party shall promptly notify the indemnifying party of a claim and provide reasonable cooperation, while allowing the indemnifying party reasonable control of the defence and settlement, provided no settlement admits liability or imposes obligations on the indemnified party without its consent.
            </p>
          </section>

          {/* 16 */}
          <section id="liability" className="scroll-mt-24 border-b border-slate-100 pb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">16. Limitation of Liability</h2>
            <p className="mb-3">
              To the maximum extent permitted by law, neither party shall be liable for indirect, special, incidental, consequential or exemplary losses, or loss of profits, revenue, business, contracts or anticipated savings arising from the Agreement.
            </p>
            <p className="mb-3">
              Subject to payment obligations and liabilities that cannot legally be limited, Racoonn’s aggregate liability arising from the Services shall not exceed the Service Fees actually paid or payable by the Client to Racoonn during the twelve (12) months preceding the event giving rise to the claim, unless a different cap is expressly stated in the applicable Order Form.
            </p>
            <p>
              Nothing in these Terms excludes liability for death or personal injury caused by negligence, fraud, wilful misconduct, or any liability that cannot legally be excluded or limited.
            </p>
          </section>

          {/* 17 */}
          <section id="force-majeure" className="scroll-mt-24 border-b border-slate-100 pb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">17. Force Majeure</h2>
            <p className="mb-3">
              Neither party shall be liable for failure or delay caused by a Force Majeure Event. The affected party shall, where reasonably practicable, notify the other party and take reasonable steps to resume performance.
            </p>
            <p>
              Bookings affected by force majeure events remain subject to the relevant Service Provider’s rules and applicable law.
            </p>
          </section>

          {/* 18 */}
          <section id="term-termination" className="scroll-mt-24 border-b border-slate-100 pb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">18. Term and Termination</h2>
            <p className="mb-3">
              The Agreement begins on the Effective Date and continues for the term stated in the Order Form. If no term is specified, either party may terminate by giving thirty (30) days’ written notice, subject to accrued obligations.
            </p>
            <p className="mb-3">
              Racoonn may suspend or terminate access immediately where reasonably necessary due to fraud, security risk, unlawful activity, material breach, non-payment, insolvency or misuse of the Platform, subject to applicable law.
            </p>
            <p>
              Termination does not affect accrued payment obligations or provisions intended to survive, including intellectual property, confidentiality, indemnity, limitation of liability, dispute resolution and applicable data obligations.
            </p>
          </section>

          {/* 19 */}
          <section id="feedback" className="scroll-mt-24 border-b border-slate-100 pb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">19. Feedback</h2>
            <p>
              The Client may provide suggestions, ideas, corrections or recommendations concerning the Services. Unless otherwise agreed in writing, Racoonn may use such feedback without restriction or payment, provided it does not disclose the Client’s Confidential Information.
            </p>
          </section>

          {/* 20 */}
          <section id="changes" className="scroll-mt-24 border-b border-slate-100 pb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">20. Changes to the Terms</h2>
            <p>
              Racoonn may update these Terms where reasonably necessary due to changes in law, Services, technology, security or business practices. Material changes will be communicated through the Platform, email or another reasonable channel. Continued use after the effective date of an update constitutes acceptance, subject to applicable law.
            </p>
          </section>

          {/* 21 */}
          <section id="general" className="scroll-mt-24 border-b border-slate-100 pb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">21. General Provisions</h2>
            <ul className="space-y-3">
              <li><strong>Entire Agreement:</strong> These Terms and applicable Order Forms constitute the entire agreement concerning the Services and supersede prior discussions relating to the same subject matter.</li>
              <li><strong>Independent Parties:</strong> The parties are independent contractors. Nothing creates a partnership, joint venture, employment, franchise or fiduciary relationship.</li>
              <li><strong>Severability:</strong> If a provision is held invalid or unenforceable, the remaining provisions remain effective.</li>
              <li><strong>Waiver:</strong> Failure or delay in exercising a right is not a waiver of that right.</li>
              <li><strong>Assignment:</strong> Neither party may assign the Agreement without the other party’s consent, except that Racoonn may assign it to an Affiliate or successor in connection with a merger, restructuring or transfer of the relevant business.</li>
              <li><strong>Notices:</strong> Notices may be delivered by official email or other written electronic communication to the addresses specified in the Order Form.</li>
            </ul>
          </section>

          {/* 22 */}
          <section id="dispute-resolution" className="scroll-mt-24 border-b border-slate-100 pb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">22. Dispute Resolution and Governing Law</h2>
            <p className="mb-3">
              The parties shall first attempt to resolve disputes through good-faith discussions within fifteen (15) working days of written notice of the dispute. If unresolved, the parties may pursue the remedies available under applicable law and/or any arbitration mechanism expressly stated in the applicable Order Form.
            </p>
            <p>
              This Agreement shall be governed by the laws of India. Subject to mandatory statutory jurisdiction, disputes shall be subject to the courts at <strong>Udham Singh Nagar / Nainital, Uttarakhand</strong>, India.
            </p>
          </section>

          {/* 23 */}
          <section id="contact-details" className="scroll-mt-24">
            <h2 className="text-xl font-bold text-slate-900 mb-4">23. Contact Details &amp; Grievance Redressal</h2>
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl space-y-4 text-sm">
              <div>
                <p className="font-bold text-slate-900">Racoonn / CIELLE TRAVELS PRIVATE LIMITED</p>
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
                  <strong>Website:</strong> <a href="https://racoonn.com" className="text-rose-600 underline">https://racoonn.com</a>
                </p>
                <p className="text-slate-600">
                  <strong>Support / Inquiries:</strong> <a href="mailto:info@racoonn.com" className="text-rose-600 underline">info@racoonn.com</a> | +91 8954442144
                </p>
              </div>

              <div className="border-t border-slate-200 pt-3">
                <p className="font-bold text-slate-900">Grievance Officer (IT Act &amp; Consumer Protection E-Commerce Rules)</p>
                <p className="text-slate-600 mt-1">
                  <strong>Designation:</strong> Nodal Grievance Redressal Officer
                </p>
                <p className="text-slate-600">
                  <strong>Grievance Email:</strong> <a href="mailto:info@racoonn.com" className="text-rose-600 underline">info@racoonn.com</a>
                </p>
                <p className="text-slate-500 text-xs mt-1">
                  * Grievances are acknowledged within 48 hours and resolved within 30 days of receipt as prescribed by statutory rules.
                </p>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
