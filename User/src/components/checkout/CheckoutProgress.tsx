"use client";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { useCheckoutStore } from "@/store/checkoutStore";
import { useSearchParams } from "next/navigation";

export function CheckoutProgress() {
  const currentStep = useCheckoutStore((state) => state.currentStep);
  const searchParams = useSearchParams();
  const hotelId = searchParams.get('hotelId') || useCheckoutStore.getState().selectedHotelId || '';
  const isPackage = hotelId.startsWith('pkg-');

  const steps = isPackage ? [
    { id: 1, label: "Package", fullLabel: "Package Selected", completed: currentStep > 1, active: currentStep === 1 },
    { id: 2, label: "Dates", fullLabel: "Dates Selected", completed: currentStep > 2, active: currentStep === 2 },
    { id: 3, label: "Guests", fullLabel: "Guest Details", completed: currentStep > 3, active: currentStep === 3 },
    { id: 4, label: "Confirm", fullLabel: "Confirmation", completed: currentStep > 4, active: currentStep === 4 },
  ] : [
    { id: 1, label: "Hotel", fullLabel: "Hotel Selected", completed: currentStep > 1, active: currentStep === 1 },
    { id: 2, label: "Room", fullLabel: "Room Selected", completed: currentStep > 2, active: currentStep === 2 },
    { id: 3, label: "Guests", fullLabel: "Guest Details", completed: currentStep > 3, active: currentStep === 3 },
    { id: 4, label: "Confirm", fullLabel: "Confirmation", completed: currentStep > 4, active: currentStep === 4 },
  ];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative w-full py-1">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-col items-center relative z-10 flex-1 px-0.5 sm:px-1">
            <motion.div
              initial={false}
              animate={{
                backgroundColor: step.completed || step.active ? "#E86A70" : "#DCE8F5",
                color: step.completed || step.active ? "#FFFFFF" : "#333333",
              }}
              className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center font-bold text-[10px] sm:text-xs md:text-sm mb-1 sm:mb-1.5 shadow-xs relative z-20"
            >
              {step.completed ? <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-white" /> : step.active ? <span className="w-1.5 h-1.5 md:w-2.5 md:h-2.5 bg-white rounded-full" /> : step.id}
            </motion.div>
            <span
              className={`text-[10px] sm:text-xs md:text-sm font-medium text-center truncate max-w-full ${
                step.completed || step.active ? "text-brand-coral font-bold" : "text-gray-500"
              }`}
            >
              <span className="inline md:hidden">{step.label}</span>
              <span className="hidden md:inline">{step.fullLabel}</span>
            </span>
            {index !== steps.length - 1 && (
              <div
                className={`absolute top-3 sm:top-3.5 md:top-4 left-1/2 w-full h-[2px] -z-10 ${
                  step.completed ? "bg-brand-coral" : "bg-[#DCE8F5]"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
