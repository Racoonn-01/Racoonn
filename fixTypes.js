const fs = require('fs');

function fixTypes(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('export interface Invoice {')) {
    content = content.replace('export interface Invoice {', `export interface Invoice {
  invoiceTotal?: number;
  nights?: number;
  taxableValue?: number;
  cgst?: number;
  sgst?: number;
  igst?: number;`);
    fs.writeFileSync(filePath, content);
  }
}

fixTypes('e:\\Racoonn\\Admin\\src\\app\\admin\\invoices\\page.tsx');
fixTypes('e:\\Racoonn\\Vendor\\app\\vendor\\(dashboard)\\invoices\\page.tsx');
console.log('Fixed types');
