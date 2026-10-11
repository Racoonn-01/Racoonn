const fs = require('fs');
let code = fs.readFileSync('e:\\Racoonn\\Vendor\\app\\vendor\\(dashboard)\\invoices\\page.tsx', 'utf8');

// 1. Add Search, Calendar, X to Lucide imports
code = code.replace('Receipt', 'Receipt,\n  Search,\n  Calendar,\n  X');

// 2. Add search and date states
const statesBlock = `  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');
  const [exportError, setExportError] = useState('');`;
code = code.replace(/  const \[invoices, setInvoices\][\s\S]*?const \[timeFilter, setTimeFilter\] = useState\("Lifetime"\);/, statesBlock);

// 3. Add Export function
const exportCode = `  const handleExportData = () => {
    if (!exportStartDate || !exportEndDate) {
      setExportError('Please select both start and end dates');
      return;
    }
    const filtered = invoices.filter(inv => {
      if (!inv.issueDate) return false;
      const d = new Date(inv.issueDate);
      return d >= new Date(exportStartDate) && d <= new Date(exportEndDate);
    });
    if (filtered.length === 0) {
      setExportError('No invoices found in this date range');
      return;
    }
    const headers = ['Invoice No.', 'Hotel', 'Taxable amount', 'GST Amount', 'Net payable', 'Racoonn booking reference', 'Current status', 'Hotel Address', 'Hotel GSTIN'];
    const csvContent = [
      headers.join(','),
      ...filtered.map(inv => {
        const taxable = inv.taxableValue || 0;
        const totalGst = (inv.cgst || 0) + (inv.sgst || 0) + (inv.igst || 0);
        const net = inv.netPayable || 0;
        const hotelName = \`"\${inv.vendorBusiness || inv.vendorName || ''}"\`;
        const address = \`"\${inv.vendorAddress || ''}"\`;
        const gstin = \`"\${inv.vendorGstNumber || ''}"\`;
        const ref = inv.bookingIds && inv.bookingIds.length > 0 ? inv.bookingIds[0] : '';
        return [
          inv.invoiceNumber || inv.id,
          hotelName,
          taxable,
          totalGst,
          net,
          ref,
          inv.status || 'Paid',
          address,
          gstin
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

  const filteredInvoices = invoices.filter(inv => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (inv.invoiceNumber?.toLowerCase()?.includes(q) || inv.bookingIds?.[0]?.toLowerCase()?.includes(q));
  });`;
  
code = code.replace(/  return \(/, exportCode + '\n\n  return (');

const replacementUi = `      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Revenue & Invoices</h1>
          <p className="text-slate-500 mt-1 font-medium">Manage and export platform invoices.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input 
              type="text" 
              placeholder="Search by ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#E86A70]/20"
            />
          </div>
          <Button onClick={() => { setIsExportModalOpen(true); setExportError(''); }} variant="outline" className="h-10 px-4 rounded-xl border-slate-200 text-slate-700 font-semibold gap-2 whitespace-nowrap">
            <Download className="w-4 h-4" /> Export Data
          </Button>
        </div>
      </div>

      {/* Export Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-800">Export Invoices</h3>
              <button onClick={() => setIsExportModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-500">Select a date range to export invoices as CSV.</p>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Start Date</label>
                  <input type="date" value={exportStartDate} onChange={e => {setExportStartDate(e.target.value); setExportError('');}} className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:outline-none focus:border-[#E86A70]" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-1.5 block">End Date</label>
                  <input type="date" value={exportEndDate} onChange={e => {setExportEndDate(e.target.value); setExportError('');}} className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:outline-none focus:border-[#E86A70]" />
                </div>
                {exportError && <p className="text-sm font-medium text-rose-500 mt-2">{exportError}</p>}
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setIsExportModalOpen(false)} className="font-semibold text-slate-600">Cancel</Button>
              <Button onClick={handleExportData} className="bg-[#E86A70] hover:bg-[#D65A60] text-white font-semibold">Download CSV</Button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}`;

code = code.replace(/<div className="flex flex-col md:flex-row justify-between[\s\S]*?\{\/\* Table \*\/\}/, replacementUi);
code = code.replace(/invoices\.map/g, 'filteredInvoices.map');

// Replace table headers and body logic
const oldTableStart = `                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-6 py-4 font-bold text-slate-800">Invoice No.</th>
                    <th className="px-6 py-4 font-bold text-slate-800">Booking Ref.</th>
                    <th className="px-6 py-4 font-bold text-slate-800">Room Price</th>
                    <th className="px-6 py-4 font-bold text-slate-800">Addons</th>
                    <th className="px-6 py-4 font-bold text-slate-800">Discounts</th>
                    <th className="px-6 py-4 font-bold text-slate-800">GST</th>
                    <th className="px-6 py-4 font-bold text-slate-800">Total Amount</th>
                    <th className="px-6 py-4 font-bold text-slate-800">Status</th>
                    <th className="px-6 py-4 font-bold text-slate-800">Date</th>
                    <th className="px-6 py-4 font-bold text-slate-800 text-right">Receipt</th>
                  </tr>`;
const newTableStart = `                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-6 py-4 font-bold text-slate-800">Invoice No.</th>
                    <th className="px-6 py-4 font-bold text-slate-800">Hotel</th>
                    <th className="px-6 py-4 font-bold text-slate-800">Taxable amount</th>
                    <th className="px-6 py-4 font-bold text-slate-800">GST Amount</th>
                    <th className="px-6 py-4 font-bold text-slate-800">Net payable</th>
                    <th className="px-6 py-4 font-bold text-slate-800">Racoonn booking ref.</th>
                    <th className="px-6 py-4 font-bold text-slate-800">Current status</th>
                    <th className="px-6 py-4 font-bold text-slate-800 text-right">Receipt</th>
                  </tr>`;
code = code.replace(oldTableStart, newTableStart);

const oldMapBody = /\{\s*filteredInvoices\.map\(\(\s*inv\s*\)\s*=>\s*\{[\s\S]*?return\s*\([\s\S]*?<\/tr>\s*\);\s*\}\s*\)\s*\}/;
const newMapBody = `{filteredInvoices.map((inv) => {
                    const taxable = inv.taxableValue || 0;
                    const totalGst = (inv.cgst || 0) + (inv.sgst || 0) + (inv.igst || 0);
                    const net = inv.netPayable || 0;
                    const ref = inv.bookingIds && inv.bookingIds.length > 0 ? inv.bookingIds[0].substring(0,8) : "N/A";
                    const isCancelled = inv.status === 'Cancelled' || inv.status === 'Rejected';
                    
                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-600">{inv.invoiceNumber || inv.id}</td>
                        <td className="px-6 py-4 font-medium text-slate-600">{inv.vendorBusiness || inv.vendorName || "N/A"}</td>
                        <td className="px-6 py-4 font-bold text-slate-700">{formatCurrency(taxable)}</td>
                        <td className="px-6 py-4 font-bold text-slate-700">{formatCurrency(totalGst)}</td>
                        <td className={\`px-6 py-4 font-bold \${isCancelled ? 'text-slate-500' : 'text-emerald-500'}\`}>
                          {formatCurrency(net)}
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-mono">{ref}</td>
                        <td className="px-6 py-4">
                          <Badge className={\`rounded-full px-3 py-1 font-medium text-xs border-0 \${
                            isCancelled 
                              ? 'bg-slate-100 text-slate-600' 
                              : 'bg-emerald-100 text-emerald-600'
                          }\`}>
                            {inv.status || 'Paid'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDownloadPdf(inv)}
                            className="rounded-full border-rose-200 text-rose-500 hover:bg-rose-50 hover:text-rose-600 font-medium text-xs h-8 px-4"
                          >
                            <Download className="w-3.5 h-3.5 mr-1.5" /> Download Invoice
                          </Button>
                        </td>
                      </tr>
                    );
                  })}`;
code = code.replace(oldMapBody, newMapBody);

fs.writeFileSync('e:\\Racoonn\\Vendor\\app\\vendor\\(dashboard)\\invoices\\page.tsx', code);
console.log('done vendor')
