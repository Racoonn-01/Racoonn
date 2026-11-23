const fs = require('fs');
const template = fs.readFileSync('e:\\Racoonn\\invoiceTemplateNew.tsx', 'utf8');

// Admin Version
let adminContent = template.replace(
  'export default function CustomInvoicesPage({ isVendor = false, vendorId = "" }) {', 
  'export default function AdminInvoicesPage() {\n  const isVendor = false;\n  const vendorId = "";'
);
fs.writeFileSync('e:\\Racoonn\\Admin\\src\\app\\admin\\invoices\\page.tsx', adminContent);

// Vendor Version
let vendorContent = template.replace(
  'import React, { useState, useEffect, useMemo } from "react";',
  'import React, { useState, useEffect, useMemo } from "react";\nimport { useAuthStore } from "@/store/authStore";'
).replace(
  'export default function CustomInvoicesPage({ isVendor = false, vendorId = "" }) {',
  'export default function VendorInvoicesPage() {\n  const { user } = useAuthStore();\n  const isVendor = true;\n  const vendorId = user?.$id;'
);
fs.writeFileSync('e:\\Racoonn\\Vendor\\app\\vendor\\(dashboard)\\invoices\\page.tsx', vendorContent);
console.log('Pages updated successfully');
