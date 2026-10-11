const fs = require('fs');
let code = fs.readFileSync('e:\\Racoonn\\Admin\\src\\app\\admin\\invoices\\page.tsx', 'utf8');

code = code.replace('Receipt', 'Receipt, Search, Calendar, X');

const statesBlock = `  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');`;
code = code.replace(/  const \[invoices, setInvoices\][\s\S]*?const \[timeFilter, setTimeFilter\] = useState\("Lifetime"\);/, statesBlock);

const exportCode = `  const handleExportData = () => {
    if (!exportStartDate || !exportEndDate) {
      alert('Please select both start and end dates');
      return;
    }
    const filtered = invoices.filter(inv => {
      if (!inv.issueDate) return false;
      const d = new Date(inv.issueDate);
      return d >= new Date(exportStartDate) && d <= new Date(exportEndDate);
    });
    if (filtered.length === 0) {
      alert('No invoices found in this date range');
      return;
    }
    const headers = ['Invoice Number', 'Date', 'Vendor', 'Taxable', 'CGST', 'SGST', 'IGST', 'Platform Fee', 'Net Payable', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filtered.map(inv => {
        const taxable = inv.taxableValue || 0;
        const cgst = inv.cgst || 0;
        const sgst = inv.sgst || 0;
        const igst = inv.igst || 0;
        const fee = inv.otaCommission || inv.platformFeeAmount || 0;
        const net = inv.netPayable || 0;
        return [\`\${inv.invoiceNumber || inv.id}\`, \`\${new Date(inv.issueDate).toLocaleDateString()}\`, \`\${inv.vendorName || ''}\`, taxable, cgst, sgst, igst, fee, net, inv.status].join(',');
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
    return (inv.invoiceNumber?.toLowerCase()?.includes(q) || inv.vendorName?.toLowerCase()?.includes(q));
  });`;
  
code = code.replace('  const totalRevenue =', exportCode + '\n\n  const oldtotalRevenue =');

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
              placeholder="Search by ID or Vendor..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#E86A70]/20"
            />
          </div>
          <Button onClick={() => setIsExportModalOpen(true)} variant="outline" className="h-10 px-4 rounded-xl border-slate-200 text-slate-700 font-semibold gap-2 whitespace-nowrap">
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
                  <input type="date" value={exportStartDate} onChange={e => setExportStartDate(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:outline-none focus:border-[#E86A70]" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-1.5 block">End Date</label>
                  <input type="date" value={exportEndDate} onChange={e => setExportEndDate(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:outline-none focus:border-[#E86A70]" />
                </div>
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

fs.writeFileSync('e:\\Racoonn\\Admin\\src\\app\\admin\\invoices\\page.tsx', code);
console.log("Successfully rewrote the file");
