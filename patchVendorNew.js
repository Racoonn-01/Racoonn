const fs = require('fs');

const STATUSES = [
  'Invoice Submitted',
  'Under Review',
  'Reconciliation Pending',
  'Approved for Payment',
  'Payment Initiated',
  'Paid',
  'Closed'
];

function patchVendorInvoices(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Export Button Logic
  if (!content.includes('isExportModalOpen')) {
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

  // Export UI Modal
  if (!content.includes('Export Invoices')) {
    const exportModalUI = `      {/* Export Modal */}
      <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
        <DialogContent className="sm:max-w-md bg-white p-0 overflow-hidden rounded-2xl z-[150]">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-800">Export Invoices</h2>
          </div>
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
      </Dialog>`;
    const returnRegex = /(return\s*\(\s*<div[\s\S]*?)(\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\)\s*;\s*\}|\s*<\/div>\s*<\/div>\s*\)\s*;\s*\})/;
    content = content.replace(returnRegex, (match, p1, p2) => {
      return p1 + '\n' + exportModalUI + '\n' + p2;
    });
  }

  // Update Status Modal UI
  if (!content.includes('Update Status Modal')) {
      const modalJSX = `      {/* Update Status Modal */}
      {statusModalInv && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-100">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-800">Update Status</h3>
              <button onClick={() => setStatusModalInv(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-500">
                Update the status for Invoice <strong>{statusModalInv.invoiceNumber || statusModalInv.id?.slice(0, 8)}</strong>.
              </p>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1.5 block">New Status</label>
                <select 
                  value={newStatus} 
                  onChange={e => setNewStatus(e.target.value)} 
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:outline-none focus:border-[#E86A70] bg-white text-sm"
                >
                  <option value="">Select Status</option>
                  ${STATUSES.map(s => `<option value="${s}">${s}</option>`).join('\n')}
                </select>
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setStatusModalInv(null)} className="font-semibold text-slate-600 hover:bg-slate-200">Cancel</Button>
              <Button onClick={handleUpdateStatus} disabled={!newStatus || isUpdatingStatus} className="bg-[#E86A70] hover:bg-[#D65A60] text-white font-semibold">
                Confirm Update
              </Button>
            </div>
          </div>
        </div>
      )}`;
      const returnRegex = /(return\s*\(\s*<div[\s\S]*?)(\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\)\s*;\s*\}|\s*<\/div>\s*<\/div>\s*\)\s*;\s*\})/;
      content = content.replace(returnRegex, (match, p1, p2) => {
        return p1 + '\n' + modalJSX + '\n' + p2;
      });
  }

  // Replace PDF Blob logic
  const pdfRegex = /const generateInvoicePDFBlob = \(inv: Invoice\): Blob => \{[\s\S]*?return doc\.output\("blob"\);\s*\};/;
  const newPdfCode = `const generateInvoicePDFBlob = (inv: Invoice): Blob => {
    const doc = new jsPDF();
    doc.setFontSize(24);
    doc.setTextColor(0, 0, 0); 
    doc.text("TAX INVOICE", 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Hotel Accommodation Services billed to OTA Platform - Racoonn", 14, 30);
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(\`Invoice No: \${inv.invoiceNumber}\`, 14, 45);
    doc.text(\`Date: \${inv.issueDate || new Date().toLocaleDateString()}\`, 140, 45);
    doc.text(\`Place of Supply: Uttarakhand (05)\`, 140, 52);

    doc.setDrawColor(0, 0, 0);
    doc.line(14, 58, 196, 58); 

    doc.setFontSize(11);
    doc.text("From — Hotel / Service Provider", 14, 70);
    doc.setFontSize(10);
    doc.text(\`\${inv.vendorBusiness || inv.vendorName || "Vendor"}\`, 14, 77);
    doc.text(\`India\`, 14, 84);
    doc.text(\`Email: \${inv.vendorEmail || ""}\`, 14, 91);
    const vendorAddressLines = doc.splitTextToSize(inv.vendorAddress || "", 90);
    doc.text(vendorAddressLines, 14, 98);

    doc.setFontSize(11);
    doc.text("Bill To — OTA / Aggregator", 110, 70);
    doc.setFontSize(10);
    doc.text(\`CIELLE TRAVELS PRIVATE LIMITED\`, 110, 77);
    const racoonnAddr = doc.splitTextToSize("B-81, Rose Villa, Samiah Lake City, Rudrapur, Uttarakhand", 85);
    doc.text(racoonnAddr, 110, 84);
    doc.text(\`Email: info@racoonn.com\`, 110, 94);
    doc.text(\`GSTIN: 05AAOCC0859Q1Z0\`, 110, 101);

    const invoiceTotal = inv.invoiceTotal || inv.totalAmount || 0;
    const nights = inv.nights || 1;
    const pricePerNight = invoiceTotal / nights;
    const gstRate = pricePerNight <= 7500 ? 0.05 : 0.18;
    const gstMultiplier = 1 + gstRate;
    const taxable = inv.taxableValue || Number((invoiceTotal / gstMultiplier).toFixed(2));
    const totalGst = (inv.cgst || inv.sgst || inv.igst) ? (inv.cgst || 0) + (inv.sgst || 0) + (inv.igst || 0) : Number((invoiceTotal - taxable).toFixed(2));
    
    autoTable(doc, {
      startY: 120,
      head: [["Description", "SAC", "Taxable Amount"]],
      body: [
        ["Room accommodation charges", "996311", \`Rs. \${taxable.toFixed(2)}\`]
      ],
      theme: "striped",
      headStyles: { fillColor: [225, 100, 100], textColor: 255, fontStyle: 'bold' }
    });

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

  // Export Data UI Button
  const exportButtonHtml = `<Button onClick={() => { setIsExportModalOpen(true); setExportError(''); }} variant="outline" className="h-9 px-4 rounded-xl border-gray-200 text-gray-700 font-semibold gap-2 whitespace-nowrap shadow-sm text-xs">
              <Download className="w-3.5 h-3.5" /> Export Data
            </Button>`;
  content = content.replace(/<div className="flex items-center gap-4 w-full md:w-auto">/, `<div className="flex items-center gap-4 w-full md:w-auto">\n${exportButtonHtml}`);

  // Table Columns Updates for Vendor
  const tableHeadersRegex = /<th className="p-4 whitespace-nowrap">Bookings Count<\/th>\s*<th className="p-4 whitespace-nowrap">Net Payout Payable<\/th>/;
  content = content.replace(tableHeadersRegex, `<th className="p-4 whitespace-nowrap">Bookings Count</th>
                <th className="p-4 whitespace-nowrap">Taxable Amount</th>
                <th className="p-4 whitespace-nowrap">GST Amount</th>
                <th className="p-4 whitespace-nowrap">Net Payout Payable</th>`);

  const tableBodyRegex = /<td className="p-4 font-bold text-gray-900">\s*\{inv\.bookingsCount \|\| \d+\} Bookings\s*<\/td>\s*<td className="p-4">\s*<div className="font-black text-lg text-gray-900">\s*₹\{inv\.totalAmount\.toLocaleString\("en-IN"\)\}\s*<\/div>\s*<\/td>/g;
  content = content.replace(tableBodyRegex, `<td className="p-4 font-bold text-gray-900">
                      {inv.bookingsCount || 1} Bookings
                    </td>
                    <td className="p-4 font-bold text-gray-700">
                      ₹{(() => {
                        const invoiceTotal = inv.invoiceTotal || inv.totalAmount || 0;
                        const nights = inv.nights || 1;
                        const pricePerNight = invoiceTotal / nights;
                        const gstRate = pricePerNight <= 7500 ? 0.05 : 0.18;
                        const gstMultiplier = 1 + gstRate;
                        const taxable = inv.taxableValue || Number((invoiceTotal / gstMultiplier).toFixed(2));
                        return taxable.toLocaleString("en-IN");
                      })()}
                    </td>
                    <td className="p-4 font-bold text-gray-700">
                      ₹{(() => {
                        const invoiceTotal = inv.invoiceTotal || inv.totalAmount || 0;
                        const nights = inv.nights || 1;
                        const pricePerNight = invoiceTotal / nights;
                        const gstRate = pricePerNight <= 7500 ? 0.05 : 0.18;
                        const gstMultiplier = 1 + gstRate;
                        const taxable = inv.taxableValue || Number((invoiceTotal / gstMultiplier).toFixed(2));
                        const totalGst = (inv.cgst || inv.sgst || inv.igst) ? (inv.cgst || 0) + (inv.sgst || 0) + (inv.igst || 0) : Number((invoiceTotal - taxable).toFixed(2));
                        return totalGst.toLocaleString("en-IN");
                      })()}
                    </td>
                    <td className="p-4">
                      <div className="font-black text-lg text-gray-900">
                        ₹{inv.totalAmount.toLocaleString("en-IN")}
                      </div>
                    </td>`);

  // Badge onclick wrapper for Status Update
  const badgeRegex = /<Badge\s*className=\{`rounded-lg px-3 py-1 font-bold text-xs \$\{inv\.status === "Paid" \? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"\}`\}\s*>\s*\{inv\.status\}\s*<\/Badge>/g;
  content = content.replace(badgeRegex, `<div onClick={() => { setStatusModalInv(inv); setNewStatus(inv.status); }} className="cursor-pointer inline-block hover:opacity-80">
                      <Badge
                        className={\`rounded-lg px-3 py-1 font-bold text-xs \${inv.status === "Paid" || inv.status === "Approved for Payment" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}\`}
                      >
                        {inv.status || 'Invoice Submitted'}
                      </Badge>
                    </div>`);

  fs.writeFileSync(filePath, content);
}

patchVendorInvoices('e:\\Racoonn\\Vendor\\app\\vendor\\(dashboard)\\invoices\\page.tsx');
console.log('Vendor correctly patched');
