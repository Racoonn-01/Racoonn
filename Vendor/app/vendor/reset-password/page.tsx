"use client";

import { useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/lib/appwrite/auth";
import { toast } from "sonner";
import Link from "next/link";

function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const searchParams = useSearchParams();
  const router = useRouter();

  const userId = searchParams.get("userId");
  const secret = searchParams.get("secret");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !secret) {
      toast.error("Invalid or missing reset token.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword(userId, secret, password);
      toast.success("Password reset successfully. You can now log in.");
      router.push("/");
    } catch (error: any) {
      toast.error(error.message || "Failed to reset password. The link might be expired.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-bold text-slate-700 ml-1">New Password</Label>
        <div className="relative">
          <Input 
            id="password" 
            type={showPassword ? "text" : "password"} 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="••••••••" 
            required 
            minLength={8}
            className="h-14 pl-4 pr-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-brand-coral/20 focus:border-brand-coral transition-all shadow-sm" 
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-sm font-bold text-slate-700 ml-1">Confirm New Password</Label>
        <div className="relative">
          <Input 
            id="confirmPassword" 
            type={showConfirmPassword ? "text" : "password"} 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            placeholder="••••••••" 
            required 
            minLength={8}
            className="h-14 pl-4 pr-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-brand-coral/20 focus:border-brand-coral transition-all shadow-sm" 
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>
      
      <Button 
        disabled={isLoading} 
        type="submit" 
        className="w-full h-14 text-white rounded-2xl text-[1.05rem] font-bold shadow-lg hover:-translate-y-0.5 transition-all mt-6 bg-brand-navy hover:bg-brand-navy/90 shadow-brand-navy/20"
      >
        {isLoading ? "Resetting..." : "Reset Password"}
      </Button>

      <div className="pt-4 text-center">
        <Link href="/" className="text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors">
          Back to sign in
        </Link>
      </div>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center selection:bg-brand-coral selection:text-white font-sans p-4">
      <div className="w-full max-w-md bg-white p-8 sm:p-12 rounded-4xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100">
        <div className="flex justify-center mb-10">
          <Image src="/racoonn-logo-text.png" alt="Racoonn" width={140} height={40} className="h-8 w-auto" />
        </div>
        
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-black text-slate-900 mb-3 tracking-tight font-heading">
            Set New <span className="text-brand-coral">Password</span>
          </h1>
          <p className="text-slate-500 font-medium text-sm leading-relaxed">
            Please enter your new password below.
          </p>
        </div>

        <div className="animate-in fade-in zoom-in-95 duration-500">
          <Suspense fallback={<div className="flex justify-center p-8"><div className="w-8 h-8 border-4 border-brand-coral border-t-transparent rounded-full animate-spin"></div></div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
