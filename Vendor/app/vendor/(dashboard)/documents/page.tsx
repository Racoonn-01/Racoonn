"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, FileText, UploadCloud, Eye, RefreshCw, AlertCircle, Clock, ZoomIn, ZoomOut, RotateCw, Download } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function DocumentsPage() {
  const documents = [
    {
      title: "Business License / GST",
      description: "Company registration and tax identification documents.",
      status: "Missing",
      fileName: null,
      updatedAt: null
    },
    {
      title: "Owner KYC Documents",
      description: "Aadhar/PAN card of the registered business owner.",
      status: "Missing",
      fileName: null,
      updatedAt: null
    },
    {
      title: "Bank Documents",
      description: "Cancelled cheque or bank statement for payout verification.",
      status: "Missing",
      fileName: null,
      updatedAt: null
    },
    {
      title: "Property Verification",
      description: "Utility bills or lease agreement proving property address.",
      status: "Missing",
      fileName: null,
      updatedAt: null
    },
    {
      title: "Food Safety License (FSSAI)",
      description: "Required if your property serves food to guests.",
      status: "Missing",
      fileName: null,
      updatedAt: null
    }
  ];

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "Verified":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide bg-emerald-100 text-emerald-700"><ShieldCheck className="w-3 h-3" /> Verified</span>;
      case "Pending":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide bg-amber-100 text-amber-700"><Clock className="w-3 h-3" /> In Review</span>;
      case "Missing":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide bg-red-100 text-red-700"><AlertCircle className="w-3 h-3" /> Action Needed</span>;
      default:
        return null;
    }
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h2 className="text-3xl font-heading font-bold text-secondary">Documents & Compliance</h2>
        <p className="text-slate-500 mt-1">Manage your business and property verification documents securely.</p>
      </motion.div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="border-0 shadow-sm ring-1 ring-slate-100 rounded-2xl overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4 pt-6 px-6">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="font-heading text-xl">Required Documents</CardTitle>
                <CardDescription className="text-slate-500">Keep your documents up to date to avoid payout delays.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {documents.map((doc, idx) => (
                <div key={idx} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50/50 transition-colors">
                  <div className="flex gap-4 items-start md:items-center">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      doc.status === 'Verified' ? 'bg-emerald-50 text-emerald-600' :
                      doc.status === 'Pending' ? 'bg-amber-50 text-amber-600' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                        <h3 className="font-bold text-secondary text-base">{doc.title}</h3>
                        {getStatusBadge(doc.status)}
                      </div>
                      <p className="text-sm text-slate-500">{doc.description}</p>
                      
                      {doc.fileName && (
                        <div className="flex items-center gap-2 mt-3">
                          <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 shadow-sm flex items-center gap-2">
                            <span className="truncate max-w-50">{doc.fileName}</span>
                          </div>
                          <span className="text-xs text-slate-400">Updated {doc.updatedAt}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 shrink-0">
                    {doc.fileName ? (
                      <>
                        <Dialog>
                          <DialogTrigger render={<Button variant="outline" size="sm" className="h-9 font-medium text-slate-600 hover:text-primary" />}>
                            <Eye className="w-4 h-4 mr-2" /> View
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-2xl p-0 overflow-hidden border-slate-100 bg-white rounded-2xl shadow-xl">
                            <DialogHeader className="p-6 border-b border-slate-100 bg-slate-50/50">
                              <div className="flex justify-between items-start">
                                <div>
                                  <DialogTitle className="text-xl font-heading font-bold text-secondary">{doc.title}</DialogTitle>
                                  <p className="text-sm text-slate-500 font-medium mt-1">{doc.fileName}</p>
                                </div>
                              </div>
                            </DialogHeader>
                            <div className="bg-slate-50 relative overflow-hidden h-112.5">
                              <div className="absolute top-4 right-4 flex gap-1 bg-white/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-100 shadow-sm z-10">
                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-slate-100"><ZoomIn className="h-4 w-4 text-slate-600"/></Button>
                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-slate-100"><ZoomOut className="h-4 w-4 text-slate-600"/></Button>
                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-slate-100"><RotateCw className="h-4 w-4 text-slate-600"/></Button>
                                <div className="w-px h-5 bg-slate-200 mx-1 self-center"></div>
                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-slate-100"><Download className="h-4 w-4 text-slate-600"/></Button>
                              </div>
                              <div className="h-full w-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                                <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center mb-6 shadow-sm border border-slate-100">
                                  <FileText className="h-10 w-10 text-slate-300" />
                                </div>
                                <h3 className="text-base font-semibold text-secondary mb-1">Document Preview</h3>
                                <p className="text-sm">In a real environment, the secure PDF or image would render here.</p>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button variant="outline" size="sm" className="h-9 font-medium text-slate-600 hover:text-primary">
                          <RefreshCw className="w-4 h-4 mr-2" /> Replace
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" className="h-9 bg-primary hover:bg-primary/90 text-white font-medium shadow-sm">
                        <UploadCloud className="w-4 h-4 mr-2" /> Upload
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
