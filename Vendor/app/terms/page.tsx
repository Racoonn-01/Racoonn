import React from 'react';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6 lg:px-8 bg-white min-h-screen text-slate-700">
      <h1 className="text-3xl font-black text-brand-navy mb-4 uppercase">RACOONN PARTNER AGREEMENT</h1>
      <h2 className="text-xl font-bold text-slate-800 mb-2">Hotel Listing, Booking & Commission Agreement</h2>
      <p className="font-semibold text-slate-500 mb-8">Effective Date: 21 September 2026</p>

      <div className="space-y-6 text-sm leading-relaxed">
        <p>
          This Hotel Partner Agreement (“Agreement”) is entered into between Racoonn (“Racoonn”, “Platform”, “we”, “us”, or “our”) and the hotel, resort, property, accommodation provider, or authorized representative (“Partner”, “Hotel”, “you”, or “your”) registering a property on the Racoonn Partner Platform.
        </p>
        <p>
          By completing the Partner onboarding process and submitting the property profile, the Partner confirms that it has read, understood, and agreed to the terms of this Agreement.
        </p>

        <section>
          <h3 className="font-bold text-lg text-slate-800 mt-6 mb-3">1. Purpose of the Agreement</h3>
          <p className="mb-2">Racoonn operates a hotel discovery, booking, and lead-generation platform that enables users to discover accommodation properties and make enquiries or bookings.</p>
          <p className="mb-2">Under this Agreement, the Partner authorizes Racoonn to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>List the Partner's property on the Racoonn platform</li>
            <li>Display property, room, amenity, and pricing information</li>
            <li>Promote the property through Racoonn's marketing channels</li>
            <li>Generate booking enquiries and leads</li>
            <li>Facilitate customer bookings where supported</li>
            <li>Communicate booking-related information between the customer and Partner</li>
            <li>Provide digital tools for managing the Partner's property and bookings</li>
          </ul>
        </section>

        <section>
          <h3 className="font-bold text-lg text-slate-800 mt-6 mb-3">2. Partner Information</h3>
          <p className="mb-2">The Partner agrees to provide accurate and complete information during onboarding. The Partner may be required to provide:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Legal/business name</li>
            <li>Property name</li>
            <li>Property address</li>
            <li>Contact details</li>
            <li>Authorized representative details</li>
            <li>PAN details</li>
            <li>GST details, where applicable</li>
            <li>Government identification or business documents</li>
            <li>Bank account/payment details</li>
            <li>Property photographs</li>
            <li>Room information</li>
            <li>Amenities</li>
            <li>Pricing</li>
            <li>Availability</li>
            <li>Check-in and check-out information</li>
            <li>Cancellation policies</li>
            <li>Other information reasonably required by Racoonn</li>
          </ul>
          <p className="mt-2">The Partner confirms that it has the authority to provide the submitted information and enter into this Agreement.</p>
        </section>

        <section>
          <h3 className="font-bold text-lg text-slate-800 mt-6 mb-3">3. Property Listing</h3>
          <p className="mb-2">After successful verification, Racoonn may publish the Partner's property on its platform. The listing may include:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Property name</li>
            <li>Property description</li>
            <li>Property photographs</li>
            <li>Room types</li>
            <li>Room photographs</li>
            <li>Room prices</li>
            <li>Available amenities</li>
            <li>Property facilities</li>
            <li>Location</li>
            <li>Policies</li>
            <li>Check-in/check-out timings</li>
            <li>Availability</li>
            <li>Offers</li>
            <li>Ratings and reviews</li>
            <li>Other information relevant to customers</li>
          </ul>
          <p className="mt-2">The Partner is responsible for ensuring that all information provided to Racoonn is accurate and up to date.</p>
        </section>

        <section>
          <h3 className="font-bold text-lg text-slate-800 mt-6 mb-3">4. Racoonn Commission / Platform Fee</h3>
          <p className="mb-2">The Partner agrees to pay Racoonn a percentage-based fee on eligible bookings generated through the Racoonn platform.</p>
          <p className="mb-2">Racoonn currently operates under the following two fee slabs:</p>
          <div className="bg-slate-50 p-4 rounded-lg my-4 max-w-md border border-slate-200">
            <div className="flex justify-between font-bold border-b pb-2 mb-2">
              <span>Property Category</span>
              <span>Racoonn Fee</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Standard / Non-Luxury Hotels</span>
              <span>18%</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Luxury Hotels</span>
              <span>24%</span>
            </div>
          </div>
          <p className="mb-2">The applicable fee slab will be determined based on the property's category and classification as recorded during Partner onboarding and/or verified by Racoonn.</p>
          <p className="mb-2 font-bold">Standard Hotel Fee</p>
          <p className="mb-2">For properties classified as Standard / Non-Luxury Hotels, Racoonn will charge: 18% of the applicable booking value.</p>
          <p className="mb-2 font-bold">Luxury Hotel Fee</p>
          <p className="mb-2">For properties classified as Luxury Hotels, Racoonn will charge: 24% of the applicable booking value.</p>
          <p>The applicable percentage will be displayed to the Partner during onboarding before the Partner submits the profile.</p>
        </section>

        <section>
          <h3 className="font-bold text-lg text-slate-800 mt-6 mb-3">5. Meaning of Booking Value</h3>
          <p className="mb-2">For the purpose of calculating the Racoonn fee, the “Booking Value” means the amount attributable to the eligible hotel accommodation booking processed or generated through Racoonn, subject to the applicable commercial arrangement between Racoonn and the Partner.</p>
          <p className="mb-2">Unless otherwise agreed in writing, the fee may be calculated on the accommodation amount applicable to the confirmed booking.</p>
          <p className="mb-2">Taxes, government charges, and other statutory amounts may be treated separately where applicable.</p>
          <p>Racoonn may provide the Partner with a booking statement or transaction statement showing the calculation.</p>
        </section>

        <section>
          <h3 className="font-bold text-lg text-slate-800 mt-6 mb-3">6. Example of Fee Calculation</h3>
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <p className="font-bold mb-2">Standard Hotel — 18%</p>
              <p>If the eligible booking value is: <strong>₹10,000</strong></p>
              <p>Racoonn Fee: 18% = <strong>₹1,800</strong></p>
              <p>Partner amount before applicable taxes/adjustments: <strong>₹8,200</strong></p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <p className="font-bold mb-2">Luxury Hotel — 24%</p>
              <p>If the eligible booking value is: <strong>₹10,000</strong></p>
              <p>Racoonn Fee: 24% = <strong>₹2,400</strong></p>
              <p>Partner amount before applicable taxes/adjustments: <strong>₹7,600</strong></p>
            </div>
          </div>
          <p className="mt-4 italic">These examples are illustrative. Actual settlement amounts may vary based on cancellations, refunds, taxes, discounts, adjustments, or other applicable commercial terms.</p>
        </section>

        <section>
          <h3 className="font-bold text-lg text-slate-800 mt-6 mb-3">7. GST and Applicable Taxes</h3>
          <p className="mb-2">Any GST or other applicable taxes on Racoonn's platform/service fee will be charged additionally where required under applicable law, unless expressly stated otherwise in a separate commercial agreement.</p>
          <p className="mb-2">The Partner is responsible for providing accurate tax information, including GST details where applicable.</p>
          <p>The Partner remains responsible for its own applicable taxes, statutory filings, and regulatory obligations relating to its hotel business.</p>
        </section>

        <section>
          <h3 className="font-bold text-lg text-slate-800 mt-6 mb-3">8. Booking and Reservation Responsibility</h3>
          <p className="mb-2">The Partner is responsible for fulfilling confirmed bookings received through Racoonn. The Partner agrees to:</p>
          <ul className="list-disc pl-5 space-y-1 mb-2">
            <li>Honour confirmed reservations</li>
            <li>Provide the booked room category or an appropriate alternative where commercially agreed</li>
            <li>Maintain accurate room availability</li>
            <li>Maintain accurate pricing</li>
            <li>Honour applicable booking terms</li>
            <li>Provide the services represented in the listing</li>
            <li>Maintain reasonable standards of hospitality</li>
            <li>Inform Racoonn promptly of operational issues affecting confirmed bookings</li>
          </ul>
          <p>The Partner must not knowingly accept a Racoonn booking and subsequently refuse accommodation without a legitimate reason.</p>
        </section>

        <section>
          <h3 className="font-bold text-lg text-slate-800 mt-6 mb-3">9. Availability and Inventory</h3>
          <p className="mb-2">The Partner is responsible for maintaining accurate availability on the Racoonn Partner Platform. The Partner should promptly update:</p>
          <ul className="list-disc pl-5 space-y-1 mb-2">
            <li>Available rooms</li>
            <li>Sold-out dates</li>
            <li>Room inventory</li>
            <li>Room prices</li>
            <li>Minimum stay requirements</li>
            <li>Blackout dates</li>
            <li>Seasonal pricing</li>
            <li>Other applicable restrictions</li>
          </ul>
          <p>Racoonn may restrict or suspend bookings where inventory information appears inaccurate or creates a material risk of customer complaints.</p>
        </section>

        <section>
          <h3 className="font-bold text-lg text-slate-800 mt-6 mb-3">10. Pricing</h3>
          <p className="mb-2">The Partner is responsible for providing Racoonn with accurate and competitive room pricing. The Partner must ensure that the prices and conditions provided to Racoonn are genuine and available for the applicable booking conditions.</p>
          <p className="mb-2">The Partner should notify Racoonn promptly of:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Price changes</li>
            <li>New room categories</li>
            <li>Room closures</li>
            <li>Seasonal pricing</li>
            <li>Promotional rates</li>
            <li>Additional charges</li>
            <li>Changes in taxes or mandatory fees</li>
          </ul>
        </section>

        <section>
          <h3 className="font-bold text-lg text-slate-800 mt-6 mb-3">11. Customer Cancellation and Refunds</h3>
          <p className="mb-2">Cancellation and refund conditions may be determined according to the cancellation policy submitted by the Partner and displayed to the customer.</p>
          <p className="mb-2">The Partner agrees to honour the applicable cancellation policy associated with the confirmed booking.</p>
          <p className="mb-2">Where a refund is required, the Partner and Racoonn will cooperate to process the refund according to the applicable booking terms.</p>
          <p>Any Racoonn fee associated with a cancelled or refunded booking may be adjusted according to the applicable commercial arrangement.</p>
        </section>

        <section>
          <h3 className="font-bold text-lg text-slate-800 mt-6 mb-3">12. No-Show</h3>
          <p className="mb-2">If a customer does not arrive for a confirmed reservation, the applicable no-show policy provided by the Partner may apply.</p>
          <p className="mb-2">The Partner must accurately report no-shows to Racoonn where required.</p>
          <p>Any applicable fee, payment, or refund will be handled according to the booking's applicable terms.</p>
        </section>

        <section>
          <h3 className="font-bold text-lg text-slate-800 mt-6 mb-3">13. Overbooking</h3>
          <p className="mb-2">The Partner must make reasonable efforts to prevent overbooking.</p>
          <p className="mb-2">If a confirmed Racoonn booking cannot be honoured due to Partner-side overbooking, the Partner must immediately notify Racoonn.</p>
          <p className="mb-2">Racoonn may require the Partner to:</p>
          <ul className="list-disc pl-5 space-y-1 mb-2">
            <li>Provide an equivalent or upgraded room</li>
            <li>Arrange an alternative suitable property</li>
            <li>Assist with relocation</li>
            <li>Cover applicable additional costs where agreed</li>
            <li>Provide an appropriate refund where applicable</li>
          </ul>
          <p>Repeated overbooking may result in temporary suspension or removal of the property from Racoonn.</p>
        </section>

        <section>
          <h3 className="font-bold text-lg text-slate-800 mt-6 mb-3">14. Partner Responsibilities</h3>
          <p className="mb-2">The Partner agrees to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Provide truthful information</li>
            <li>Maintain valid business documentation</li>
            <li>Maintain required licenses and approvals</li>
            <li>Maintain property standards</li>
            <li>Honour confirmed bookings</li>
            <li>Keep availability accurate</li>
            <li>Keep pricing accurate</li>
            <li>Respond to booking requests promptly</li>
            <li>Cooperate with customer support</li>
            <li>Resolve property-related complaints</li>
            <li>Follow applicable laws and regulations</li>
            <li>Maintain appropriate guest safety and security standards</li>
          </ul>
        </section>

        <section>
          <h3 className="font-bold text-lg text-slate-800 mt-6 mb-3">15. Property Classification</h3>
          <p className="mb-2">Racoonn may classify properties for commercial purposes based on factors including:</p>
          <ul className="list-disc pl-5 space-y-1 mb-2">
            <li>Property category</li>
            <li>Luxury classification</li>
            <li>Facilities</li>
            <li>Services</li>
            <li>Property standards</li>
            <li>Room types</li>
            <li>Market positioning</li>
            <li>Information provided during onboarding</li>
            <li>Applicable official classification or documentation</li>
          </ul>
          <p className="mb-2">The applicable commercial slab may be reviewed by Racoonn from time to time.</p>
          <p>If Racoonn determines that a property has been incorrectly classified, Racoonn may update the applicable fee slab after notifying the Partner.</p>
        </section>

        <section>
          <h3 className="font-bold text-lg text-slate-800 mt-6 mb-3">16. Marketing and Promotion</h3>
          <p className="mb-2">The Partner authorizes Racoonn to promote the Partner's property through:</p>
          <ul className="list-disc pl-5 space-y-1 mb-2">
            <li>Racoonn website</li>
            <li>Racoonn mobile applications</li>
            <li>Search results</li>
            <li>Social media</li>
            <li>Digital advertisements</li>
            <li>Promotional campaigns</li>
            <li>Email marketing</li>
            <li>WhatsApp communication</li>
            <li>Other Racoonn marketing channels</li>
          </ul>
          <p className="mb-2">Racoonn may use the Partner's property name, approved photographs, descriptions, logos, amenities, pricing, and other listing information for these purposes.</p>
          <p>The Partner confirms that it has the necessary rights to provide photographs, logos, trademarks, and other materials submitted to Racoonn.</p>
        </section>

        <section>
          <h3 className="font-bold text-lg text-slate-800 mt-6 mb-3">17. Customer Reviews and Ratings</h3>
          <p className="mb-2">Customers may provide reviews and ratings based on their experience.</p>
          <p className="mb-2">Racoonn may display genuine customer reviews and ratings on the platform.</p>
          <p className="mb-2">The Partner must not:</p>
          <ul className="list-disc pl-5 space-y-1 mb-2">
            <li>Create fake reviews</li>
            <li>Manipulate ratings</li>
            <li>Incentivize fraudulent reviews</li>
            <li>Threaten or pressure customers regarding reviews</li>
            <li>Submit reviews pretending to be customers</li>
          </ul>
          <p>Racoonn may moderate or remove content that violates its policies or applicable law.</p>
        </section>

        <section>
          <h3 className="font-bold text-lg text-slate-800 mt-6 mb-3">18. Payment and Settlement</h3>
          <p className="mb-2">Settlement to the Partner may be processed according to Racoonn's applicable settlement cycle and commercial arrangement.</p>
          <p className="mb-2">Before settlement, Racoonn may deduct applicable:</p>
          <ul className="list-disc pl-5 space-y-1 mb-2">
            <li>Racoonn platform fees</li>
            <li>Taxes on Racoonn fees</li>
            <li>Refund adjustments</li>
            <li>Cancellation adjustments</li>
            <li>Chargebacks</li>
            <li>Other agreed adjustments</li>
          </ul>
          <p className="mb-2">The Partner is responsible for maintaining accurate bank account details.</p>
          <p>Racoonn will not be responsible for delays resulting from incorrect bank details provided by the Partner.</p>
        </section>

        <section>
          <h3 className="font-bold text-lg text-slate-800 mt-6 mb-3">19. Invoices and Statements</h3>
          <p className="mb-2">Racoonn may provide transaction statements, invoices, settlement reports, or other financial records through the Partner Portal or other communication channels.</p>
          <p>The Partner should review these records and notify Racoonn of any discrepancy within a reasonable period.</p>
        </section>

        <section>
          <h3 className="font-bold text-lg text-slate-800 mt-6 mb-3">20. Customer Data</h3>
          <p className="mb-2">Customer information provided to the Partner through Racoonn must be used only for legitimate booking, accommodation, customer service, security, and legally permitted purposes.</p>
          <p className="mb-2">The Partner must not:</p>
          <ul className="list-disc pl-5 space-y-1 mb-2">
            <li>Sell customer information</li>
            <li>Use customer information for unauthorized marketing</li>
            <li>Share customer information with unauthorized third parties</li>
            <li>Use customer information for unrelated purposes</li>
            <li>Attempt to obtain unnecessary personal information</li>
          </ul>
          <p>The Partner must handle customer information in accordance with applicable privacy and data protection laws.</p>
        </section>

        <section>
          <h3 className="font-bold text-lg text-slate-800 mt-6 mb-3">21. Confidentiality</h3>
          <p className="mb-2">The Partner agrees to keep confidential any non-public commercial, technical, customer, financial, or operational information received from Racoonn.</p>
          <p>Confidential information must not be disclosed to third parties except where required by law or necessary for legitimate business operations.</p>
        </section>

        <section>
          <h3 className="font-bold text-lg text-slate-800 mt-6 mb-3">22. Intellectual Property</h3>
          <p className="mb-2">Racoonn retains all rights relating to its:</p>
          <ul className="list-disc pl-5 space-y-1 mb-2">
            <li>Brand</li>
            <li>Logo</li>
            <li>Website</li>
            <li>Partner Portal</li>
            <li>Software</li>
            <li>Technology</li>
            <li>Platform design</li>
            <li>Content</li>
            <li>Systems</li>
            <li>Database</li>
            <li>Marketing materials</li>
          </ul>
          <p>The Partner receives only a limited right to use Racoonn's platform for the purpose of participating as a hotel partner.</p>
        </section>

        <section>
          <h3 className="font-bold text-lg text-slate-800 mt-6 mb-3">23. Suspension or Removal of Property</h3>
          <p className="mb-2">Racoonn may temporarily suspend or remove a property where there is:</p>
          <ul className="list-disc pl-5 space-y-1 mb-2">
            <li>Fraudulent activity</li>
            <li>Repeated customer complaints</li>
            <li>Repeated booking failures</li>
            <li>Repeated overbooking</li>
            <li>Misleading information</li>
            <li>Payment disputes</li>
            <li>Regulatory concerns</li>
            <li>Safety concerns</li>
            <li>Violation of this Agreement</li>
            <li>Misuse of the Racoonn platform</li>
          </ul>
          <p>Where reasonably possible, Racoonn may notify the Partner before suspension or removal.</p>
        </section>

        <section>
          <h3 className="font-bold text-lg text-slate-800 mt-6 mb-3">24. Termination</h3>
          <p className="mb-2">Either party may request termination of the partnership subject to any pending bookings, financial settlements, refunds, disputes, or other outstanding obligations.</p>
          <p className="mb-2">Termination of the partnership does not automatically cancel confirmed bookings unless otherwise agreed.</p>
          <p>The Partner remains responsible for fulfilling confirmed reservations and resolving outstanding customer matters arising before termination.</p>
        </section>

        <section>
          <h3 className="font-bold text-lg text-slate-800 mt-6 mb-3">25. Limitation of Liability</h3>
          <p className="mb-2">Racoonn operates as a technology and booking platform. Racoonn is not directly responsible for the day-to-day operation of the Partner's property.</p>
          <p className="mb-2">The Partner remains responsible for:</p>
          <ul className="list-disc pl-5 space-y-1 mb-2">
            <li>Hotel operations</li>
            <li>Guest safety</li>
            <li>Property services</li>
            <li>Staff</li>
            <li>Rooms</li>
            <li>Amenities</li>
            <li>Food and beverage services</li>
            <li>Property compliance</li>
            <li>Licenses and permits</li>
            <li>Guest experience</li>
          </ul>
          <p>Nothing in this Agreement limits liability where such limitation is prohibited by applicable law.</p>
        </section>

        <section>
          <h3 className="font-bold text-lg text-slate-800 mt-6 mb-3">26. Compliance With Law</h3>
          <p className="mb-2">The Partner agrees to comply with all applicable laws, regulations, licenses, permits, tax requirements, safety requirements, consumer protection requirements, and hospitality-related obligations applicable to its property.</p>
          <p>The Partner is solely responsible for maintaining all legally required approvals for operating the property.</p>
        </section>

        <section>
          <h3 className="font-bold text-lg text-slate-800 mt-6 mb-3">27. Changes to Commercial Terms</h3>
          <p className="mb-2">Racoonn may introduce or modify commercial terms, fee structures, promotional programs, or settlement procedures from time to time.</p>
          <p className="mb-2">Any material change to the applicable commission/fee slab should be communicated to the Partner through appropriate channels and will become effective according to the notice provided.</p>
          <p>The Partner may contact Racoonn regarding any commercial change before continuing participation where applicable.</p>
        </section>

        <section>
          <h3 className="font-bold text-lg text-slate-800 mt-6 mb-3">28. Governing Law</h3>
          <p className="mb-2">This Agreement shall be governed by the applicable laws of India.</p>
          <p>Any dispute arising between Racoonn and the Partner shall be subject to the jurisdiction of the courts having appropriate jurisdiction under applicable law.</p>
        </section>

        <section>
          <h3 className="font-bold text-lg text-slate-800 mt-6 mb-3">29. Partner Declaration</h3>
          <p className="mb-2">By submitting the Partner Profile, the Partner confirms that:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>The information submitted is accurate and complete.</li>
            <li>The Partner is authorized to represent the property.</li>
            <li>The Partner has read and understood this Agreement.</li>
            <li>The Partner agrees to the applicable Racoonn fee slab.</li>
            <li>The Partner agrees to pay the applicable Racoonn fee on eligible bookings.</li>
            <li>The Partner agrees to comply with Racoonn's platform policies.</li>
            <li>The Partner agrees to honour confirmed bookings.</li>
            <li>The Partner agrees to comply with applicable laws.</li>
            <li>The Partner has authority to enter into this Agreement.</li>
            <li>The Partner agrees that Racoonn may use submitted property information for listing and promotional purposes.</li>
          </ul>
        </section>

        <section className="bg-slate-50 p-6 rounded-xl border border-slate-200 mt-8">
          <h3 className="font-bold text-lg text-slate-800 mb-4">30. Applicable Fee Slab Confirmation</h3>
          <p className="mb-2">The Partner acknowledges the following applicable commercial slab:</p>
          <ul className="space-y-2 mb-4">
            <li><strong>Property Category:</strong> [ STANDARD / NON-LUXURY / LUXURY ]</li>
            <li><strong>Applicable Racoonn Fee:</strong> [ 18% / 24% ]</li>
            <li><strong>Fee Applicable To:</strong> Eligible bookings generated through Racoonn.</li>
          </ul>
          <p>The Partner confirms that the selected fee slab has been reviewed before submitting the Partner Profile.</p>
        </section>

        <section className="bg-brand-coral/5 p-6 rounded-xl border border-brand-coral/20 mt-6">
          <h3 className="font-bold text-lg text-slate-800 mb-4">31. Digital Acceptance</h3>
          <p className="mb-4">The Partner's acceptance may be recorded electronically through the Racoonn Partner Platform.</p>
          <div className="flex items-start gap-3 mb-4">
            <div className="w-5 h-5 mt-0.5 border-2 border-brand-coral rounded flex items-center justify-center bg-brand-coral text-white">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <p className="font-bold text-slate-700">
              I have read and agree to the Racoonn Hotel Partner Agreement, including the applicable 18% / 24% fee structure.
            </p>
          </div>
          <p className="mb-4">and clicking: <strong>“Submit Profile & Accept Agreement”</strong> (or equivalent), the Partner confirms its acceptance of this Agreement electronically.</p>
          <p className="text-xs text-slate-500">The electronic acceptance, timestamp, registered account information, IP address, and other relevant technical records may be retained by Racoonn as evidence of acceptance, subject to applicable law.</p>
        </section>
      </div>
    </div>
  );
}
