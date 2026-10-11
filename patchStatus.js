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

function patchStatusFilter(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Add the statuses array at the top if not exists
  if (!content.includes('const STATUSES = [')) {
    content = content.replace('export interface LineItem', `const STATUSES = [
  'Invoice Submitted',
  'Under Review',
  'Reconciliation Pending',
  'Approved for Payment',
  'Payment Initiated',
  'Paid',
  'Closed'
];

export interface LineItem`);
  }

  // Update Status Filter UI
  const filterHtmlRegex = /<option value="All">All Statuses<\/option>\s*<option value="Pending">Pending<\/option>\s*<option value="Paid">Paid<\/option>\s*<option value="Overdue">Overdue<\/option>\s*<option value="Cancelled">Cancelled<\/option>/;
  if (filterHtmlRegex.test(content)) {
    content = content.replace(filterHtmlRegex, `<option value="All">All Statuses</option>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}`);
  } else {
      // In Vendor UI, it might be different:
      const vendorFilterHtmlRegex = /<option value="All">All Statuses<\/option>\s*<option value="Draft">Draft<\/option>\s*<option value="Sent">Sent<\/option>\s*<option value="Paid">Paid<\/option>\s*<option value="Overdue">Overdue<\/option>\s*<option value="Cancelled">Cancelled<\/option>\s*<option value="Rejected">Rejected<\/option>/;
      if (vendorFilterHtmlRegex.test(content)) {
          content = content.replace(vendorFilterHtmlRegex, `<option value="All">All Statuses</option>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}`);
      }
  }

  // Add state for Status Update Modal
  if (!content.includes('const [statusModalInv, setStatusModalInv]')) {
      content = content.replace('// Search & Filter state', `// Status Update Modal State
  const [statusModalInv, setStatusModalInv] = useState<any>(null);
  const [newStatus, setNewStatus] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const handleUpdateStatus = async () => {
    if (!statusModalInv || !newStatus) return;
    setIsUpdatingStatus(true);
    try {
      const res = await fetch('/api/invoices', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: statusModalInv.id, status: newStatus })
      });
      if (res.ok) {
        setInvoices(prev => prev.map(inv => inv.id === statusModalInv.id ? { ...inv, status: newStatus } : inv));
        setStatusModalInv(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Search & Filter state`);
  }

  // Make the Badge clickable to update status
  const badgeRegex = /<Badge\s*variant=\{inv\.status === "Paid" \? "default" : "secondary"\}\s*className=\{inv\.status === "Paid" \? "bg-emerald-500\/10 text-emerald-600 border-emerald-500\/20" : "bg-amber-500\/10 text-amber-600 border-amber-500\/20"\}\s*>\s*\{inv\.status\}\s*<\/Badge>/g;
  
  content = content.replace(badgeRegex, `<div onClick={() => { setStatusModalInv(inv); setNewStatus(inv.status); }} className="cursor-pointer inline-block hover:opacity-80"><Badge variant={inv.status === "Paid" || inv.status === "Approved for Payment" ? "default" : "secondary"} className={inv.status === "Paid" || inv.status === "Approved for Payment" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"}>{inv.status || 'Invoice Submitted'}</Badge></div>`);

  // Add Status Update Modal to JSX
  if (!content.includes('Update Status Modal')) {
      const modalJSX = `      {/* Update Status Modal */}
      {statusModalInv && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
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
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
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

  fs.writeFileSync(filePath, content);
}

patchStatusFilter('e:\\Racoonn\\Admin\\src\\app\\admin\\invoices\\page.tsx');
patchStatusFilter('e:\\Racoonn\\Vendor\\app\\vendor\\(dashboard)\\invoices\\page.tsx');
console.log('Status patched');
