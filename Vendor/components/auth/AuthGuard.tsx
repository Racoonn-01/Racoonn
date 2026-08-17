"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { checkAuth, isAuthenticated, isLoading, profile } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    checkAuth().finally(() => setIsInitializing(false));
  }, [checkAuth]);

  useEffect(() => {
    if (isLoading || isInitializing) return;

    if (!isAuthenticated) {
      if (pathname !== "/" && pathname !== "/vendor/reset-password") {
        router.push("/");
      }
      return;
    }

    if (isAuthenticated && profile) {
       const status = profile.status?.toLowerCase();
       const onboardingCompleted = profile.onboardingStep !== undefined && profile.onboardingStep >= 10;

       if (status === "approved") {
          if (pathname === "/" || pathname.startsWith("/vendor/onboarding") || pathname === "/vendor/pending-approval" || pathname === "/vendor/rejected") {
             router.push("/vendor/dashboard");
          }
       } else if (status === "pending") {
          if (!onboardingCompleted) {
             if (!pathname.startsWith("/vendor/onboarding")) {
                router.push("/vendor/onboarding");
             }
          } else {
             if (pathname !== "/vendor/pending-approval") {
                router.push("/vendor/pending-approval");
             }
          }
       } else if (status === "rejected") {
          if (pathname !== "/vendor/rejected") {
             router.push("/vendor/rejected");
          }
       }
    }
  }, [isLoading, isInitializing, isAuthenticated, profile, pathname, router]);

  if (isLoading || isInitializing) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50/50">
        <Loader2 className="h-8 w-8 animate-spin text-[#E86A70]" />
      </div>
    );
  }

  return <>{children}</>;
}
