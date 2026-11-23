"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { authService } from "@/lib/appwrite/auth";
import { Loader2, Eye, EyeOff, Lock } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const userId = searchParams.get("userId");
  const secret = searchParams.get("secret");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);

  if (!userId || !secret) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Invalid Link</h2>
        <p className="text-gray-600 mb-6">The password reset link is invalid or has expired.</p>
        <button
          onClick={() => router.push("/")}
          className="bg-brand-coral text-white px-6 py-2 rounded-xl font-medium hover:bg-opacity-90 transition-all"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.resetPassword(userId, secret, password);
      setResetSuccess(true);
      toast.success("Password reset successfully!");
    } catch (error: unknown) {
      const err = error as Error;
      const errorMessage = err?.message || "Failed to reset password. The link might be expired.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden p-8 border border-gray-100">
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-[#E86A6F]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-5 h-5 text-[#E86A6F]" />
        </div>
        <h1 className="text-[28px] font-heading font-bold text-[#222] mb-2 tracking-tight">
          {resetSuccess ? "Password Reset" : "Reset Password"}
        </h1>
        <p className="text-gray-500 text-[14px]">
          {resetSuccess ? "Your password has been reset successfully." : "Please enter your new password below."}
        </p>
      </div>

      {resetSuccess ? (
        <div className="text-center mt-6">
          <button
            onClick={() => router.push("/?login=true")}
            className="w-full bg-[#222] hover:bg-black text-white py-3.5 rounded-xl font-bold text-[15px] transition-all active:scale-[0.98] mt-4"
          >
            Go to Login
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && error !== "Passwords do not match" && error !== "Password must be at least 8 characters" && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-[13px] font-medium flex items-center justify-center text-center">
              {error}
            </div>
          )}

          <div className="space-y-1.5 relative">
            <label className="block text-[12px] font-semibold text-gray-700 uppercase tracking-wide">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError("");
                }}
                placeholder="••••••••"
                required
                className={`w-full px-4 py-3 rounded-xl border bg-gray-50/50 focus:bg-white focus:outline-none focus:border-[#E86A6F] focus:ring-4 focus:ring-[#E86A6F]/10 transition-all text-[15px] tracking-widest ${error ? 'border-red-500' : 'border-gray-200'}`}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5 relative">
            <label className="block text-[12px] font-semibold text-gray-700 uppercase tracking-wide">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error) setError("");
                }}
                placeholder="••••••••"
                required
                className={`w-full px-4 py-3 rounded-xl border bg-gray-50/50 focus:bg-white focus:outline-none focus:border-[#E86A6F] focus:ring-4 focus:ring-[#E86A6F]/10 transition-all text-[15px] tracking-widest ${(error || (confirmPassword && confirmPassword !== password)) ? 'border-red-500' : 'border-gray-200'}`}
              />
            </div>
          </div>
          {(confirmPassword && confirmPassword !== password) && (
            <span className="text-red-500 text-[11px] mt-1 block leading-tight font-medium">Passwords do not match</span>
          )}
          {error && error !== "Passwords do not match" && (
            <span className="text-red-500 text-[11px] mt-1 block leading-tight font-medium">{error}</span>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#222] hover:bg-black text-white py-3.5 rounded-xl font-bold text-[15px] transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isSubmitting && <Loader2 size={18} className="animate-spin" />}
            Reset Password
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="h-screen w-full bg-gray-50 flex flex-col items-center justify-center p-4">
      <Suspense fallback={<Loader2 className="w-8 h-8 animate-spin text-[#E86A6F]" />}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
