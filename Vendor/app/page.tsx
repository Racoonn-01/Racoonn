"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Globe2, ShieldCheck, Star, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/lib/appwrite/auth";
import { toast } from "sonner";

export default function AuthPage() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const { checkAuth, isAuthenticated, profile } = useAuthStore();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      if (!profile || profile.status === 'Pending') {
        router.push("/vendor/onboarding");
      } else {
        router.push("/vendor/dashboard");
      }
    }
  }, [isAuthenticated, profile, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isForgotPassword) {
        await authService.forgotPassword(email);
        setResetSent(true);
        toast.success("Password reset email sent!");
      } else if (isSignIn) {
        await authService.login(email, password);
        await checkAuth();
        // Redirect is handled by the useEffect above
      } else {
        await authService.register(email, password, email.split("@")[0]);
        await checkAuth();
        // Redirect is handled by the useEffect above
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred during authentication.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    authService.loginWithGoogle();
  };


  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden selection:bg-[#E86A70] selection:text-white font-sans">
      {/* Left Column: Auth Form */}
      <div className="w-full lg:w-[45%] xl:w-[40%] flex flex-col justify-center relative z-10 px-8 sm:px-16 py-12 bg-white shadow-[30px_0_60px_-15px_rgba(0,0,0,0.05)] overflow-y-auto">
        <div className="absolute top-8 left-8 sm:left-12">
          <Image src="/racoonn-logo-text.png" alt="Racoonn" width={140} height={40} className="h-8 w-auto" />
        </div>

        <div className="w-full max-w-sm mx-auto mt-16 lg:mt-0">
          <div className="mb-10">
            {isForgotPassword ? (
              <>
                <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight font-heading">
                  Reset <span className="text-[#E86A70]">password</span>
                </h1>
                <p className="text-slate-500 font-medium text-[1.05rem] leading-relaxed">
                  {resetSent ? "We've sent a recovery link to your email." : "Enter your email address and we'll send you a link to reset your password."}
                </p>
              </>
            ) : (
              <>
                <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight font-heading">
                  Welcome to <span className="text-[#E86A70]">Racoonn</span>
                </h1>
                <p className="text-slate-500 font-medium text-[1.05rem] leading-relaxed">
                  Log in to manage your bookings, or create an account to list your property.
                </p>
              </>
            )}
          </div>

          {/* Custom Segmented Control */}
          {!isForgotPassword && (
            <div className="flex bg-slate-100/50 p-1 rounded-xl mb-10 border border-slate-200/60">
              <button
                type="button"
                onClick={() => setIsSignIn(true)}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${isSignIn ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-900/5" : "text-slate-500 hover:text-slate-700"}`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setIsSignIn(false)}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${!isSignIn ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-900/5" : "text-slate-500 hover:text-slate-700"}`}
              >
                Sign Up
              </button>
            </div>
          )}
          
          {/* Form Content */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <form onSubmit={handleSubmit} className="space-y-5">
                {isForgotPassword ? (
                  <>
                    {!resetSent && (
                      <div className="space-y-2">
                        <Label htmlFor="resetEmail" className="text-sm font-bold text-slate-700 ml-1">Email address</Label>
                        <div className="relative">
                          <Input suppressHydrationWarning id="resetEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="hello@example.com" required className="h-14 pl-4 pr-10 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-[#E86A70]/20 focus:border-[#E86A70] transition-all shadow-sm" />
                        </div>
                        <Button disabled={isLoading} type="submit" className="w-full h-14 text-white rounded-2xl text-[1.05rem] font-bold shadow-lg hover:-translate-y-0.5 transition-all mt-6 bg-[#1F2E4A] hover:bg-[#1F2E4A]/90 shadow-[#1F2E4A]/20">
                          {isLoading ? "Please wait..." : "Send Reset Link"}
                        </Button>
                      </div>
                    )}
                    <div className="pt-4 text-center">
                      <button type="button" onClick={() => { setIsForgotPassword(false); setResetSent(false); }} className="text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors">
                        Back to sign in
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-bold text-slate-700 ml-1">Email address</Label>
                      <div className="relative">
                        <Input suppressHydrationWarning id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="hello@example.com" required className="h-14 pl-4 pr-10 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-[#E86A70]/20 focus:border-[#E86A70] transition-all shadow-sm" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center ml-1 mb-1">
                        <Label htmlFor="password" className="text-sm font-bold text-slate-700">Password</Label>
                        {isSignIn && (
                          <button type="button" onClick={() => setIsForgotPassword(true)} className="text-xs font-bold text-[#E86A70] hover:text-[#E86A70]/80 transition-colors">Forgot password?</button>
                        )}
                      </div>
                      <div className="relative">
                        <Input suppressHydrationWarning id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="h-14 pl-4 pr-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-[#E86A70]/20 focus:border-[#E86A70] transition-all shadow-sm" />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>
                    
                    <Button disabled={isLoading} type="submit" className={`w-full h-14 text-white rounded-2xl text-[1.05rem] font-bold shadow-lg hover:-translate-y-0.5 transition-all mt-6 ${isSignIn ? "bg-[#1F2E4A] hover:bg-[#1F2E4A]/90 shadow-[#1F2E4A]/20" : "bg-[#E86A70] hover:bg-[#E86A70]/90 shadow-[#E86A70]/25"}`}>
                      {isLoading ? "Please wait..." : (isSignIn ? "Sign In to Dashboard" : "Create Account")}
                    </Button>
                  </>
                )}
              </form>
          </div>

          {!isForgotPassword && (
            <>
              <div className="relative my-10">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-5 bg-white text-slate-400 font-semibold tracking-wide uppercase text-xs">Or continue with</span>
                </div>
              </div>

              <div className="flex flex-col w-full">
                <Button type="button" onClick={handleGoogleAuth} variant="outline" className="w-full h-14 rounded-2xl border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-bold shadow-sm transition-all">
                  <svg className="w-5 h-5 mr-2.5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </Button>
              </div>
              
              <p className="mt-10 text-center text-[0.85rem] text-slate-500 font-medium px-4">
                By continuing, you agree to Racoonn&apos;s <Link href="#" className="text-slate-900 font-bold hover:underline">Terms of Service</Link> and <Link href="#" className="text-slate-900 font-bold hover:underline">Privacy Policy</Link>.
              </p>
            </>
          )}
        </div>
      </div>

      {/* Right Column: Visuals */}
      <div className="hidden lg:flex lg:w-[55%] xl:w-[60%] relative bg-[#1F2E4A] overflow-hidden items-center justify-center p-12 lg:p-20">
        {/* Abstract background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-125 h-125 bg-white/20 rounded-full blur-[100px]" />
          <div className="absolute top-[30%] left-[60%] w-100 h-100 bg-black/10 rounded-full blur-[80px]" />
          
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[linear-gradient(to_bottom,black_40%,transparent_100%)]"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-xl animate-in fade-in zoom-in-95 duration-1000 delay-200 fill-mode-both">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold text-sm mb-8 shadow-lg">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> #1 Property Management Platform
            </div>

            <h3 className="text-5xl lg:text-6xl font-heading font-black text-white leading-[1.1] tracking-tight mb-8">
              Elevate your <br/>
              <span className="text-transparent bg-clip-text bg-linear-to-r from-[#E86A70] to-[#FF8C73]">hospitality.</span>
            </h3>
            
            <p className="text-slate-300 text-lg leading-relaxed mb-12 max-w-md">
              Join thousands of luxury properties managing their operations, bookings, and guest experiences in one unified platform.
            </p>
            
            {/* Bento-style feature cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-xl border border-white/10 p-6 rounded-3xl hover:bg-white/15 transition-colors shadow-2xl">
                <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-[#E86A70] to-[#FF8C73] flex items-center justify-center mb-4 shadow-lg shadow-[#E86A70]/30">
                  <Globe2 className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-white font-bold text-lg mb-2">Global Reach</h4>
                <p className="text-slate-300/80 text-sm">Connect with luxury travelers worldwide.</p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl hover:bg-white/15 transition-colors shadow-2xl">
                <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-white font-bold text-lg mb-2">Secure Data</h4>
                <p className="text-slate-300/80 text-sm">Your property data is completely safe.</p>
              </div>
            </div>

            <div className="mt-14 pt-8 border-t border-white/10 flex items-center gap-6">
              <div className="flex -space-x-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://i.pravatar.cc/100?img=1" className="w-12 h-12 rounded-full border-4 border-[#1F2E4A] object-cover" alt="Partner" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://i.pravatar.cc/100?img=2" className="w-12 h-12 rounded-full border-4 border-[#1F2E4A] object-cover" alt="Partner" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://i.pravatar.cc/100?img=3" className="w-12 h-12 rounded-full border-4 border-[#1F2E4A] object-cover" alt="Partner" />
                <div className="w-12 h-12 rounded-full border-4 border-[#1F2E4A] bg-[#E86A70] flex items-center justify-center text-white font-black text-sm z-10">
                  +2k
                </div>
              </div>
              <div>
                <div className="flex text-amber-400 mb-1">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-sm font-medium text-slate-300">
                  Loved by top hoteliers
                </p>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}
