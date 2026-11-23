const fs = require('fs');

const adminCode = fs.readFileSync('e:\\Racoonn\\Admin\\src\\app\\admin\\invoices\\page.tsx', 'utf8');

let vendorCode = adminCode;

// 1. Rename AdminInvoicesPage to VendorInvoicesPage
vendorCode = vendorCode.replace('export default function AdminInvoicesPage', 'export default function VendorInvoicesPage');

// 2. Add authStore import
vendorCode = vendorCode.replace('import { Button }', 'import { useAuthStore } from "@/store/authStore";\nimport { Button }');

// 3. Add user state inside component
vendorCode = vendorCode.replace('const [invoices, setInvoices] = useState<any[]>([]);', 'const { user } = useAuthStore();\n  const [invoices, setInvoices] = useState<any[]>([]);');

// 4. Update fetch logic to filter by vendorId
const fetchLogicRegex = /if \(data\.success && data\.invoices\) \{[\s\S]*?setInvoices\(data\.invoices\);[\s\S]*?\}/;
const newFetchLogic = `if (data.success && data.invoices) {
        // Only show invoices belonging to this vendor
        const vendorInvoices = data.invoices.filter((inv: any) => inv.vendorId === user?.$id);
        setInvoices(vendorInvoices);
      }`;
vendorCode = vendorCode.replace(fetchLogicRegex, newFetchLogic);

// Write to vendor
fs.writeFileSync('e:\\Racoonn\\Vendor\\app\\vendor\\(dashboard)\\invoices\\page.tsx', vendorCode);
