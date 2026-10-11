const fs = require('fs');

const statuses = [
  'Invoice Submitted',
  'Under Review',
  'Reconciliation Pending',
  'Approved for Payment',
  'Payment Initiated',
  'Paid',
  'Closed'
];

function updateInvoicesPage(filePath, isVendor) {
  let code = fs.readFileSync(filePath, 'utf8');

  // 1. Add Filter icon to lucide react imports
  if (!code.includes('Filter')) {
    code = code.replace(/Receipt,/, 'Receipt,\n  Filter,');
  }

  // 2. Add status filter state
  const stateRegex = /(const \[isUpdatingStatus, setIsUpdatingStatus\] = useState\(false\);)/;
  const newStates = `$1\n  const [statusFilter, setStatusFilter] = useState('All');`;
  code = code.replace(stateRegex, newStates);

  // 3. Update the filter dropdown UI next to the search bar
  const searchContainerRegex = /<div className="relative w-full md:w-64">[\s\S]*?<\/div>/;
  const newSearchContainer = `<div className="flex items-center gap-3 w-full md:w-auto">
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
          <div className="relative hidden md:block">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 pl-9 pr-8 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#E86A70]/20 appearance-none font-medium text-slate-700"
            >
              <option value="All">All Statuses</option>
              ${statuses.map(s => `<option value="${s}">${s}</option>`).join('\n              ')}
            </select>
          </div>
        </div>`;
  // The original has <div className="relative w-full md:w-64"> inside <div className="flex items-center gap-3 w-full md:w-auto">
  // Let's replace the whole search bar and export button container
  const searchExportRegex = /<div className="flex items-center gap-3 w-full md:w-auto">[\s\S]*?<Button onClick=\{\(\) => \{ setIsExportModalOpen\(true\); setExportError\(''\); \}\} variant="outline" className="h-10 px-4 rounded-xl border-slate-200 text-slate-700 font-semibold gap-2 whitespace-nowrap">[\s\S]*?<Download className="w-4 h-4" \/> Export Data[\s\S]*?<\/Button>[\s\S]*?<\/div>/;
  const newSearchExport = `<div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-3">
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
            <div className="relative w-full md:w-auto">
              <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-3 z-10" />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full md:w-auto h-10 pl-9 pr-8 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#E86A70]/20 appearance-none font-medium text-slate-700 relative z-0"
              >
                <option value="All">All Statuses</option>
                ${statuses.map(s => `<option value="${s}">${s}</option>`).join('\n                ')}
              </select>
            </div>
          </div>
          <Button onClick={() => { setIsExportModalOpen(true); setExportError(''); }} variant="outline" className="h-10 px-4 rounded-xl border-slate-200 text-slate-700 font-semibold gap-2 whitespace-nowrap">
            <Download className="w-4 h-4" /> Export Data
          </Button>
        </div>`;
  code = code.replace(searchExportRegex, newSearchExport);

  // 4. Update the select options inside the modal
  const modalSelectRegex = /<select[\s\S]*?onChange=\{e => setNewStatus\(e\.target\.value\)\}[\s\S]*?>[\s\S]*?<\/select>/;
  const newModalSelect = `<select 
                  value={newStatus} 
                  onChange={e => setNewStatus(e.target.value)} 
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:outline-none focus:border-[#E86A70] bg-white"
                >
                  <option value="">Select Status</option>
                  ${statuses.map(s => `<option value="${s}">${s}</option>`).join('\n                  ')}
                </select>`;
  code = code.replace(modalSelectRegex, newModalSelect);

  // 5. Update the filteredInvoices logic to include statusFilter
  const filterLogicRegex = /const filteredInvoices = invoices\.filter\(inv => \{[\s\S]*?\}\);/;
  const newFilterLogic = `const filteredInvoices = invoices.filter(inv => {
    if (statusFilter !== 'All' && (inv.status || 'Invoice Submitted') !== statusFilter) {
      return false;
    }
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (inv.invoiceNumber?.toLowerCase()?.includes(q) || inv.bookingIds?.[0]?.toLowerCase()?.includes(q) || inv.vendorName?.toLowerCase()?.includes(q));
  });`;
  code = code.replace(filterLogicRegex, newFilterLogic);

  fs.writeFileSync(filePath, code);
}

updateInvoicesPage('e:\\Racoonn\\Admin\\src\\app\\admin\\invoices\\page.tsx', false);
updateInvoicesPage('e:\\Racoonn\\Vendor\\app\\vendor\\(dashboard)\\invoices\\page.tsx', true);
console.log('done updating statuses');
