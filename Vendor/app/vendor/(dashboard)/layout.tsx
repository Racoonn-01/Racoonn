"use client";

import { AppSidebar } from "@/components/layout/AppSidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  if (!(WebSocket.prototype as any).__patchedForHmr) {
    (WebSocket.prototype as any).__patchedForHmr = true;
    const originalSend = WebSocket.prototype.send;
    WebSocket.prototype.send = function (data: any) {
      if (this.readyState === WebSocket.CONNECTING) {
        this.addEventListener("open", () => {
          try {
            originalSend.call(this, data);
          } catch {}
        }, { once: true });
      } else if (this.readyState === WebSocket.OPEN) {
        originalSend.call(this, data);
      }
    };
  }
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { checkAuth, isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Optionally protect routes by redirecting to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/vendor");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50/50">
        <Loader2 className="h-8 w-8 animate-spin text-[#E86A70]" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex w-full min-h-screen bg-slate-50/50">
        <AppSidebar />
        <div className="flex flex-col flex-1 w-full">
          <TopNavbar />
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
