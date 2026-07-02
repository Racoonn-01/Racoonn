"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { databases, appwriteConfig } from "@/lib/appwrite/client";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { WelcomeScreen } from "@/components/onboarding/WelcomeScreen";
import { Step1Account } from "@/components/onboarding/Step1Account";
import { Step2Verification } from "@/components/onboarding/Step2Verification";
import { Step3Business } from "@/components/onboarding/Step3Business";
import { Step4Property } from "@/components/onboarding/Step4Property";
import { Step5Rooms } from "@/components/onboarding/Step5Rooms";
import { Step6Media } from "@/components/onboarding/Step6Media";
import { Step7Amenities } from "@/components/onboarding/Step7Amenities";
import { Step8Banking } from "@/components/onboarding/Step8Banking";
import { Step9KYC } from "@/components/onboarding/Step9KYC";
import { Step10Review } from "@/components/onboarding/Step10Review";
import { ApprovalPending } from "@/components/onboarding/ApprovalPending";

export default function OnboardingPage() {
  const router = useRouter();
  const { profile, user } = useAuthStore();
  
  // Use profile's onboardingStep if available, otherwise default to 0
  const [step, setStep] = useState(profile?.onboardingStep || 0);

  // Sync step changes to Appwrite
  useEffect(() => {
    // Also save to localStorage as a super fast fallback
    localStorage.setItem("racoonn_onboarding_step", step.toString());
    
    // Only update Appwrite if the step is actually changing and we have a user
    if (user && profile && step !== profile.onboardingStep) {
      databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.vendorCollectionId,
        user.$id,
        { onboardingStep: step }
      ).catch(e => console.error("Failed to sync onboarding step", e));
    }
  }, [step, user, profile]);

  const [hasSyncedInitialStep, setHasSyncedInitialStep] = useState(false);

  // Update local state if profile loads asynchronously after mount
  useEffect(() => {
    if (profile?.onboardingStep && !hasSyncedInitialStep) {
      setStep(profile.onboardingStep);
      setHasSyncedInitialStep(true);
    }
  }, [profile?.onboardingStep, hasSyncedInitialStep]);

  const nextStep = () => setStep((s) => Math.min(s + 1, 12));
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  // If we are on the Welcome Screen (0) or Approval Screen (11), they are full screen.
  if (step === 0) return <WelcomeScreen onNext={nextStep} />;
  if (step === 11) return <ApprovalPending />;

  const renderStepContent = () => {
    switch (step) {
      case 1: return <Step1Account onNext={nextStep} />;
      case 2: return <Step2Verification onNext={nextStep} onBack={prevStep} />;
      case 3: return <Step3Business onNext={nextStep} onBack={prevStep} />;
      case 4: return <Step4Property onNext={nextStep} onBack={prevStep} />;
      case 5: return <Step5Rooms onNext={nextStep} onBack={prevStep} />;
      case 6: return <Step6Media onNext={nextStep} onBack={prevStep} />;
      case 7: return <Step7Amenities onNext={nextStep} onBack={prevStep} />;
      case 8: return <Step8Banking onNext={nextStep} onBack={prevStep} />;
      case 9: return <Step9KYC onNext={nextStep} onBack={prevStep} />;
      case 10: return <Step10Review onSubmit={() => router.push('/vendor/dashboard')} onBack={prevStep} />;
      default: return null;
    }
  };

  return (
    <OnboardingLayout currentStep={step}>
      <AnimatePresence mode="wait">
        {renderStepContent()}
      </AnimatePresence>
    </OnboardingLayout>
  );
}
