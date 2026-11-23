"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";

export default function RejectedPage() {
  const { logout } = useAuthStore();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white max-w-md w-full rounded-3xl p-8 shadow-xl text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="text-red-500 w-10 h-10" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-3">Application Rejected</h1>
        <p className="text-slate-500 font-medium mb-8">
          We're sorry, but your vendor application has been rejected at this time. Please contact support for more details or to appeal this decision.
        </p>
        <div className="flex flex-col gap-3">
          <Button 
            className="w-full rounded-xl h-12 bg-slate-900 text-white font-bold hover:bg-slate-800"
            onClick={() => window.location.href = "mailto:support@racoonn.com"}
          >
            Contact Support
          </Button>
          <Button 
            variant="outline" 
            className="w-full rounded-xl h-12 font-bold"
            onClick={() => logout()}
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
