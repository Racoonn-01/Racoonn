import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Platform Listing Policy & Partner Agreement | Racoonn',
  description: 'Operating requirements, listing terms, commission, standards, and inventory policies for accommodation partners on Racoonn.',
};

const sections = [
  { id: "definitions", num: "1", title: "Definitions" },
  { id: "scope", num: "2", title: "Scope and Applicability" },
  { id: "eligibility", num: "3", title: "Eligibility and Onboarding Requirements" },
  { id: "approval", num: "4", title: "Listing Approval and Platform Access" },
  { id: "accuracy", num: "5", title: "Accuracy of Listing Information" },
  { id: "inventory", num: "6", title: "Inventory, Rates and Availability" },
  { id: "fulfilment", num: "7", title: "Booking Acceptance and Fulfilment" },
  { id: "commercials", num: "8", title: "Commission, Listing Fee and Settlements" },
  { id: "taxes", num: "9", title: "Taxes and Regulatory Compliance" },
  { id: "standards", num: "10", title: "Guest Experience, Safety and Service Standards" },
  { id: "complaints", num: "11", title: "Guest Complaints and Dispute Resolution" },
  { id: "content-ip", num: "12", title: "Content, Photographs and Intellectual Property" },
  { id: "promotions", num: "13", title: "Promotions and Marketing" },
  { id: "prohibited", num: "14", title: "Fraud, Misrepresentation and Prohibited Conduct" },
  { id: "privacy", num: "15", title: "Data Protection and Confidentiality" },
  { id: "force-majeure", num: "16", title: "Force Majeure" },
  { id: "suspension", num: "17", title: "Suspension and Delisting" },
  { id: "audit", num: "18", title: "Audit, Verification and Records" },
  { id: "notices", num: "19", title: "Notices and Grievance Redressal" },
  { id: "governing-law", num: "20", title: "Governing Law and Jurisdiction" },
  { id: "conflict", num: "21", title: "Conflict with Applicable Law" },
  { id: "amendments", num: "22", title: "Amendments and Severability" },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white text-slate-800">
      
      {/* Document-style Clean Header */}
      <div className="border-b border-slate-200 bg-slate-50/70 pt-16 pb-10">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-xs font-semibold text-rose-600 uppercase tracking-widest mb-2">Partner &amp; Supplier Legal Framework</p>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-3">
            Platform Listing Policy &amp; Partner Agreement
          </h1>
          <p className="text-sm md:text-base text-slate-600 leading-relaxed mb-4">
            Operating terms, listing conditions, commission rules, and quality standards for properties hosted on Racoonn.
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

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        
        {/* Table of Contents Index */}
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
          <section id="definitions" className="scroll-mt-20 border-b border-slate-100 pb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">1. Definitions</h2>
            <ul className="space-y-3">
              <li><strong>&quot;Property&quot;:</strong> Any hotel, resort, homestay, guest house, hostel, serviced apartment, villa, lodge, or other accommodation establishment listed or proposed to be listed on the Racoonn Platform.</li>
              <li><strong>&quot;Racoonn&quot;:</strong> <strong>CIELLE TRAVELS PRIVATE LIMITED</strong>, the operator of the Racoonn accommodation marketplace, together with its permitted successors and assigns.</li>
              <li><strong>&quot;Platform&quot;:</strong> The Racoonn website (racoonn.com), mobile application, partner extranet portal, administrative dashboards, APIs, or any other digital channel through which inventory is displayed, managed, promoted, or booked.</li>
              <li><strong>&quot;Listing Agreement&quot;:</strong> The agreement, onboarding terms, commercial terms, or electronic acceptance governing the relationship between Racoonn and a Property.</li>
              <li><strong>&quot;Partner&quot;:</strong> The owner, operator, management company, authorized representative, or other duly authorized person responsible for a Property listed on the Platform.</li>
              <li><strong>&quot;Guest&quot;:</strong> An end customer who searches for, reserves, books, or stays at a Property through the Platform.</li>
              <li><strong>&quot;Booking&quot;:</strong> A reservation for accommodation or any related service made through the Platform.</li>
            </ul>
          </section>

          {/* 2 */}
          <section id="scope" className="scroll-mt-20 border-b border-slate-100 pb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">2. Scope and Applicability</h2>
            <p className="mb-3">
              This Policy sets out the principal terms and operating requirements under which a Property may be listed, marketed, and made available for booking through Racoonn.
            </p>
            <p className="mb-3">
              This Policy forms part of the Listing Agreement and any applicable commercial terms agreed between Racoonn and the Partner. By submitting a Property for onboarding or continuing to use the Platform, the Partner agrees to comply with this Policy.
            </p>
            <p className="mb-3">
              Racoonn may revise this Policy from time to time to reflect operational requirements, changes in law, Platform functionality, customer-safety standards, or commercial practices. Updated terms shall become effective from the date communicated or made available to the Partner, unless a different effective date is specified.
            </p>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600">
              <strong>Order of Precedence:</strong> Where there is a conflict between this Policy, the Listing Agreement, and a separately negotiated commercial agreement, the order of precedence shall be: (1) applicable law or binding governmental order; (2) separately executed commercial agreement, to the extent expressly applicable; (3) Listing Agreement; and (4) this Policy.
            </div>
          </section>

          {/* 3 */}
          <section id="eligibility" className="scroll-mt-20 border-b border-slate-100 pb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">3. Eligibility and Onboarding Requirements</h2>
            <p className="mb-3">
              A Property must satisfy Racoonn’s onboarding and verification requirements before it can be made live on the Platform. Racoonn may request information or documents reasonably necessary to verify the identity, authority, legality, quality, and operational status of the Property.
            </p>
            <p className="mb-2">The Partner may be required to submit, as applicable:</p>
            <ul className="list-disc pl-6 space-y-1.5 mb-3">
              <li>Property or business registration documents, where applicable;</li>
              <li>PAN and applicable tax registration details, including GSTIN information;</li>
              <li>Bank account details and cancelled cheque / bank statement proving ownership;</li>
              <li>Government-issued identity and address proof of the owner or authorized representative;</li>
              <li>Property physical address, geo-coordinates, and active contact details;</li>
              <li>Applicable hotel, tourism, municipal, fire safety, health, trade, or local statutory licences;</li>
              <li>High-resolution property photographs, room photos, amenity descriptions, and house policies;</li>
              <li>Proof of authorization where the Partner acts on behalf of the registered property owner.</li>
            </ul>
            <p>
              Racoonn may verify submitted documents through reasonable verification procedures and request refreshed filings when documents expire or require confirmation.
            </p>
          </section>

          {/* 4 */}
          <section id="approval" className="scroll-mt-20 border-b border-slate-100 pb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">4. Listing Approval and Platform Access</h2>
            <p className="mb-3">
              Submission of a Property does not guarantee automatic publication. Racoonn reserves the right to approve, reject, suspend, or defer a listing based on onboarding criteria, guest safety records, hygiene standards, legal considerations, or legitimate business requirements.
            </p>
            <p>
              A Partner shall not represent a Property as being officially listed on Racoonn until Racoonn has issued formal written confirmation or published the live property listing.
            </p>
          </section>

          {/* 5 */}
          <section id="accuracy" className="scroll-mt-20 border-b border-slate-100 pb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">5. Accuracy of Listing Information</h2>
            <p className="mb-3">
              The Partner is responsible for ensuring that all information supplied to Racoonn is complete, accurate, current, and not misleading. This includes room categories, bed configurations, maximum occupancy limits, base tariffs, taxes, complimentary inclusions (e.g., breakfast), amenities, authentic photographs, cancellation rules, and check-in (standard 14:00) / check-out (standard 11:00) times.
            </p>
            <p>
              The Partner must promptly update Racoonn regarding any material changes (such as ongoing property renovations, pool closures, or changes in access roads). Racoonn reserves the right to correct or temporarily unpublish inaccurate listing content to protect guests.
            </p>
          </section>

          {/* 6 */}
          <section id="inventory" className="scroll-mt-20 border-b border-slate-100 pb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">6. Inventory, Rates and Availability</h2>
            <p className="mb-3">
              The Partner shall maintain accurate room inventory and real-time availability via the Racoonn Partner Extranet. The Partner must strictly honor all confirmed bookings.
            </p>
            <p>
              Rates submitted to Racoonn must clearly identify or include all mandatory taxes, service charges, extra bed tariffs, and restrictions. Where rate parity has been commercially agreed, the Partner shall not undercut Racoonn’s platform tariffs on walk-in or offline bookings.
            </p>
          </section>

          {/* 7 */}
          <section id="fulfilment" className="scroll-mt-20 border-b border-slate-100 pb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">7. Booking Acceptance and Fulfilment</h2>
            <p className="mb-3">
              Once a Booking is confirmed through Racoonn, the Partner is legally obligated to provide the reserved accommodation and agreed inclusions to the Guest.
            </p>
            <p className="mb-3">
              <strong>Zero Walk-in Rejection:</strong> The Partner shall not cancel, deny check-in, relocate, or downgrade a confirmed guest under any circumstances.
            </p>
            <p className="p-4 bg-rose-50/70 border border-rose-200 rounded-lg text-sm text-slate-700">
              <strong>Overbooking &amp; Relocation Duty:</strong> If the Partner fails to honor a confirmed Booking due to overbooking or internal error, the Partner shall immediately notify Racoonn support and arrange alternative accommodation of equal or higher standard at the Partner&apos;s sole expense, including any difference in room tariff and local transfer costs.
            </p>
          </section>

          {/* 8 */}
          <section id="commercials" className="scroll-mt-20 border-b border-slate-100 pb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">8. Commission, Listing Fee and Settlements</h2>
            <p className="mb-3">
              Racoonn charges a platform facilitation commission based on two tiered commercial slabs of <strong>18% and 24%</strong> (as designated in the Partner&apos;s commercial terms and onboarding tier) plus applicable statutory GST (18% on platform commission under SAC 996311) on gross bookings generated through the platform.
            </p>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm space-y-2 mb-3">
              <p><strong>Commission Slabs:</strong> The applicable slab (18% standard tier or 24% premium/promoted placement tier) is determined based on the partner category and agreed commercial structure.</p>
              <p><strong>Payout Settlement Cycle:</strong> Payouts to the Partner’s verified Indian bank account or UPI are initiated within <strong>72 hours following guest check-out</strong>, allowing for standard guest verification and dispute clearance.</p>
              <p><strong>Statutory Deductions:</strong> Settlements are subject to Section 194-O (1% TDS on e-commerce operators under the Indian Income Tax Act) and Section 52 (1% TCS under the CGST/SGST Acts), where applicable.</p>
            </div>
            <p>
              The Partner remains fully responsible for commission on bookings completed prior to any termination or listing pause.
            </p>
          </section>

          {/* 9 */}
          <section id="taxes" className="scroll-mt-20 border-b border-slate-100 pb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">9. Taxes and Regulatory Compliance</h2>
            <p className="mb-3">
              The Partner is solely responsible for obtaining and maintaining all municipal, police, tourism, fire, and health licences required to operate the Property legally.
            </p>
            <p>
              The Partner remains responsible for filing its statutory GST returns and collecting applicable room tariffs in compliance with Indian taxation laws.
            </p>
          </section>

          {/* 10 */}
          <section id="standards" className="scroll-mt-20 border-b border-slate-100 pb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">10. Guest Experience, Safety and Service Standards</h2>
            <p className="mb-2">The Partner covenants to uphold the following baseline hospitality standards:</p>
            <ul className="list-disc pl-6 space-y-1.5 mb-3">
              <li>Maintain high standards of room cleanliness, sanitization, fresh linen, and functional plumbing/electrical fixtures;</li>
              <li>Ensure 24/7 emergency contact availability and functioning fire extinguishers / emergency exits;</li>
              <li>Treat all guests with dignity and without unlawful discrimination based on race, religion, region, or marital status (subject to lawful property rules);</li>
              <li>Promptly address in-stay guest complaints and cooperate with Racoonn customer escalation officers.</li>
            </ul>
          </section>

          {/* 11 */}
          <section id="complaints" className="scroll-mt-20 border-b border-slate-100 pb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">11. Guest Complaints and Dispute Resolution</h2>
            <p className="mb-3">
              The Partner agrees to cooperate in good faith with Racoonn in investigating guest complaints. Where substandard conditions, missing amenities, or double-charging are substantiated, the Partner shall facilitate appropriate adjustments or refunds.
            </p>
          </section>

          {/* 12 */}
          <section id="content-ip" className="scroll-mt-20 border-b border-slate-100 pb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">12. Content, Photographs and Intellectual Property</h2>
            <p className="mb-3">
              The Partner grants Racoonn a non-exclusive, royalty-free, worldwide licence during the listing term to display, format, and market property photos, names, amenities, and branding across Racoonn&apos;s digital platforms.
            </p>
            <p>
              The Partner guarantees that all submitted media and text are authentic, owned by the Partner or properly licensed, and do not infringe on any third-party copyright. Racoonn retains all proprietary rights in its code, brand assets, and platform design.
            </p>
          </section>

          {/* 13 */}
          <section id="promotions" className="scroll-mt-20 border-b border-slate-100 pb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">13. Promotions and Marketing</h2>
            <p>
              Racoonn may introduce seasonal promotional discounts, visibility boosts, or campaign packages. Participation shall be governed by specific commercial notices communicated to the Partner.
            </p>
          </section>

          {/* 14 */}
          <section id="prohibited" className="scroll-mt-20 border-b border-slate-100 pb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">14. Fraud, Misrepresentation and Prohibited Conduct</h2>
            <p className="mb-2">The Partner shall not engage in:</p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>Submitting false property addresses or fraudulent photographs;</li>
              <li>Creating artificial reservations or manipulating guest ratings and reviews;</li>
              <li>Harvesting guest contact data for unauthorized offline solicitations;</li>
              <li>Attempting to bypass platform commission or encourage offline cash conversions for platform leads.</li>
            </ul>
          </section>

          {/* 15 */}
          <section id="privacy" className="scroll-mt-20 border-b border-slate-100 pb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">15. Data Protection and Confidentiality</h2>
            <p>
              Guest personal data shared with the Partner must be handled strictly in compliance with the Digital Personal Data Protection Act, 2023 (DPDP Act). The Partner shall not disclose guest details to unauthorized third parties or use guest contacts for marketing without express consent.
            </p>
          </section>

          {/* 16 */}
          <section id="force-majeure" className="scroll-mt-20 border-b border-slate-100 pb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">16. Force Majeure</h2>
            <p>
              Neither party shall be held liable for failure to perform duties due to natural catastrophes, floods, landslides, earthquakes, curfews, pandemics, or government-mandated travel shutdowns. Both parties agree to cooperate on reasonable guest rescheduling or refund waivers during force majeure events.
            </p>
          </section>

          {/* 17 */}
          <section id="suspension" className="scroll-mt-20 border-b border-slate-100 pb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">17. Suspension and Delisting</h2>
            <p className="mb-3">
              Racoonn may suspend or delist a Property immediately upon:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 mb-3">
              <li>Material breach of this Listing Policy or commercial agreement;</li>
              <li>Persistent safety, hygiene, or unresolved guest complaints;</li>
              <li>Commission payment default or fraudulent booking activity;</li>
              <li>Lapse or revocation of mandatory operating licences.</li>
            </ul>
            <p className="text-sm text-slate-500">
              Partners may request voluntary delisting with thirty (30) days’ written notice, provided all existing confirmed bookings are honored.
            </p>
          </section>

          {/* 18 */}
          <section id="audit" className="scroll-mt-20 border-b border-slate-100 pb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">18. Audit, Verification and Records</h2>
            <p>
              Racoonn reserves the right to conduct routine document audits, property inspections, or guest verification checks to ensure platform standards and taxation compliance.
            </p>
          </section>

          {/* 19 */}
          <section id="notices" className="scroll-mt-20 border-b border-slate-100 pb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">19. Notices and Grievance Redressal</h2>
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl space-y-4 text-sm">
              <div>
                <p className="font-bold text-slate-900">Partner Support &amp; Extranet Operations</p>
                <p className="text-slate-600 mt-1">
                  <strong>Partner Helpdesk:</strong> <a href="mailto:info@racoonn.com" className="text-rose-600 underline">info@racoonn.com</a> | +91 8954442144
                </p>
                <p className="text-slate-600">
                  <strong>Operating Entity:</strong> CIELLE TRAVELS PRIVATE LIMITED
                </p>
                <p className="text-slate-600">
                  <strong>Corporate Office:</strong> Corp. Off.-205 PSA Plaza 2nd Floor 19 Kalyani View, Nainital Road Rudrapur 263153 U.S. Nagar (UK)
                </p>
              </div>

              <div className="border-t border-slate-200 pt-3">
                <p className="font-bold text-slate-900">Partner Grievance Redressal Officer</p>
                <p className="text-slate-600 mt-1">
                  <strong>Email:</strong> <a href="mailto:info@racoonn.com" className="text-rose-600 underline">info@racoonn.com</a>
                </p>
                <p className="text-slate-500 text-xs mt-1">
                  * Partner grievances are acknowledged within 48 hours and resolved within 30 days.
                </p>
              </div>
            </div>
          </section>

          {/* 20 */}
          <section id="governing-law" className="scroll-mt-20 border-b border-slate-100 pb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">20. Governing Law and Jurisdiction</h2>
            <p>
              This Policy and all partner commercial relationships shall be governed by the laws of India. Any disputes arising hereunder shall be subject to the exclusive jurisdiction of the competent courts in <strong>Udham Singh Nagar / Nainital, Uttarakhand, India</strong>.
            </p>
          </section>

          {/* 21 */}
          <section id="conflict" className="scroll-mt-20 border-b border-slate-100 pb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">21. Conflict with Applicable Law</h2>
            <p>
              If any provision conflicts with mandatory statutory laws or government directives, the statutory requirement shall prevail to the extent of such conflict, while remaining provisions continue in full force.
            </p>
          </section>

          {/* 22 */}
          <section id="amendments" className="scroll-mt-20">
            <h2 className="text-xl font-bold text-slate-900 mb-4">22. Amendments and Severability</h2>
            <p>
              Racoonn may update this Policy periodically. If any clause is deemed invalid or unenforceable, it shall be modified to the minimum extent necessary to ensure legality, and all other clauses shall remain intact.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
