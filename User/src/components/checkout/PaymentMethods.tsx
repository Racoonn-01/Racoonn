"use client";
import { CreditCard, Wallet, Smartphone, Building, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PAYMENT_OPTIONS = [
  { id: "card", title: "Credit / Debit Card", icon: CreditCard },
  { id: "upi", title: "UPI", icon: Smartphone },
  { id: "wallet", title: "Wallet (Google Pay, Apple Pay, PayPal)", icon: Wallet },
  { id: "netbanking", title: "Net Banking", icon: Building },
];

export function PaymentMethods() {
  const [selectedMethod, setSelectedMethod] = useState("card");
  const [sameAsGuest, setSameAsGuest] = useState(true);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#DCE8F5] p-6 md:p-8">
      <h2 className="text-xl md:text-2xl font-poppins font-bold text-brand-navy mb-6 flex items-center gap-2">
        <CreditCard className="w-6 h-6 text-brand-coral" /> Payment Method
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {PAYMENT_OPTIONS.map((method) => {
          const isSelected = selectedMethod === method.id;
          const Icon = method.icon;
          
          return (
            <div 
              key={method.id}
              onClick={() => setSelectedMethod(method.id)}
              className={`cursor-pointer rounded-xl border-2 p-4 flex items-center gap-3 transition-all ${
                isSelected 
                  ? "border-brand-coral bg-[#F8D6D8]/20" 
                  : "border-[#DCE8F5] hover:border-brand-coral/50"
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                isSelected ? "border-brand-coral" : "border-gray-300"
              }`}>
                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-brand-coral" />}
              </div>
              <Icon className={`w-5 h-5 ${isSelected ? "text-brand-coral" : "text-gray-400"}`} />
              <span className={`font-medium ${isSelected ? "text-brand-navy" : "text-gray-600"}`}>
                {method.title}
              </span>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedMethod === "card" && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 mb-8 overflow-hidden"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Card Number</label>
              <input type="text" placeholder="0000 0000 0000 0000" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-coral outline-none tracking-wide" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Expiry Date</label>
                <input type="text" placeholder="MM/YY" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-coral outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">CVV</label>
                <input type="password" placeholder="123" maxLength={4} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-coral outline-none tracking-widest" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Cardholder Name</label>
              <input type="text" placeholder="John Doe" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-coral outline-none" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Billing Information Section */}
      <div className="pt-6 border-t border-[#DCE8F5]">
        <h3 className="text-lg font-bold text-brand-navy mb-4">Billing Information</h3>
        
        <label className="flex items-center gap-2 cursor-pointer mb-6">
          <input 
            type="checkbox" 
            checked={sameAsGuest}
            onChange={() => setSameAsGuest(!sameAsGuest)}
            className="w-4 h-4 text-brand-coral focus:ring-brand-coral rounded" 
          />
          <span className="text-sm text-gray-700">Same as Guest Details</span>
        </label>

        {!sameAsGuest && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden pb-4"
          >
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Billing Name</label>
              <input type="text" placeholder="John Doe" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-coral outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Country</label>
              <select className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-coral outline-none bg-white">
                <option>United States</option>
                <option>India</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">State / Province</label>
              <input type="text" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-coral outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">City</label>
              <input type="text" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-coral outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">ZIP / Postal Code</label>
              <input type="text" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-coral outline-none" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">GST Number (Optional)</label>
              <input type="text" placeholder="Enter GSTIN for tax invoice" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-coral outline-none uppercase" />
            </div>
          </motion.div>
        )}
      </div>

    </div>
  );
}
