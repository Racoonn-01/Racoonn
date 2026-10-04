"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, Download, Copy, AlertCircle, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

export default function DevelopersPage() {
  const { profile } = useAuthStore();
  
  // API Key State
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);
  const [generatedApiKey, setGeneratedApiKey] = useState("");
  const [generatedSecretKey, setGeneratedSecretKey] = useState("");
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);

  const handleGenerateApiKey = async () => {
    if (!profile) return;
    setIsGeneratingKey(true);
    try {
      const res = await fetch("/api/vendor/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId: profile.$id,
          businessName: profile.bizType === "company" ? profile.businessName : `${profile.firstName} ${profile.lastName}`.trim()
        })
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to generate API key");
      }
      
      setGeneratedApiKey(json.apiKey);
      setGeneratedSecretKey(json.apiSecret);
      setIsApiKeyDialogOpen(true);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to generate API key.");
    } finally {
      setIsGeneratingKey(false);
    }
  };

  const handleDownloadKeys = () => {
    const csvContent = `Type,Key\nAPI Key,${generatedApiKey}\nSecret Key,${generatedSecretKey}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'racoonn_api_keys.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Keys downloaded successfully!");
  };

  return (
    <div className="space-y-8 pb-12 w-full max-w-5xl mx-auto">
      <div>
        <h2 className="text-3xl font-black tracking-tight text-slate-900">Developers</h2>
        <p className="text-slate-500 mt-2 text-base">Manage your API keys and developer settings.</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden bg-white">
          <CardContent className="p-8 space-y-6">
            <div>
              <h3 className="text-base font-semibold text-slate-800 mb-2">Partner API Access</h3>
              <p className="text-sm text-slate-500 mb-6">Generate an API key to integrate with the Racoonn Partner API. Keep your key secure and never share it publicly.</p>
              
              <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 w-full">
                  <div className="w-10 h-10 rounded-full bg-slate-200/50 flex items-center justify-center shrink-0">
                    <KeyRound className="w-5 h-5 text-slate-600" />
                  </div>
                  <div className="w-full">
                    <p className="text-sm font-medium text-slate-800">Production API Key</p>
                    <p className="text-xs text-slate-500 font-mono mt-0.5 tracking-widest">••••••••••••••••••••••••••••••••</p>
                  </div>
                </div>
                <Button onClick={handleGenerateApiKey} disabled={isGeneratingKey} variant="outline" className="h-10 px-5 rounded-xl border-slate-200 hover:bg-slate-100 hover:text-slate-900 text-slate-700 font-medium shadow-sm transition-all whitespace-nowrap shrink-0">
                  {isGeneratingKey ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Generate New Key
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={isApiKeyDialogOpen} onOpenChange={setIsApiKeyDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">New API Keys Generated</DialogTitle>
            <DialogDescription className="text-amber-700 bg-amber-50 p-4 rounded-xl border border-amber-200 mt-4 flex gap-3 items-start text-sm font-medium shadow-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
              <span className="leading-relaxed">Please save this secret key somewhere safe and accessible. For security reasons, <strong>you won't be able to view it again</strong> through your Racoonn account. If you lose this secret key, you'll need to generate a new one.</span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label className="text-slate-700 font-semibold text-sm">API Key (Public)</Label>
              <div className="flex items-center gap-2">
                <Input readOnly value={generatedApiKey} className="font-mono text-sm bg-slate-50 border-slate-200 h-11 shadow-inner focus-visible:ring-0 cursor-copy" onClick={(e) => (e.target as HTMLInputElement).select()} />
                <Button variant="outline" size="icon" className="h-11 w-11 shrink-0 bg-white hover:bg-slate-50" onClick={() => { navigator.clipboard.writeText(generatedApiKey); toast.success("API Key copied!"); }}><Copy className="w-4 h-4 text-slate-500" /></Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-slate-700 font-semibold text-sm">Secret Key</Label>
              <div className="flex items-center gap-2">
                <Input readOnly value={generatedSecretKey} className="font-mono text-sm bg-slate-50 border-slate-200 h-11 shadow-inner focus-visible:ring-0 cursor-copy" onClick={(e) => (e.target as HTMLInputElement).select()} />
                <Button variant="outline" size="icon" className="h-11 w-11 shrink-0 bg-white hover:bg-slate-50" onClick={() => { navigator.clipboard.writeText(generatedSecretKey); toast.success("Secret Key copied!"); }}><Copy className="w-4 h-4 text-slate-500" /></Button>
              </div>
            </div>

            <Button onClick={handleDownloadKeys} className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium shadow-md">
              <Download className="w-4 h-4 mr-2" />
              Download as .csv
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
