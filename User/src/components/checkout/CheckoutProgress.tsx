"use client";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { useCheckoutStore } from "@/store/checkoutStore";

export function CheckoutProgress() {
  const currentStep = useCheckoutStore((state) => state.currentStep);

  const steps = [
    { id: 1, label: "Hotel Selected", completed: currentStep > 1, active: currentStep === 1 },
    { id: 2, label: "Room Selected", completed: currentStep > 2, active: currentStep === 2 },
    { id: 3, label: "Guest Details", completed: currentStep > 3, active: currentStep === 3 },
    { id: 4, label: "Confirmation", completed: currentStep > 4, active: currentStep === 4 },
  ];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative overflow-x-auto pb-4 md:pb-0 hide-scrollbar">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-col items-center relative z-10 min-w-[80px] md:min-w-0 flex-1">
            <motion.div
              initial={false}
              animate={{
                backgroundColor: step.completed || step.active ? "#E86A70" : "#DCE8F5",
                color: step.completed || step.active ? "#FFFFFF" : "#333333",
              }}
              className="w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center font-bold text-[10px] md:text-sm mb-1.5 md:mb-2 shadow-sm relative z-20"
            >
              {step.completed ? <Check className="w-3 h-3 md:w-4 md:h-4 text-white" /> : step.active ? <span className="w-1.5 h-1.5 md:w-2.5 md:h-2.5 bg-white rounded-full" /> : step.id}
            </motion.div>
            <span
              className={`text-[10px] md:text-sm whitespace-nowrap font-medium text-center ${
                step.completed || step.active ? "text-brand-coral" : "text-gray-500"
              }`}
            >
              {step.label}
            </span>
            {index !== steps.length - 1 && (
              <div
                className={`absolute top-3 md:top-4 left-1/2 w-full h-[2px] -z-10 ${
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
