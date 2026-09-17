import { AlertCircle } from "lucide-react";
import Link from "next/link";

export function CancellationPolicy() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-brand-sky p-5">
      <h3 className="font-bold text-brand-navy mb-3 text-base flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-brand-coral" /> Cancellation Policy
      </h3>
      <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Free cancellation up to 24 hours before check-in.</li>
          <li>Free cancellation within 48 hours of booking, if check-in is at least 24 hours away.</li>
          <li>Later cancellations depend on the property’s cancellation policy.</li>
          <li>Contact us by email for cancellation requests.</li>
        </ul>
        <Link href="/terms#cancellations" className="inline-block text-brand-coral font-medium text-sm hover:underline outline-none">
          Read more
        </Link>
      </div>
    </div>
  );
}

