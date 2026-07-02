"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, UserPlus, Mail, Phone } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { COUNTRIES } from "@/lib/countries";
import { useAuthStore } from "@/store/authStore";
import { databases, appwriteConfig } from "@/lib/appwrite/client";
import { Loader2 } from "lucide-react";

export function Step1Account({ onNext }: { onNext: () => void }) {
  const [phoneCountry, setPhoneCountry] = useState("India");
  const [altPhoneCountry, setAltPhoneCountry] = useState("India");
  const [phoneSearch, setPhoneSearch] = useState("");
  const [altPhoneSearch, setAltPhoneSearch] = useState("");
  const { user, profile } = useAuthStore();

  const [firstName, setFirstName] = useState(profile?.firstName || "");
  const [lastName, setLastName] = useState(profile?.lastName || "");
  const [email, setEmail] = useState(profile?.email || user?.email || "");
  const [phone, setPhone] = useState(profile?.phone?.split(" ")[1] || "");
  const [altPhone, setAltPhone] = useState(profile?.altPhone?.split(" ")[1] || "");
  const [phoneError, setPhoneError] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isFormValid = termsAccepted && firstName.trim() && lastName.trim() && email.trim() && phone.trim() && altPhone.trim();

  const selectedPhone = COUNTRIES.find(c => c.name === phoneCountry) || COUNTRIES[0];
  const selectedAltPhone = COUNTRIES.find(c => c.name === altPhoneCountry) || COUNTRIES[0];

  useEffect(() => {
    if (phone && altPhone && phone === altPhone) {
      setPhoneError("Alternative number must be different from the primary phone number.");
    } else {
      setPhoneError("");
    }
  }, [phone, altPhone]);

  // Load saved data on mount
  useEffect(() => {
    if (profile) {
      if (profile.firstName) setFirstName(profile.firstName);
      if (profile.lastName) setLastName(profile.lastName);
      if (profile.email) setEmail(profile.email);
      if (profile.phone) {
        const parts = profile.phone.split(" ");
        if (parts.length > 1) {
          setPhone(parts[1]);
        } else {
          setPhone(profile.phone);
        }
      }
      if (profile.altPhone) {
        const parts = profile.altPhone.split(" ");
        if (parts.length > 1) {
          setAltPhone(parts[1]);
        } else {
          setAltPhone(profile.altPhone);
        }
      }
    }
  }, [profile]);

  const slideUpVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.5, delay: i * 0.05, ease: [0.25, 0.4, 0.1, 1] }
    })
  };

  const handleNext = async () => {
    if (phone && altPhone && phone === altPhone) {
      setPhoneError("Alternative number must be different from the primary phone number.");
      return;
    }
    if (phoneError) return;
    
    setIsLoading(true);
    
    try {
      if (user) {
        await databases.updateDocument(
          appwriteConfig.databaseId,
          appwriteConfig.vendorCollectionId,
          user.$id,
          {
            firstName,
            lastName,
            phone: `${selectedPhone.code} ${phone}`,
            altPhone: `${selectedAltPhone.code} ${altPhone}`,
          }
        );
      }
      
      // Wait for the auth store to pull new data
      const { fetchProfile } = useAuthStore.getState();
      await fetchProfile(user.$id);
      
      onNext();
    } catch (error) {
      console.error("Failed to save vendor details to Appwrite", error);
      // Fallback: Proceed anyway if Appwrite throws
      onNext();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial="hidden" 
      animate="visible" 
      exit="hidden" 
      className="flex flex-col h-full max-w-xl mx-auto w-full pt-4 md:pt-8 pb-12"
    >
      <motion.div custom={0} variants={slideUpVariants} className="mb-10">
        <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center mb-6 border border-rose-100 shadow-sm">
          <UserPlus className="w-7 h-7 text-rose-500" />
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight font-heading">
          Create your <span className="text-[#E86A70]">partner account</span>
        </h1>
        <p className="text-slate-500 font-medium text-lg">First, let's set up your login credentials so you can save your progress and access the dashboard later.</p>
      </motion.div>

      <div className="space-y-6">
        <motion.div custom={1} variants={slideUpVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2.5">
            <Label className="text-sm font-semibold text-slate-700">First Name</Label>
            <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="h-12 rounded-xl border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-slate-900/10 focus-visible:border-slate-900 transition-all font-medium shadow-sm" placeholder="Jane" />
          </div>
          <div className="space-y-2.5">
            <Label className="text-sm font-semibold text-slate-700">Last Name</Label>
            <Input value={lastName} onChange={(e) => setLastName(e.target.value)} className="h-12 rounded-xl border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-slate-900/10 focus-visible:border-slate-900 transition-all font-medium shadow-sm" placeholder="Doe" />
          </div>
        </motion.div>

        <motion.div custom={2} variants={slideUpVariants} className="space-y-2.5">
          <Label className="text-sm font-semibold text-slate-700">Email ID</Label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 pl-11 rounded-xl border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-slate-900/10 focus-visible:border-slate-900 transition-all font-medium shadow-sm" placeholder="example@gmail.com" />
          </div>
        </motion.div>

        <motion.div custom={3} variants={slideUpVariants} className="space-y-2.5">
          <Label className="text-sm font-semibold text-slate-700">Phone Number</Label>
          <div className="flex gap-3">
            <Select value={phoneCountry} onValueChange={(val) => val && setPhoneCountry(val)}>
              <SelectTrigger className="h-12! w-25 shrink-0 rounded-xl border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all shadow-sm font-medium">
                <span className="flex items-center gap-1.5 truncate">
                  <span className="text-base leading-none">{selectedPhone.flag}</span>
                  <span className="font-medium leading-none">{selectedPhone.code}</span>
                </span>
              </SelectTrigger>
              <SelectContent className="max-h-75 z-100" alignItemWithTrigger={false}>
                <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm p-2 border-b border-slate-100 mb-1">
                  <Input 
                    placeholder="Search country or code..." 
                    value={phoneSearch}
                    onChange={(e) => setPhoneSearch(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    className="h-9 w-full text-sm bg-slate-50 focus-visible:ring-1 focus-visible:ring-slate-900/10 focus-visible:border-slate-900"
                  />
                </div>
                {COUNTRIES.filter(c => 
                  c.name.toLowerCase().includes(phoneSearch.toLowerCase()) || 
                  c.code.includes(phoneSearch)
                ).map(country => (
                  <SelectItem key={`phone-${country.name}`} value={country.name} className="cursor-pointer">
                    <span className="flex items-center gap-2">
                      <span className="text-base">{country.flag}</span>
                      <span className="font-medium">{country.code}</span>
                      <span className="text-slate-400 text-xs truncate max-w-30 ml-1">{country.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative flex-1">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`h-12 pl-11 w-full rounded-xl border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-slate-900/10 focus-visible:border-slate-900 transition-all font-medium shadow-sm ${phoneError ? 'border-red-500 focus-visible:ring-red-500/20 focus-visible:border-red-500' : ''}`} 
                placeholder="9876543210" 
              />
            </div>
          </div>
        </motion.div>

        <motion.div custom={4} variants={slideUpVariants} className="space-y-2.5">
          <Label className="text-sm font-semibold text-slate-700">Alternative Number</Label>
          <div className="flex gap-3">
            <Select value={altPhoneCountry} onValueChange={(val) => val && setAltPhoneCountry(val)}>
              <SelectTrigger className="h-12! w-25 shrink-0 rounded-xl border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all shadow-sm font-medium">
                <span className="flex items-center gap-1.5 truncate">
                  <span className="text-base leading-none">{selectedAltPhone.flag}</span>
                  <span className="font-medium leading-none">{selectedAltPhone.code}</span>
                </span>
              </SelectTrigger>
              <SelectContent className="max-h-75 z-100" alignItemWithTrigger={false}>
                <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm p-2 border-b border-slate-100 mb-1">
                  <Input 
                    placeholder="Search country or code..." 
                    value={altPhoneSearch}
                    onChange={(e) => setAltPhoneSearch(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    className="h-9 w-full text-sm bg-slate-50 focus-visible:ring-1 focus-visible:ring-slate-900/10 focus-visible:border-slate-900"
                  />
                </div>
                {COUNTRIES.filter(c => 
                  c.name.toLowerCase().includes(altPhoneSearch.toLowerCase()) || 
                  c.code.includes(altPhoneSearch)
                ).map(country => (
                  <SelectItem key={`alt-${country.name}`} value={country.name} className="cursor-pointer">
                    <span className="flex items-center gap-2">
                      <span className="text-base">{country.flag}</span>
                      <span className="font-medium">{country.code}</span>
                      <span className="text-slate-400 text-xs truncate max-w-30 ml-1">{country.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative flex-1">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                type="tel" 
                value={altPhone}
                onChange={(e) => setAltPhone(e.target.value)}
                className={`h-12 pl-11 w-full rounded-xl border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-slate-900/10 focus-visible:border-slate-900 transition-all font-medium shadow-sm ${phoneError ? 'border-red-500 focus-visible:ring-red-500/20 focus-visible:border-red-500' : ''}`} 
                placeholder="9876543211" 
              />
            </div>
          </div>
          {phoneError && (
            <p className="text-sm font-medium text-red-500 mt-2 ml-1">{phoneError}</p>
          )}
        </motion.div>


        <motion.div custom={6} variants={slideUpVariants} className="flex items-start gap-3.5 mt-8 p-5 rounded-2xl bg-rose-50/50 border border-rose-100/50 shadow-sm">
          <input 
            type="checkbox" 
            id="terms" 
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="mt-1 shrink-0 w-4 h-4 rounded border-slate-300 text-rose-500 focus:ring-rose-500 cursor-pointer" 
          />
          <label htmlFor="terms" className="text-sm text-slate-600 font-medium leading-relaxed cursor-pointer block">
            I agree to Racoonn's{" "}
            <a href="#" className="text-rose-600 hover:text-rose-700 font-semibold hover:underline">Terms of Service</a>
            {", "}
            <a href="#" className="text-rose-600 hover:text-rose-700 font-semibold hover:underline">Privacy Policy</a>
            {", and "}
            <a href="#" className="text-rose-600 hover:text-rose-700 font-semibold hover:underline">Partner Agreement</a>
            .
          </label>
        </motion.div>
      </div>

      <motion.div custom={7} variants={slideUpVariants} className="mt-12 pt-6 border-t border-slate-100 flex items-center justify-between">
        <p className="text-sm text-slate-500 font-semibold bg-slate-100 px-3 py-1 rounded-full">Step 1 of 10</p>
        <Button 
          onClick={handleNext} 
          disabled={!isFormValid || isLoading}
          className={`bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-8 h-12 font-semibold shadow-lg shadow-slate-900/10 transition-all duration-300 ${isFormValid ? 'hover:scale-[1.02]' : 'opacity-50 cursor-not-allowed'}`}
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Continue to Verification <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </motion.div>
    </motion.div>
  );
}
