const fs = require('fs');
let content = fs.readFileSync('e:\\Racoonn\\Vendor\\app\\vendor\\(dashboard)\\invoices\\page.tsx', 'utf8');

const replacement = `import { Query } from "appwrite";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value || 0);
};

export interface LineItem {`;

content = content.replace(/import \{ Query \} from "appwrite";\s+export interface LineItem \{/, replacement);

fs.writeFileSync('e:\\Racoonn\\Vendor\\app\\vendor\\(dashboard)\\invoices\\page.tsx', content);
