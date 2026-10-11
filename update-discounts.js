const fs = require('fs');

// 1. UPDATE CHECKOUT STORE
let checkoutPath = 'e:/Racoonn/User/src/store/checkoutStore.ts';
let checkoutData = fs.readFileSync(checkoutPath, 'utf8');

// Add issuer to Coupon interface
checkoutData = checkoutData.replace(
  `export interface Coupon {
  code: string;
  type: 'fixed' | 'percentage';
  value: number;
}`,
  `export interface Coupon {
  code: string;
  type: 'fixed' | 'percentage';
  value: number;
  issuer?: 'racoonn' | 'vendor';
}`
);

// Set static coupons issuer
checkoutData = checkoutData.replace(
  `export const VALID_COUPONS: Record<string, Coupon> = {
  'WELCOME10': { code: 'WELCOME10', type: 'percentage', value: 10 },
  'FLAT500': { code: 'FLAT500', type: 'fixed', value: 500 }
};`,
  `export const VALID_COUPONS: Record<string, Coupon> = {
  'WELCOME10': { code: 'WELCOME10', type: 'percentage', value: 10, issuer: 'racoonn' },
  'FLAT500': { code: 'FLAT500', type: 'fixed', value: 500, issuer: 'racoonn' }
};`
);

// Set vendor cookie coupons issuer
checkoutData = checkoutData.replace(
  `            type: isPercentage ? 'percentage' : 'fixed',
            value: discountVal
          };`,
  `            type: isPercentage ? 'percentage' : 'fixed',
            value: discountVal,
            issuer: 'vendor'
          };`
);

// Set global promotions issuer
checkoutData = checkoutData.replace(
  `          type: isPercentage ? 'percentage' : 'fixed',
          value: discountVal
        };`,
  `          type: isPercentage ? 'percentage' : 'fixed',
          value: discountVal,
          issuer: 'racoonn'
        };`
);

// Set WELCOMERACOONN issuer
checkoutData = checkoutData.replace(
  `set({ appliedCoupon: { code: 'WELCOMERACOONN', type: 'percentage', value: 10 } });`,
  `set({ appliedCoupon: { code: 'WELCOMERACOONN', type: 'percentage', value: 10, issuer: 'racoonn' } });`
);

// Fix checkout calculation string
const calcTarget = `      const platformCommissionRate = 18;
      const platformCommissionAmount = Math.round((roomAmount * (platformCommissionRate / 100)) * 100) / 100;
      const vendorSettlement = Math.round((totalAmount - platformCommissionAmount) * 100) / 100;

      // Format additional travelers and GST metadata info
      let finalSpecialRequests = guestDetails.specialRequests || '';
      finalSpecialRequests += \`\\n[GST Info: Rate=\${gstRate}%, Taxable=₹\${roomAmount}, GST=₹\${gstAmount}, VendorPayout=₹\${vendorSettlement}]\`;`;

const calcReplacement = `      const platformCommissionRate = 18;
      const vendorDiscount = appliedCoupon?.issuer === 'vendor' ? discount : 0;
      const racoonnDiscount = appliedCoupon?.issuer === 'racoonn' ? discount : 0;
      // Platform fee is 18% of (Room + Addons) regardless of who gives discount, wait, usually platform fee is on gross before racoonn discount
      const vendorGross = roomAmount + addons - vendorDiscount;
      const platformCommissionAmount = Math.round((vendorGross * (platformCommissionRate / 100)) * 100) / 100;
      
      // Vendor gets their Gross + GST - Platform Fee
      const vendorSettlement = Math.round((vendorGross + gstAmount - platformCommissionAmount) * 100) / 100;

      // Format additional travelers and GST metadata info
      let finalSpecialRequests = guestDetails.specialRequests || '';
      finalSpecialRequests += \`\\n[GST Info: Rate=\${gstRate}%, Taxable=₹\${roomAmount}, GST=₹\${gstAmount}, VendorPayout=₹\${vendorSettlement}, VendorDiscount=₹\${vendorDiscount}, RacoonnDiscount=₹\${racoonnDiscount}]\`;`;

checkoutData = checkoutData.replace(calcTarget, calcReplacement);
fs.writeFileSync(checkoutPath, checkoutData, 'utf8');

// 2. UPDATE VENDOR BOOKINGS DASHBOARD
let vendorPath = 'e:/Racoonn/Vendor/app/vendor/(dashboard)/bookings/page.tsx';
let vendorData = fs.readFileSync(vendorPath, 'utf8');

const vendorSummaryTarget = `                        <div className="flex justify-between items-center text-sm font-medium text-slate-600">
                          <span>Gross Booking Value</span>
                          <span>₹{(baseRoomAmount + addonsNum - discountNum).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-medium text-rose-500">
                          <span>Platform Fee ({profile?.allow24PercentGst ? '24%' : '18%'})</span>
                          <span>-₹{(Math.round((baseRoomAmount + addonsNum - discountNum) * (profile?.allow24PercentGst ? 24 : 18) / 100)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="h-px bg-slate-200/50 my-3"></div>
                        <div className="flex justify-between items-center text-base font-black text-emerald-600">
                          <span>Vendor Net Revenue</span>
                          <span>₹{((baseRoomAmount + addonsNum - discountNum) - Math.round((baseRoomAmount + addonsNum - discountNum) * (profile?.allow24PercentGst ? 24 : 18) / 100)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>`;

const vendorSummaryReplacement = `                        {(() => {
                          let vendorDiscount = 0;
                          let racoonnDiscount = 0;
                          if (selectedBooking.specialRequests) {
                            const vdMatch = selectedBooking.specialRequests.match(/VendorDiscount=₹?([0-9.]+)/);
                            if (vdMatch) vendorDiscount = parseFloat(vdMatch[1]);
                            const rdMatch = selectedBooking.specialRequests.match(/RacoonnDiscount=₹?([0-9.]+)/);
                            if (rdMatch) racoonnDiscount = parseFloat(rdMatch[1]);
                          } else {
                            // legacy fallback: assume all discounts are vendor discounts if not specified
                            vendorDiscount = discountNum;
                          }
                          const vendorGross = baseRoomAmount + addonsNum - vendorDiscount;
                          const feePercent = profile?.allow24PercentGst ? 24 : 18;
                          const platformFee = Math.round(vendorGross * (feePercent / 100));
                          const vendorNet = vendorGross - platformFee;

                          return (
                            <>
                              <div className="flex justify-between items-center text-sm font-medium text-slate-600">
                                <span>Gross Booking Value (Room + Addons)</span>
                                <span>₹{(baseRoomAmount + addonsNum).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                              </div>
                              {vendorDiscount > 0 && (
                                <div className="flex justify-between items-center text-sm font-medium text-amber-600">
                                  <span>Vendor Coupon Applied</span>
                                  <span>-₹{vendorDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                              )}
                              {racoonnDiscount > 0 && (
                                <div className="flex justify-between items-center text-sm font-medium text-slate-400">
                                  <span>Platform Promo (Covered by Racoonn)</span>
                                  <span>₹{racoonnDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                              )}
                              <div className="flex justify-between items-center text-sm font-medium text-rose-500">
                                <span>Platform Fee ({feePercent}%)</span>
                                <span>-₹{platformFee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                              </div>
                              <div className="h-px bg-slate-200/50 my-3"></div>
                              <div className="flex justify-between items-center text-base font-black text-emerald-600">
                                <span>Vendor Net Revenue</span>
                                <span>₹{vendorNet.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                              </div>
                            </>
                          );
                        })()}`;

vendorData = vendorData.replace(vendorSummaryTarget, vendorSummaryReplacement);
fs.writeFileSync(vendorPath, vendorData, 'utf8');

console.log('Fixed discount logic across store and dashboard');
