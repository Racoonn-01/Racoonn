"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Mail, Smartphone, CheckCircle2, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { databases, appwriteConfig } from "@/lib/appwrite/client";

export function Step2Verification({ onNext, onBack }: { onNext: () => void, onBack: () => void }) {
  const [selectedMethod, setSelectedMethod] = useState<"email" | "mobile">("email");
  const [codeSentTo, setCodeSentTo] = useState<"email" | "mobile" | null>(null);
  
  const [emailOtp, setEmailOtp] = useState(["", "", "", "", "", ""]);
  const [mobileOtp, setMobileOtp] = useState(["", "", "", "", "", ""]);
  
  const [verifiedMethod, setVerifiedMethod] = useState<"email" | "mobile" | null>(null);

  // Timers and Attempts
  const [countdown, setCountdown] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const emailRefs = useRef<(HTMLInputElement | null)[]>([]);
  const mobileRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { user, profile } = useAuthStore();
  const [phone, setPhone] = useState("+91 98765 43210");
  const [email, setEmail] = useState(user?.email || "jane@example.com");

  useEffect(() => {
    if (profile) {
      if (profile.phone) setPhone(profile.phone);
      if (profile.email) setEmail(profile.email);
    } else if (user?.email) {
      setEmail(user.email);
    }
  }, [profile, user]);

  // Countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendCode = async (method: "email" | "mobile") => {
    setErrorMsg("");
    setSuccessMsg("");
    setIsLoading(true);
    
    try {
      const identifier = method === "email" ? email : phone;
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method, identifier })
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send code");
      }
      
      setCodeSentTo(method);
      setCountdown(60);
      setAttempts(0);
      
      if (method === "email") setEmailOtp(["", "", "", "", "", ""]);
      if (method === "mobile") setMobileOtp(["", "", "", "", "", ""]);
      
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (method: "email" | "mobile") => {
    if (attempts >= 5) {
      setErrorMsg("Maximum attempts reached. Please resend the code.");
      return;
    }

    const otpArray = method === "email" ? emailOtp : mobileOtp;
    const code = otpArray.join("");
    
    if (code.length !== 6) {
      setErrorMsg("Please enter a 6-digit code");
      return;
    }

    setErrorMsg("");
    setSuccessMsg("");
    setIsLoading(true);

    try {
      const identifier = method === "email" ? email : phone;
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, code })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setAttempts(prev => prev + 1);
        setErrorMsg(data.error || "Invalid or expired verification code. Please try again.");
      } else {
        // Save verification status to Appwrite
        if (user) {
          try {
            await databases.updateDocument(
              appwriteConfig.databaseId,
              appwriteConfig.vendorCollectionId,
              user.$id,
              method === "email" ? { isEmailVerified: true } : { isPhoneVerified: true }
            );
          } catch (dbError) {
            console.error("Failed to update verification status in Appwrite", dbError);
          }
        }
        
        setSuccessMsg(method === "email" ? "Email verified successfully" : "Mobile number verified successfully");
        setVerifiedMethod(method);
        setCodeSentTo(null);
      }
    } catch {
      setAttempts(prev => prev + 1);
      setErrorMsg("Error verifying OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (method: "email" | "mobile", index: number, value: string) => {
    if (!/^[0-9]*$/.test(value)) return;

    const newOtp = method === "email" ? [...emailOtp] : [...mobileOtp];
    newOtp[index] = value;
    
    if (method === "email") setEmailOtp(newOtp);
    else setMobileOtp(newOtp);

    // Auto focus next
    if (value && index < 5) {
      const refs = method === "email" ? emailRefs : mobileRefs;
      refs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (method: "email" | "mobile", index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      const otpArray = method === "email" ? emailOtp : mobileOtp;
      if (!otpArray[index] && index > 0) {
        const refs = method === "email" ? emailRefs : mobileRefs;
        refs.current[index - 1]?.focus();
      }
    }
  };

  const slideUp: any = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <motion.div 
      initial="hidden" 
      animate="visible" 
      exit="hidden" 
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className="flex flex-col h-full max-w-xl mx-auto w-full pt-8"
    >
      <motion.div variants={slideUp} className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight font-heading">Verify your identity</h1>
        <p className="text-slate-500 font-medium">Please choose where you would like us to send your security verification code.</p>
      </motion.div>

      {errorMsg && (
        <motion.div variants={slideUp} className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
          {errorMsg}
        </motion.div>
      )}

      {successMsg && (
        <motion.div variants={slideUp} className="mb-4 p-3 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-medium border border-emerald-100">
          {successMsg}
        </motion.div>
      )}

      <motion.div variants={slideUp} className="space-y-4">
        
        {/* Email Verification Box */}
        <div 
          onClick={() => !verifiedMethod && setSelectedMethod("email")}
          className={cn(
            "p-6 rounded-2xl border-2 transition-all duration-300", 
            !verifiedMethod && "cursor-pointer",
            verifiedMethod === "email" ? "border-emerald-500 bg-emerald-50 shadow-sm" : 
            selectedMethod === "email" ? "border-rose-500 bg-rose-50/30 shadow-md ring-4 ring-rose-500/10" : "border-slate-200 bg-white hover:border-slate-300"
          )}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className={cn("w-12 h-12 rounded-full flex items-center justify-center transition-colors", 
                verifiedMethod === "email" ? "bg-emerald-100 text-emerald-600" : 
                selectedMethod === "email" ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-500"
              )}>
                {verifiedMethod === "email" ? <CheckCircle2 className="w-6 h-6" /> : <Mail className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Email Address</h3>
                <p className="text-sm font-medium text-slate-500">{email}</p>
              </div>
            </div>
            {verifiedMethod === "email" && <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-3 py-1.5 rounded-full uppercase tracking-wider">Verified</span>}
            {selectedMethod === "email" && !verifiedMethod && <span className="text-xs font-bold text-rose-600 bg-rose-100 px-3 py-1.5 rounded-full uppercase tracking-wider">Selected</span>}
          </div>
          
          {selectedMethod === "email" && verifiedMethod !== "email" && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: "auto" }} 
              className="mt-6 pt-6 border-t border-rose-100/50"
            >
              {codeSentTo === "email" ? (
                <>
                  <p className="text-center text-sm font-medium text-slate-600 mb-4">Enter the 6-digit code sent to your email</p>
                  <div className="flex gap-2 sm:gap-3 justify-center mb-6">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <input 
                        key={i} 
                        ref={(el) => { emailRefs.current[i] = el; }}
                        type="text" 
                        maxLength={1} 
                        className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-black text-slate-800 rounded-xl border border-slate-200 bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all shadow-sm disabled:opacity-50"
                        value={emailOtp[i]}
                        onChange={(e) => handleOtpChange("email", i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown("email", i, e)}
                        disabled={isLoading}
                      />
                    ))}
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button 
                      onClick={() => handleVerifyOtp("email")}
                      disabled={isLoading || emailOtp.join("").length !== 6 || attempts >= 5}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-8 h-11 font-semibold w-full sm:w-auto"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Verify Code
                    </Button>
                    <Button
                      variant="ghost"
                      disabled={countdown > 0 || isLoading}
                      onClick={(e) => { e.stopPropagation(); handleSendCode("email"); }}
                      className="text-slate-500 font-medium hover:text-slate-800 w-full sm:w-auto"
                    >
                      {countdown > 0 ? `Resend Code in ${countdown}s` : "Resend Code"}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex justify-center">
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSendCode("email");
                    }} 
                    disabled={isLoading}
                    className="bg-rose-500 hover:bg-rose-600 text-white rounded-full px-8 h-11 font-semibold"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Send Code to Email
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Mobile Verification Box */}
        <div 
          onClick={() => !verifiedMethod && setSelectedMethod("mobile")}
          className={cn(
            "p-6 rounded-2xl border-2 transition-all duration-300", 
            !verifiedMethod && "cursor-pointer",
            verifiedMethod === "mobile" ? "border-emerald-500 bg-emerald-50 shadow-sm" : 
            selectedMethod === "mobile" ? "border-rose-500 bg-rose-50/30 shadow-md ring-4 ring-rose-500/10" : "border-slate-200 bg-white hover:border-slate-300"
          )}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className={cn("w-12 h-12 rounded-full flex items-center justify-center transition-colors", 
                verifiedMethod === "mobile" ? "bg-emerald-100 text-emerald-600" : 
                selectedMethod === "mobile" ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-500"
              )}>
                {verifiedMethod === "mobile" ? <CheckCircle2 className="w-6 h-6" /> : <Smartphone className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Mobile Number</h3>
                <p className="text-sm font-medium text-slate-500">{phone}</p>
              </div>
            </div>
            {verifiedMethod === "mobile" && <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-3 py-1.5 rounded-full uppercase tracking-wider">Verified</span>}
            {selectedMethod === "mobile" && !verifiedMethod && <span className="text-xs font-bold text-rose-600 bg-rose-100 px-3 py-1.5 rounded-full uppercase tracking-wider">Selected</span>}
          </div>
          
          {selectedMethod === "mobile" && verifiedMethod !== "mobile" && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: "auto" }} 
              className="mt-6 pt-6 border-t border-rose-100/50"
            >
              {codeSentTo === "mobile" ? (
                <>
                  <p className="text-center text-sm font-medium text-slate-600 mb-4">Enter the 6-digit code sent to your phone</p>
                  <div className="flex gap-2 sm:gap-3 justify-center mb-6">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <input 
                        key={`m${i}`} 
                        ref={(el) => { mobileRefs.current[i] = el; }}
                        type="text" 
                        maxLength={1} 
                        className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-black text-slate-800 rounded-xl border border-slate-200 bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all shadow-sm disabled:opacity-50"
                        value={mobileOtp[i]}
                        onChange={(e) => handleOtpChange("mobile", i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown("mobile", i, e)}
                        disabled={isLoading}
                      />
                    ))}
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button 
                      onClick={() => handleVerifyOtp("mobile")}
                      disabled={isLoading || mobileOtp.join("").length !== 6 || attempts >= 5}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-8 h-11 font-semibold w-full sm:w-auto"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Verify Code
                    </Button>
                    <Button
                      variant="ghost"
                      disabled={countdown > 0 || isLoading}
                      onClick={(e) => { e.stopPropagation(); handleSendCode("mobile"); }}
                      className="text-slate-500 font-medium hover:text-slate-800 w-full sm:w-auto"
                    >
                      {countdown > 0 ? `Resend OTP in ${countdown}s` : "Resend OTP"}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex justify-center">
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSendCode("mobile");
                    }} 
                    disabled={isLoading}
                    className="bg-rose-500 hover:bg-rose-600 text-white rounded-full px-8 h-11 font-semibold"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Send OTP to Mobile
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>

      <motion.div variants={slideUp} className="mt-10 flex items-center justify-between">
        <Button onClick={onBack} variant="ghost" className="text-slate-500 font-bold hover:bg-slate-100 rounded-full px-6">
          <ArrowLeft className="mr-2 w-4 h-4" /> Back
        </Button>
        <Button 
          onClick={onNext} 
          disabled={verifiedMethod !== selectedMethod}
          className={`bg-slate-900 text-white rounded-full px-8 h-12 font-bold shadow-lg transition-all ${verifiedMethod === selectedMethod ? "hover:bg-slate-800 shadow-slate-900/20" : "opacity-50 cursor-not-allowed"}`}
        >
          Verify & Continue <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </motion.div>
    </motion.div>
  );
}
