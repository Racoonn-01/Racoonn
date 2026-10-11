const fs = require('fs');

// Fix 1: Admin payouts actions
const actionsPath = 'e:/Racoonn/Admin/src/app/admin/payouts/actions.ts';
let actionsData = fs.readFileSync(actionsPath, 'utf8');

actionsData = actionsData.replace(
  /\/\/ Standard platform commission fee \(18% \+ 18% GST = 21\.24%\)\s*const platformFee = Math\.round\(grossAmount \* 0\.2124\);/g,
  `const effectiveFeePercent = vendorObj?.allow24PercentGst ? 24 : 18;\n      const platformFee = Math.round(grossAmount * (effectiveFeePercent / 100));`
);

fs.writeFileSync(actionsPath, actionsData, 'utf8');


// Fix 2: Admin invoices page fallback
const invoicesPath = 'e:/Racoonn/Admin/src/app/admin/invoices/page.tsx';
let invoicesData = fs.readFileSync(invoicesPath, 'utf8');

invoicesData = invoicesData.replace(
  /const slab = inv\.platformFeeRate \|\| 25;/g,
  'const slab = inv.platformFeeRate || 18;'
);

invoicesData = invoicesData.replace(
  /Commission Slab \(\{selectedInvoice\.platformFeeRate \|\| 25\}%\) verified/g,
  'Commission Slab ({selectedInvoice.platformFeeRate || 18}%) verified'
);

invoicesData = invoicesData.replace(
  /Platform Fee \(\{selectedInvoice\.platformFeeRate \|\| 25\}%\)/g,
  'Platform Fee ({selectedInvoice.platformFeeRate || 18}%)'
);

fs.writeFileSync(invoicesPath, invoicesData, 'utf8');

console.log('Fixed math inconsistencies');
