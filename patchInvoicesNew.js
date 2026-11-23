const fs = require('fs');

function patchFile(filePath, isVendor) {
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Replace generateInvoicePDFBlob
  const pdfRegex = /const generateInvoicePDFBlob = \(inv: Invoice\): Blob => \{[\s\S]*?return doc\.output\("blob"\);\s*\};/;
  const newPdfCode = `const generateInvoicePDFBlob = (inv: Invoice): Blob => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(24);
    doc.setTextColor(0, 0, 0); 
    doc.text("TAX INVOICE", 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Hotel Accommodation Services billed to OTA Platform - Racoonn", 14, 30);
    
    // Header Info
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(\`Invoice No: \${inv.invoiceNumber}\`, 14, 45);
    doc.text(\`Date: \${inv.issueDate || new Date().toLocaleDateString()}\`, 140, 45);
    // Assuming place of supply is static or from vendor
    doc.text(\`Place of Supply: Uttarakhand (05)\`, 140, 52);

    doc.setDrawColor(0, 0, 0);
    doc.line(14, 58, 196, 58); // Horizontal line

    // From / To sections
    doc.setFontSize(11);
    doc.text("From — Hotel / Service Provider", 14, 70);
    doc.setFontSize(10);
    doc.text(\`\${inv.vendorBusiness || inv.vendorName || "Vendor"}\`, 14, 77);
    doc.text(\`India\`, 14, 84); // Assuming Country
    doc.text(\`Email: \${inv.vendorEmail || ""}\`, 14, 91);
    const vendorAddressLines = doc.splitTextToSize(inv.vendorAddress || "", 90);
    doc.text(vendorAddressLines, 14, 98);

    doc.setFontSize(11);
    doc.text("Bill To — OTA / Aggregator", 110, 70);
    doc.setFontSize(10);
    doc.text(\`CIELLE TRAVELS PRIVATE LIMITED\`, 110, 77);
    const racoonnAddr = doc.splitTextToSize("B-81, Rose Villa, Samiah Lake City, Rudrapur, Uttarakhand", 85);
    doc.text(racoonnAddr, 110, 84);
    doc.text(\`Email: info@racoonn.com\`, 110, 94); // Adjusted Y depending on racoonnAddr length
    doc.text(\`GSTIN: 05AAOCC0859Q1Z0\`, 110, 101);

    // Calculate taxes (18% or 5%)
    const invoiceTotal = inv.invoiceTotal || inv.totalAmount || 0;
    const nights = inv.nights || 1;
    const pricePerNight = invoiceTotal / nights;
    const gstRate = pricePerNight <= 7500 ? 0.05 : 0.18;
    const gstMultiplier = 1 + gstRate;
    const taxable = inv.taxableValue || Number((invoiceTotal / gstMultiplier).toFixed(2));
    const totalGst = (inv.cgst || inv.sgst || inv.igst) ? (inv.cgst || 0) + (inv.sgst || 0) + (inv.igst || 0) : Number((invoiceTotal - taxable).toFixed(2));
    
    // Main Table
    autoTable(doc, {
      startY: 120, // Adjust this based on address lines length
      head: [["Description", "SAC", "Taxable Amount"]],
      body: [
        ["Room accommodation charges", "996311", \`Rs. \${taxable.toFixed(2)}\`]
      ],
      theme: "striped",
      headStyles: { fillColor: [225, 100, 100], textColor: 255, fontStyle: 'bold' }
    });

    // GST Summary Table
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 15,
      head: [["GST Summary", "Amount"]],
      body: [
        ["Taxable Value", \`Rs. \${taxable.toFixed(2)}\`],
        [\`IGST (\${gstRate * 100}%)\`, \`Rs. \${totalGst.toFixed(2)}\`],
        ["Invoice Total / Net Payable", \`Rs. \${invoiceTotal.toFixed(2)}\`]
      ],
      theme: "striped",
      headStyles: { fillColor: [180, 180, 180], textColor: 255, fontStyle: 'bold' }
    });

    // Disclaimer
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.text(
      "This invoice has been generated electronically through the Racoonn platform. It is valid without a physical signature, subject to applicable law\\nand electronic authentication requirements.",
      14,
      finalY
    );

    return doc.output("blob");
  };`;
  content = content.replace(pdfRegex, newPdfCode);

  // 2. Export Button Logic
  if (!content.includes('exportStartDate')) {
    content = content.replace('// Search & Filter state', `// Search & Filter state
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');
  const [exportError, setExportError] = useState('');

  const handleExportData = () => {
    if (!exportStartDate || !exportEndDate) {
      setExportError('Please select both start and end dates');
      return;
    }
    const filtered = invoices.filter(inv => {
      const dStr = inv.issueDate || inv.createdAt;
      if (!dStr) return false;
      const d = new Date(dStr);
      return d >= new Date(exportStartDate) && d <= new Date(exportEndDate);
    });
    if (filtered.length === 0) {
      setExportError('No invoices found in this date range');
      return;
    }
    const headers = ['Invoice No.', 'Hotel', 'Taxable amount', 'IGST at 5%', 'Net payable', 'Racoonn booking reference', 'Current status', 'Hotel Address', 'Hotel GSTIN'];
    
    const csvContent = [
      headers.join(','),
      ...filtered.map(inv => {
        const invoiceTotal = inv.invoiceTotal || inv.totalAmount || 0;
        const nights = inv.nights || 1;
        const pricePerNight = invoiceTotal / nights;
        const gstRate = pricePerNight <= 7500 ? 0.05 : 0.18;
        const gstMultiplier = 1 + gstRate;
        const taxable = inv.taxableValue || Number((invoiceTotal / gstMultiplier).toFixed(2));
        const totalGst = (inv.cgst || inv.sgst || inv.igst) ? (inv.cgst || 0) + (inv.sgst || 0) + (inv.igst || 0) : Number((invoiceTotal - taxable).toFixed(2));
        
        return [
          \`"\${inv.invoiceNumber || inv.id?.slice(0,8) || ''}"\`,
          \`"\${inv.vendorBusiness || inv.vendorName || ''}"\`,
          taxable,
          totalGst,
          invoiceTotal,
          \`"\${inv.bookingIds?.[0]?.substring(0,8) || 'N/A'}"\`,
          \`"\${inv.status || 'Invoice Submitted'}"\`,
          \`"\${inv.vendorAddress || ''}"\`,
          \`"\${inv.vendorGstNumber || inv.vendorGstin || ''}"\`
        ].join(',');
      })
    ].join('\\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = \`invoices_\${exportStartDate}_to_\${exportEndDate}.csv\`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setIsExportModalOpen(false);
  };
`);
  }

  // 3. Export Modal UI
  if (!content.includes('isExportModalOpen')) {
    const dialogEndRegex = /<\/div>\s*<\/div>\s*<\/DialogContent>\s*<\/Dialog>/;
    const exportModalUI = `      {/* Export Modal */}
      <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
        <DialogContent className="sm:max-w-md bg-white p-0 overflow-hidden rounded-2xl">
          <DialogHeader className="p-6 border-b border-slate-100">
            <DialogTitle className="text-xl font-bold text-slate-800">Export Invoices</DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-4">
            <p className="text-sm text-slate-500">Select a date range to export all invoice data into a CSV file.</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Start Date</label>
                <input type="date" value={exportStartDate} onChange={(e) => setExportStartDate(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#E86A70]" />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1.5 block">End Date</label>
                <input type="date" value={exportEndDate} onChange={(e) => setExportEndDate(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#E86A70]" />
              </div>
            </div>
            {exportError && <p className="text-sm font-medium text-rose-500 bg-rose-50 px-3 py-2 rounded-lg">{exportError}</p>}
          </div>
          <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsExportModalOpen(false)} className="font-semibold text-slate-600 hover:bg-slate-200">Cancel</Button>
            <Button onClick={handleExportData} className="bg-[#E86A70] hover:bg-[#D65A60] text-white font-semibold shadow-sm">
               Download CSV
            </Button>
          </div>
        </DialogContent>
      </Dialog>
`;
    // Insert just before the final return closing tag
    const returnRegex = /(return\s*\(\s*<div[\s\S]*?)(\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\)\s*;\s*\}|\s*<\/div>\s*<\/div>\s*\)\s*;\s*\})/;
    content = content.replace(returnRegex, (match, p1, p2) => {
      return p1 + '\n' + exportModalUI + '\n' + p2;
    });
  }

  // 4. Update the Table columns in the UI
  // Find the table header:
  content = content.replace(/<th className="px-6 py-4 font-bold text-gray-900">Amount<\/th>/, '<th className="px-6 py-4 font-bold text-gray-900">Taxable amount</th>\n<th className="px-6 py-4 font-bold text-gray-900">GST Amount</th>\n<th className="px-6 py-4 font-bold text-gray-900">Net payable</th>');
  
  // Find the table row rendering:
  const amountRenderRegex = /<td className="px-6 py-4 font-bold text-slate-700">₹\{inv\.totalAmount\.toLocaleString\("en-IN"\)\}<\/td>/;
  const newAmountRender = `<td className="px-6 py-4 font-bold text-slate-700">₹{(() => {
    const invoiceTotal = inv.invoiceTotal || inv.totalAmount || 0;
    const nights = inv.nights || 1;
    const pricePerNight = invoiceTotal / nights;
    const gstRate = pricePerNight <= 7500 ? 0.05 : 0.18;
    const gstMultiplier = 1 + gstRate;
    const taxable = inv.taxableValue || Number((invoiceTotal / gstMultiplier).toFixed(2));
    return taxable.toLocaleString("en-IN");
  })()}</td>
  <td className="px-6 py-4 font-bold text-slate-700">₹{(() => {
    const invoiceTotal = inv.invoiceTotal || inv.totalAmount || 0;
    const nights = inv.nights || 1;
    const pricePerNight = invoiceTotal / nights;
    const gstRate = pricePerNight <= 7500 ? 0.05 : 0.18;
    const gstMultiplier = 1 + gstRate;
    const taxable = inv.taxableValue || Number((invoiceTotal / gstMultiplier).toFixed(2));
    const totalGst = (inv.cgst || inv.sgst || inv.igst) ? (inv.cgst || 0) + (inv.sgst || 0) + (inv.igst || 0) : Number((invoiceTotal - taxable).toFixed(2));
    return totalGst.toLocaleString("en-IN");
  })()}</td>
  <td className="px-6 py-4 font-bold text-slate-700">₹{inv.totalAmount.toLocaleString("en-IN")}</td>`;
  content = content.replace(amountRenderRegex, newAmountRender);
  
  // Add Export Button next to the title or filters
  const filterSectionRegex = /<div className="flex flex-col md:flex-row items-center gap-4">/;
  const exportButtonHtml = `<div className="flex flex-col md:flex-row items-center gap-4">
            <Button onClick={() => { setIsExportModalOpen(true); setExportError(''); }} variant="outline" className="h-10 px-4 rounded-xl border-slate-200 text-slate-700 font-semibold gap-2 whitespace-nowrap">
              Export Data
            </Button>`;
  content = content.replace(filterSectionRegex, exportButtonHtml);

  fs.writeFileSync(filePath, content);
}

patchFile('e:\\Racoonn\\Admin\\src\\app\\admin\\invoices\\page.tsx', false);
patchFile('e:\\Racoonn\\Vendor\\app\\vendor\\(dashboard)\\invoices\\page.tsx', true);

console.log('Patched correctly');
