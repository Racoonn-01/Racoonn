"use client";

import React, { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

function VerifyEmployeeRedirectContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const email = searchParams.get("email") || "";
    const token = searchParams.get("token") || "";
    router.replace(`/login?verified=true&email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`);
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-3">
      <Loader2 className="w-10 h-10 animate-spin text-[#E86A70]" />
      <p className="text-sm font-semibold text-slate-300">Redirecting to Admin Portal Login...</p>
    </div>
  );
}

export default function VerifyEmployeePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-[#E86A70]" />
      </div>
    }>
      <VerifyEmployeeRedirectContent />
    </Suspense>
  );
}
