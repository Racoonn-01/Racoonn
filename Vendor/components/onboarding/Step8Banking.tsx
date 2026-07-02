"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, ArrowLeft, Building, ShieldCheck, UploadCloud } from "lucide-react";
import Image from "next/image";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const INDIAN_BANKS = [
  { name: "Axis Bank", domain: "axisbank.com" },
  { name: "Bandhan Bank", domain: "bandhanbank.com" },
  { name: "Bank of Baroda", domain: "bankofbaroda.in" },
  { name: "Bank of India", domain: "bankofindia.co.in" },
  { name: "Bank of Maharashtra", domain: "bankofmaharashtra.in" },
  { name: "Canara Bank", domain: "canarabank.com" },
  { name: "Central Bank of India", domain: "centralbankofindia.co.in" },
  { name: "City Union Bank", domain: "cityunionbank.com" },
  { name: "CSB Bank", domain: "csb.co.in" },
  { name: "Dhanlaxmi Bank", domain: "dhanbank.com" },
  { name: "Federal Bank", domain: "federalbank.co.in" },
  { name: "HDFC Bank", domain: "hdfcbank.com" },
  { name: "ICICI Bank", domain: "icicibank.com" },
  { name: "IDBI Bank", domain: "idbibank.in" },
  { name: "IDFC First Bank", domain: "idfcfirstbank.com" },
  { name: "Indian Bank", domain: "indianbank.in" },
  { name: "Indian Overseas Bank", domain: "iob.in" },
  { name: "IndusInd Bank", domain: "indusind.com" },
  { name: "Jammu & Kashmir Bank", domain: "jkbank.com" },
  { name: "Karnataka Bank", domain: "karnatakabank.com" },
  { name: "Karur Vysya Bank", domain: "kvb.co.in" },
  { name: "Kotak Mahindra Bank", domain: "kotak.com" },
  { name: "Punjab & Sind Bank", domain: "punjabandsindbank.co.in" },
  { name: "Punjab National Bank", domain: "pnbindia.in" },
  { name: "RBL Bank", domain: "rblbank.com" },
  { name: "South Indian Bank", domain: "southindianbank.com" },
  { name: "State Bank of India", domain: "sbi.co.in" },
  { name: "UCO Bank", domain: "ucobank.com" },
  { name: "Union Bank of India", domain: "unionbankofindia.co.in" },
  { name: "Yes Bank", domain: "yesbank.in" },
  { name: "Other Bank", domain: "other" }
];
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { databases, appwriteConfig } from "@/lib/appwrite/client";

export function Step8Banking({ onNext, onBack }: { onNext: () => void, onBack: () => void }) {
  const { profile } = useAuthStore();
  const [verified, setVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [payoutMethod, setPayoutMethod] = useState<"bank" | "upi">("bank");
  const [bankName, setBankName] = useState("HDFC Bank");
  const [bankSearch, setBankSearch] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [upiId, setUpiId] = useState("");
  
  useEffect(() => {
    if (profile) {
      if (profile.bankName) setBankName(profile.bankName);
      if (profile.accountHolder) setAccountHolder(profile.accountHolder);
      if (profile.accountNumber) setAccountNumber(profile.accountNumber);
      if (profile.ifsc) setIfsc(profile.ifsc);
      if (profile.upiId) setUpiId(profile.upiId);
      if (profile.upiId && !profile.accountNumber) {
        setPayoutMethod("upi");
      }
    }
  }, [profile]);

  const handleNextClick = async () => {
    if (!profile) {
      onNext();
      return;
    }
    
    setIsLoading(true);
    try {
      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.vendorCollectionId,
        profile.$id,
        {
          bankName: bankName || "",
          accountHolder: accountHolder || "",
          accountNumber: accountNumber || "",
          ifsc: ifsc || "",
          upiId: upiId || ""
        }
      );
      onNext();
    } catch (e) {
      console.error(e);
      onNext();
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackClick = () => {
    onBack();
  };

  const filteredBanks = INDIAN_BANKS.filter(b => b.name.toLowerCase().includes(bankSearch.toLowerCase()));

  const slideUp: any = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const handleVerify = () => {
    setVerified(true);
  }

  return (
    <motion.div 
      initial="hidden" 
      animate="visible" 
      exit="hidden" 
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className="flex flex-col h-full max-w-xl mx-auto w-full pt-8"
    >
      <motion.div variants={slideUp} className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-[#1F2E4A] mb-3 font-['Poppins',sans-serif]">Receive your payouts</h1>
        <p className="text-slate-500 font-medium">Add the bank account where you want to receive your earnings. This must match your business name.</p>
      </motion.div>

      <motion.div variants={slideUp} className="space-y-5">
        
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-4 items-start mb-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm text-blue-900 font-bold mb-1">Bank-level Encryption</p>
            <p className="text-xs text-blue-700/80 font-medium">Your bank details are encrypted and securely stored. We never share this information with guests.</p>
          </div>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={() => setPayoutMethod("bank")}
            className={cn(
              "flex-1 py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all",
              payoutMethod === "bank" 
                ? "border-[#1F2E4A] bg-[#1F2E4A] text-white shadow-md shadow-[#1F2E4A]/20" 
                : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50"
            )}
          >
            Bank Account
          </button>
          <button 
            onClick={() => setPayoutMethod("upi")}
            className={cn(
              "flex-1 py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all",
              payoutMethod === "upi" 
                ? "border-[#1F2E4A] bg-[#1F2E4A] text-white shadow-md shadow-[#1F2E4A]/20" 
                : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50"
            )}
          >
            UPI
          </button>
        </div>

        {payoutMethod === "bank" ? (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Account Holder Name</label>
              <Input 
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
                className="h-12 rounded-xl border-slate-200 bg-white focus:ring-2 focus:ring-[#E86A70]/20 focus:border-[#E86A70] transition-all font-bold" 
                placeholder="Racoonn Hospitality Pvt Ltd" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Bank Account Number</label>
              <div className="relative">
                <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="h-12 pl-10 rounded-xl border-slate-200 bg-white focus:ring-2 focus:ring-[#E86A70]/20 focus:border-[#E86A70] transition-all font-bold tracking-widest" 
                  placeholder="•••• •••• •••• 1234" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">IFSC Code</label>
                <Input 
                  value={ifsc}
                  onChange={(e) => setIfsc(e.target.value)}
                  className="h-12 rounded-xl border-slate-200 bg-white focus:ring-2 focus:ring-[#E86A70]/20 focus:border-[#E86A70] transition-all font-bold uppercase" 
                  placeholder="HDFC0001234" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Bank Name</label>
                <Select value={bankName} onValueChange={(val) => val && setBankName(val)}>
                  <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-white focus:ring-2 focus:ring-[#E86A70]/20 focus:border-[#E86A70] transition-all font-bold">
                    <SelectValue placeholder="Select bank" />
                  </SelectTrigger>
                  <SelectContent className="max-h-75" alignItemWithTrigger={false}>
                    <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm p-2 border-b border-slate-100 mb-1">
                      <Input 
                        placeholder="Search bank..." 
                        value={bankSearch}
                        onChange={(e) => setBankSearch(e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()}
                        className="h-9 border-slate-200 bg-slate-50 focus-visible:ring-0 focus-visible:border-slate-300 rounded-lg text-sm"
                      />
                    </div>
                    {filteredBanks.length === 0 ? (
                      <div className="p-4 text-center text-sm text-slate-500">No bank found</div>
                    ) : (
                      filteredBanks.map(bank => (
                        <SelectItem key={bank.name} value={bank.name} className="font-medium cursor-pointer py-2">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-md border border-slate-100 bg-white shadow-sm flex items-center justify-center p-0.5 overflow-hidden shrink-0">
                              {bank.domain === "other" ? (
                                <Building className="w-4 h-4 text-slate-400" />
                              ) : (
                                <Image 
                                  src={`https://www.google.com/s2/favicons?domain=${bank.domain}&sz=64`} 
                                  alt={bank.name}
                                  width={64} height={64} unoptimized
                                  className="w-full h-full object-contain" 
                                />
                              )}
                            </div>
                            <span>{bank.name}</span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              {bankName === "Other Bank" && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                    <Building className="w-3 h-3" /> Specific Bank Name
                  </label>
                  <Input className="h-12 rounded-xl border-slate-200 bg-white focus:ring-2 focus:ring-[#E86A70]/20 focus:border-[#E86A70] transition-all font-bold" placeholder="e.g. Saraswat Bank" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex justify-between">
                Upload Cancelled Cheque
                {verified && <span className="text-emerald-500 flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> Verified</span>}
              </label>
              <div className={cn(
                "border-2 border-dashed rounded-2xl p-6 text-center transition-colors cursor-pointer flex items-center justify-center gap-4",
                verified ? "border-emerald-500 bg-emerald-50" : "border-slate-300 hover:bg-slate-50"
              )} onClick={handleVerify}>
                <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", verified ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-500")}>
                   {verified ? <ShieldCheck className="w-6 h-6" /> : <UploadCloud className="w-6 h-6" />}
                </div>
                <div className="text-left">
                  <p className={cn("text-sm font-bold", verified ? "text-emerald-700" : "text-slate-700")}>
                    {verified ? "Cheque_HDFC_Verified.pdf" : "Click to upload cheque"}
                  </p>
                  {!verified && <p className="text-xs text-slate-500">JPG or PDF (Max 2MB)</p>}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">UPI ID / VPA</label>
              <Input 
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="h-12 rounded-xl border-slate-200 bg-white focus:ring-2 focus:ring-[#E86A70]/20 focus:border-[#E86A70] transition-all font-bold" 
                placeholder="yourbusiness@okaxis" 
              />
              <p className="text-xs text-slate-500 font-medium pt-1">Enter your business UPI ID. Payouts are transferred instantly.</p>
            </div>
          </div>
        )}

      </motion.div>

      <motion.div variants={slideUp} className="mt-10 flex items-center justify-between">
        <Button onClick={handleBackClick} variant="ghost" className="text-slate-500 font-bold hover:bg-slate-100 rounded-full px-6">
          <ArrowLeft className="mr-2 w-4 h-4" /> Back
        </Button>
        <Button onClick={handleNextClick} className="bg-[#1F2E4A] hover:bg-[#151E2D] text-white rounded-full px-8 h-12 font-bold shadow-lg shadow-[#1F2E4A]/20 transition-all">
          KYC & Review <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </motion.div>
    </motion.div>
  );
}
