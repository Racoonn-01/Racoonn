const fs = require('fs');

function restyleInvoicePage(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Add Shadcn Table imports if missing
  if (!content.includes('import { Table')) {
    const importRegex = /import \{ Button \} from "@\/components\/ui\/button";/;
    content = content.replace(importRegex, `import { Button } from "@/components/ui/button";\nimport { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";\nimport { Loader2 } from "lucide-react";`);
  }

  // Replace old table structure with Shadcn table structure matching Revenue Overview
  const oldTableRegex = /<div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">[\s\S]*?<\/div>\s*<\/div>\s*\)\s*;\s*\}/;
  
  const newTableUi = `<Card className="rounded-3xl border border-gray-200 shadow-sm bg-white overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="border-b border-gray-100 hover:bg-transparent">
                  <TableHead className="font-semibold h-12">Invoice No.</TableHead>
                  <TableHead className="font-semibold h-12">Hotel</TableHead>
                  <TableHead className="font-semibold h-12">Taxable amount</TableHead>
                  <TableHead className="font-semibold h-12">GST Amount</TableHead>
                  <TableHead className="font-semibold h-12">Net payable</TableHead>
                  <TableHead className="font-semibold h-12">Booking Ref</TableHead>
                  <TableHead className="font-semibold h-12">Current status</TableHead>
                  <TableHead className="text-right font-semibold h-12">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((inv) => {
                  const invoiceTotal = inv.invoiceTotal || inv.totalAmount || 0;
                  const nights = inv.nights || 1;
                  const pricePerNight = invoiceTotal / nights;
                  const gstRate = pricePerNight <= 7500 ? 0.05 : 0.18;
                  const gstMultiplier = 1 + gstRate;
                  
                  const taxable = inv.taxableValue || Number((invoiceTotal / gstMultiplier).toFixed(2));
                  const totalGst = (inv.cgst || inv.sgst || inv.igst) ? (inv.cgst || 0) + (inv.sgst || 0) + (inv.igst || 0) : Number((invoiceTotal - taxable).toFixed(2));
                  const platformFee = inv.otaCommission || inv.platformFeeAmount || 0;
                  const net = inv.netPayable || (invoiceTotal - platformFee);
                  
                  const ref = inv.bookingIds && inv.bookingIds.length > 0 ? inv.bookingIds[0].substring(0,8) : "N/A";
                  const isCancelled = inv.status === 'Cancelled' || inv.status === 'Rejected';
                  
                  return (
                    <TableRow key={inv.id} className="hover:bg-muted/30 transition-colors group">
                      <TableCell className="font-medium font-mono text-xs text-foreground">
                        {inv.invoiceNumber || inv.id.slice(0, 8)}
                      </TableCell>
                      <TableCell className="font-medium text-muted-foreground">
                        {inv.vendorBusiness || inv.vendorName || "N/A"}
                      </TableCell>
                      <TableCell className="font-medium text-slate-700">
                        {formatCurrency(taxable)}
                      </TableCell>
                      <TableCell className="font-medium text-slate-700">
                        {formatCurrency(totalGst)}
                      </TableCell>
                      <TableCell className={\`font-medium \${isCancelled ? 'text-slate-500' : 'text-emerald-600'}\`}>
                        {formatCurrency(net)}
                      </TableCell>
                      <TableCell className="font-medium font-mono text-xs text-muted-foreground">
                        {ref}
                      </TableCell>
                      <TableCell>
                        <div 
                          onClick={() => { setStatusModalInv(inv); setNewStatus(inv.status || 'Invoice Submitted'); }}
                          className="cursor-pointer inline-block hover:opacity-80 transition-opacity"
                        >
                          <Badge 
                            variant={inv.status === "Paid" ? "default" : "secondary"}
                            className={inv.status === "Paid" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : inv.status === "Cancelled" || inv.status === "Rejected" ? "bg-rose-500/10 text-rose-600 border-rose-500/20" : "bg-blue-500/10 text-blue-600 border-blue-500/20"}
                          >
                            {inv.status || 'Invoice Submitted'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          onClick={() => handleDownloadPdf(inv)}
                          variant="outline" 
                          size="sm"
                          className="h-8 rounded-full px-4 text-xs font-semibold bg-[#E86A70]/10 text-[#E86A70] hover:bg-[#E86A70]/20 border-transparent shadow-none"
                        >
                          <Download className="w-3.5 h-3.5 mr-1.5" />
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}`;

  content = content.replace(oldTableRegex, newTableUi);
  fs.writeFileSync(filePath, content);
}

restyleInvoicePage('e:\\Racoonn\\Admin\\src\\app\\admin\\invoices\\page.tsx');
restyleInvoicePage('e:\\Racoonn\\Vendor\\app\\vendor\\(dashboard)\\invoices\\page.tsx');
console.log('Restyled');
