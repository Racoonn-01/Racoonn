"use client";

import { useState, useEffect } from "react";

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
import { Step10Review } from "@/components/onboarding/Step10Review";

export default function OnboardingPage() {

  const { profile, user, checkAuth } = useAuthStore();
  
  // Use profile's onboardingStep if available, otherwise default to 0
  const [step, setStep] = useState(profile?.onboardingStep || 0);

  // Sync step changes to Appwrite
  useEffect(() => {
    // Also save to localStorage as a super fast fallback
    localStorage.setItem("racoonn_onboarding_step", step.toString());
    
    // Only update Appwrite if the local step is strictly greater than the profile's step, 
    // OR if we are just starting and the profile hasn't caught up. 
    // This prevents overwriting the step back to 9 when handleCompleteOnboarding sets it to 10.
    if (user && profile && step > (profile.onboardingStep || 0)) {
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

  const nextStep = () => setStep((s) => Math.min(s + 1, 10));
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  if (step === 0) return <WelcomeScreen onNext={nextStep} />;

  const handleCompleteOnboarding = async () => {
    if (user) {
      try {
        await databases.updateDocument(
          appwriteConfig.databaseId,
          appwriteConfig.vendorCollectionId,
          user.$id,
          { onboardingStep: 10 }
        );
        
        // Trigger verification email
        try {
          await fetch('/api/vendor/onboarding-email', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ email: user.email, name: profile?.businessName || profile?.firstName || user.name })
          });
        } catch (emailError) {
          console.error("Failed to send onboarding email", emailError);
        }

        await checkAuth(); // AuthGuard will automatically redirect to pending-approval
      } catch (e) {
        console.error("Failed to complete onboarding", e);
      }
    }
  };

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
      case 9: return <Step10Review onSubmit={handleCompleteOnboarding} onBack={prevStep} />;
      case 10: return (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E86A70] mb-4"></div>
          <h2 className="text-xl font-bold text-slate-800">Redirecting to Dashboard...</h2>
          <p className="text-slate-500 mt-2">Your application has been submitted.</p>
        </div>
      );
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
