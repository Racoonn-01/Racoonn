'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import { authService } from '@/lib/appwrite/auth';
import { useAuthStore } from '@/store/authStore';

const authSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters").optional(),
  lastName: z.string().min(2, "Last name must be at least 2 characters").optional(),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
});

type AuthFormData = z.infer<typeof authSchema>;

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: 'signin' | 'signup' | 'forgot';
  onSuccess?: () => void;
  successUrl?: string;
}

export default function AuthModal({ isOpen, onClose, initialView = 'signin', onSuccess, successUrl }: AuthModalProps) {
  const [view, setView] = useState<'signin' | 'signup' | 'forgot'>(initialView);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { checkAuth } = useAuthStore();

  const { register, handleSubmit, formState: { errors }, reset, clearErrors } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    mode: "onTouched"
  });

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        setView(initialView);
        setShowPassword(false);
      }, 0);
    }
  }, [isOpen, initialView, reset, clearErrors]);

  const onSubmit = async (data: AuthFormData) => {
    setIsSubmitting(true);
    try {
      if (view === 'signup') {
        if (!data.firstName || !data.lastName) {
            toast.error("First and Last name are required");
            setIsSubmitting(false);
            return;
        }
        await authService.register(
            data.email, 
            data.password, 
            `${data.firstName} ${data.lastName}`
        );
        toast.success('Account Created Successfully');
        await checkAuth();
        if (onSuccess) onSuccess();
        onClose();
      } else if (view === 'signin') {
        await authService.login(data.email, data.password);
        toast.success('Login Successful');
        await checkAuth();
        if (onSuccess) onSuccess();
        onClose();
      } else if (view === 'forgot') {
        await authService.forgotPassword(data.email);
        toast.success('Password Reset Email Sent');
        setView('signin');
      }
    } catch (error: unknown) {
      const err = error as Error & { code?: number };
      if (view === 'signin' && (err.code === 401 || err?.message?.toLowerCase().includes('invalid credentials'))) {
        toast.error("Account not found or invalid password. Please sign up!");
      } else {
        toast.error(err?.message || "Authentication failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsSubmitting(true);
      await authService.loginWithGoogle(successUrl);
      // Note: This redirects the browser, so we don't need to manually close the modal or unset loading
    } catch {
      toast.error("Google Login Failed");
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-brand-navy/60 z-200"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-201 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden pointer-events-auto relative"
            >
              <button 
                onClick={onClose}
                disabled={isSubmitting}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors z-10 disabled:opacity-50"
              >
                <X size={18} />
              </button>

              <div className="p-8">
                <div className="text-center mb-8">
                  <h2 className="text-[28px] font-heading font-bold text-[#222] mb-1 tracking-tight">
                    {view === 'signin' ? 'Welcome back' : view === 'signup' ? 'Create account' : 'Reset password'}
                  </h2>
                  <p className="text-gray-500 text-[14px]">
                    {view === 'signin' 
                      ? 'Enter your details to access your account.' 
                      : view === 'signup'
                      ? 'Join us to unlock the best travel experiences.'
                      : "Enter your email and we'll send you a reset link."}
                  </p>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                  {view === 'signup' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-[12px] font-semibold text-gray-700 uppercase tracking-wide">First Name</label>
                        <input 
                          type="text" 
                          placeholder="John" 
                          {...register("firstName")}
                          className={`w-full px-4 py-3 rounded-xl border bg-gray-50/50 focus:bg-white focus:outline-none focus:border-brand-coral focus:ring-4 focus:ring-brand-coral/10 transition-all text-[15px] ${errors.firstName ? 'border-red-500' : 'border-gray-200'}`}
                        />
                        {errors.firstName && <span className="text-red-500 text-[11px] mt-1">{errors.firstName.message}</span>}
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-[12px] font-semibold text-gray-700 uppercase tracking-wide">Last Name</label>
                        <input 
                          type="text" 
                          placeholder="Doe" 
                          {...register("lastName")}
                          className={`w-full px-4 py-3 rounded-xl border bg-gray-50/50 focus:bg-white focus:outline-none focus:border-brand-coral focus:ring-4 focus:ring-brand-coral/10 transition-all text-[15px] ${errors.lastName ? 'border-red-500' : 'border-gray-200'}`}
                        />
                        {errors.lastName && <span className="text-red-500 text-[11px] mt-1">{errors.lastName.message}</span>}
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="block text-[12px] font-semibold text-gray-700 uppercase tracking-wide">Email Address</label>
                    <input 
                      type="email" 
                      placeholder="name@example.com" 
                      {...register("email")}
                      className={`w-full px-4 py-3 rounded-xl border bg-gray-50/50 focus:bg-white focus:outline-none focus:border-brand-coral focus:ring-4 focus:ring-brand-coral/10 transition-all text-[15px] ${errors.email ? 'border-red-500' : 'border-gray-200'}`}
                    />
                    {errors.email && <span className="text-red-500 text-[11px] mt-1 block">{errors.email.message}</span>}
                  </div>
                  
                  {view !== 'forgot' && (
                    <div className="space-y-1.5 relative">
                      <div className="flex items-center justify-between">
                        <label className="block text-[12px] font-semibold text-gray-700 uppercase tracking-wide">Password</label>
                        {view === 'signin' && (
                          <button type="button" onClick={() => { setView('forgot'); clearErrors(); reset(); }} className="text-[12px] font-bold text-brand-coral hover:text-[#d95d63] transition-colors">
                            Forgot password?
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <input 
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••" 
                          {...register("password")}
                          className={`w-full px-4 py-3 rounded-xl border bg-gray-50/50 focus:bg-white focus:outline-none focus:border-brand-coral focus:ring-4 focus:ring-brand-coral/10 transition-all text-[15px] tracking-widest ${errors.password ? 'border-red-500' : 'border-gray-200'}`}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {errors.password && <span className="text-red-500 text-[11px] mt-1 block leading-tight">{errors.password.message}</span>}
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-[#222] hover:bg-black text-white py-3.5 rounded-xl font-bold text-[15px] transition-all active:scale-[0.98] mt-2 flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {isSubmitting && <Loader2 size={18} className="animate-spin" />}
                    {view === 'signin' ? 'Sign In' : view === 'signup' ? 'Create Account' : 'Send reset link'}
                  </button>
                </form>

                {view !== 'forgot' && (
                  <>
                    <div className="relative flex items-center my-6">
                      <div className="grow border-t border-gray-200"></div>
                      <span className="shrink-0 mx-4 text-gray-400 text-[12px] font-medium uppercase tracking-wider">or continue with</span>
                      <div className="grow border-t border-gray-200"></div>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <button 
                        onClick={handleGoogleLogin}
                        disabled={isSubmitting}
                        className="flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-gray-700 text-[14px] disabled:opacity-50"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                        Continue with Google
                      </button>
                    </div>
                  </>
                )}

                <div className="mt-8 text-center text-[14px]">
                  {view === 'signin' ? (
                    <p className="text-gray-500">
                      Don&apos;t have an account?{' '}
                      <button onClick={() => { setView('signup'); clearErrors(); reset(); }} className="text-[#222] font-bold hover:underline underline-offset-4 transition-all disabled:opacity-50" disabled={isSubmitting}>
                        Sign up
                      </button>
                    </p>
                  ) : view === 'signup' ? (
                    <p className="text-gray-500">
                      Already have an account?{' '}
                      <button onClick={() => { setView('signin'); clearErrors(); reset(); }} className="text-brand-navy font-bold hover:text-brand-coral transition-colors underline-offset-4 hover:underline disabled:opacity-50" disabled={isSubmitting}>
                        Sign in
                      </button>
                    </p>
                  ) : (
                    <p className="text-gray-500">
                      Remember your password?{' '}
                      <button onClick={() => { setView('signin'); clearErrors(); reset(); }} className="text-[#222] font-bold hover:underline underline-offset-4 transition-all disabled:opacity-50" disabled={isSubmitting}>
                        Back to sign in
                      </button>
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
