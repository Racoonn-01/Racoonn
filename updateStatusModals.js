const fs = require('fs');

function injectStatusUpdateModal(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');

  // Add state variables
  const stateRegex = /(const \[exportError, setExportError\] = useState\(''\);)/;
  const newStates = `$1
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
      } else {
        alert('Failed to update status');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };`;
  code = code.replace(stateRegex, newStates);

  // Add modal JSX just before {/* Table */}
  const tableRegex = /\{\/\* Table \*\/\}/;
  const modalJsx = `
      {/* Update Status Modal */}
      {statusModalInv && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
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
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:outline-none focus:border-[#E86A70] bg-white"
                >
                  <option value="">Select Status</option>
                  <option value="Invoice Submitted">Invoice Submitted</option>
                  <option value="Sent">Sent</option>
                  <option value="Paid">Paid</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setStatusModalInv(null)} className="font-semibold text-slate-600">Cancel</Button>
              <Button onClick={handleUpdateStatus} disabled={!newStatus || isUpdatingStatus} className="bg-[#E86A70] hover:bg-[#D65A60] text-white font-semibold">
                {isUpdatingStatus ? 'Updating...' : 'Confirm'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}`;
  code = code.replace(tableRegex, modalJsx);

  // Make Badge clickable
  const badgeRegex = /<Badge className=\{\`rounded-full px-3 py-1 font-medium text-xs border-0 \$\{([\s\S]*?)\}\`\}>\s*\{inv\.status \|\| 'Paid'\}\s*<\/Badge>/;
  const newBadge = `<div 
                            onClick={() => { setStatusModalInv(inv); setNewStatus(inv.status || 'Paid'); }}
                            className="cursor-pointer inline-block hover:opacity-80 transition-opacity"
                          >
                            <Badge className={\`rounded-full px-3 py-1 font-medium text-xs border-0 \${$1}\`}>
                              {inv.status || 'Paid'}
                            </Badge>
                          </div>`;
  code = code.replace(badgeRegex, newBadge);

  fs.writeFileSync(filePath, code);
}

injectStatusUpdateModal('e:\\Racoonn\\Admin\\src\\app\\admin\\invoices\\page.tsx');
injectStatusUpdateModal('e:\\Racoonn\\Vendor\\app\\vendor\\(dashboard)\\invoices\\page.tsx');
console.log('Done modifying files');
