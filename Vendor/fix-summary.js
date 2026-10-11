const fs = require('fs');
const path = 'e:/Racoonn/Vendor/app/vendor/(dashboard)/bookings/page.tsx';
let data = fs.readFileSync(path, 'utf8');

const target = `<div className="flex justify-between items-center text-base font-black text-secondary">
                          <span>Total Paid</span>
                          <span className="text-brand-coral">₹{totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>`;

const replacement = `<div className="flex justify-between items-center text-sm font-medium text-slate-600">
                          <span>Gross Booking Value</span>
                          <span>₹{(baseRoomAmount + addonsNum - discountNum).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-medium text-rose-500">
                          <span>Platform Fee ({profile?.allow24PercentGst ? '24%' : '18%'})</span>
                          <span>-₹{(Math.round((baseRoomAmount + addonsNum - discountNum) * (profile?.allow24PercentGst ? 24 : 18) / 100)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="h-px bg-slate-200/50 my-3"></div>
                        <div className="flex justify-between items-center text-base font-black text-emerald-600">
                          <span>Vendor's Net Revenue</span>
                          <span>₹{((baseRoomAmount + addonsNum - discountNum) - Math.round((baseRoomAmount + addonsNum - discountNum) * (profile?.allow24PercentGst ? 24 : 18) / 100)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                        
                        <div className="mt-4 pt-3 border-t border-dashed border-slate-200">
                          <div className="flex justify-between items-center text-xs font-semibold text-slate-400 uppercase tracking-wide">
                            <span>Total Guest Paid (incl GST)</span>
                            <span>₹{totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                          </div>
                        </div>`;

if (data.includes(target)) {
  data = data.replace(target, replacement);
  fs.writeFileSync(path, data, 'utf8');
  console.log('Fixed Payment Summary UI');
} else {
  console.log('Target string not found');
}
