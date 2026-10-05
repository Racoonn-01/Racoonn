"use client"

import { useEffect, useState } from "react"
import { Loader2, Eye, X } from "lucide-react"

type Lead = {
  id: string;
  packageId: string;
  packageTitle: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  status?: string;
  createdAt: string;
}

export default function CustomPackageLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  useEffect(() => {
    fetchLeads()
  }, [])

  const fetchLeads = async () => {
    try {
      const res = await fetch("/api/custom-package-leads")
      const data = await res.json()
      if (data.success) {
        setLeads(data.leads)
      }
    } catch (err) {
      console.error("Error fetching leads:", err)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      setUpdatingId(id)
      const res = await fetch("/api/custom-package-leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus })
      })
      const data = await res.json()
      if (data.success) {
        setLeads(prev => prev.map(lead => lead.id === id ? { ...lead, status: newStatus } : lead))
      } else {
        alert("Failed to update status")
      }
    } catch (err) {
      console.error("Error updating status:", err)
      alert("Error updating status")
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      <div className="flex items-center justify-between border-b pb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#1F2E4A]">Custom Package Leads</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Leads collected from the Request a Custom Quote popup on packages.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {leads.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No leads received yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-600">
                <tr>
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold">Customer</th>
                  <th className="p-4 font-semibold">Contact</th>
                  <th className="p-4 font-semibold">Package</th>
                  <th className="p-4 font-semibold">Requirements</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 whitespace-nowrap text-slate-500">
                      {new Date(lead.createdAt).toLocaleDateString()}<br/>
                      <span className="text-xs">{new Date(lead.createdAt).toLocaleTimeString()}</span>
                    </td>
                    <td className="p-4 font-medium text-slate-900">
                      {lead.name}
                    </td>
                    <td className="p-4">
                      <div className="text-slate-900">{lead.phone}</div>
                      <div className="text-slate-500 text-xs">{lead.email}</div>
                    </td>
                    <td className="p-4 text-slate-700">
                      {lead.packageTitle}
                    </td>
                    <td className="p-4 text-slate-700 max-w-xs truncate" title={lead.message}>
                      {lead.message || <span className="text-slate-400 italic">None</span>}
                    </td>
                    <td className="p-4">
                      <select 
                        value={lead.status || 'New Lead'} 
                        onChange={(e) => updateStatus(lead.id, e.target.value)}
                        disabled={updatingId === lead.id}
                        className="p-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-brand-navy"
                      >
                        <option value="New Lead">New Lead</option>
                        <option value="Pending">Pending</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Follow-up">Follow-up</option>
                        <option value="Lost">Lost</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => setSelectedLead(lead)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#1F2E4A] bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                      >
                        <Eye size={16} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Lead Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-[#1F2E4A]">Lead Details</h3>
              <button 
                onClick={() => setSelectedLead(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Customer Name</div>
                  <div className="font-medium text-slate-900">{selectedLead.name}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Date Submitted</div>
                  <div className="font-medium text-slate-900">
                    {new Date(selectedLead.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Phone Number</div>
                  <div className="font-medium text-slate-900">{selectedLead.phone}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Email Address</div>
                  <div className="font-medium text-slate-900">{selectedLead.email}</div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Package Interested In</div>
                <div className="font-bold text-[#1F2E4A]">{selectedLead.packageTitle}</div>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Custom Requirements</div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 whitespace-pre-wrap min-h-[100px]">
                  {selectedLead.message || <span className="italic text-slate-400">No additional requirements specified.</span>}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button 
                onClick={() => setSelectedLead(null)}
                className="px-6 py-2.5 bg-[#1F2E4A] text-white font-medium rounded-lg hover:bg-[#2a3c5e] transition-colors shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
