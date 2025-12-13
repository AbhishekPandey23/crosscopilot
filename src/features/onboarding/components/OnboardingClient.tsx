"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Building2, User } from "lucide-react";
import { IndividualForm } from "./IndividualForm";
import { BusinessForm } from "./BusinessForm";
import { useOnboardingStore } from "@/features/onboarding/stores/onboarding-store";
import { StepsSidebar } from "./StepsSidebar";
import { OnboardingNavbar } from "./OnBoardingNavbar";
import { useEffect } from "react";
import { useOnboardingAPI } from "@/features/onboarding/hooks/use-onboarding-api";
import { toast } from "sonner";

type UserType = "individual" | "business" | null;

interface OnboardingClientProps {
  initialStep: number;
  initialUserType: UserType;
  initialData: Record<string, any>;
}

export default function OnboardingClient({
  initialStep,
  initialUserType,
  initialData,
}: OnboardingClientProps) {
  const router = useRouter();
  const {
    currentStep,
    userType,
    formData,
    setUserType,
    updateFormData,
    nextStep,
    previousStep,
    initializeFromServer,
  } = useOnboardingStore();

  const { saveStep, completeOnboarding, isSaving, isCompleting } = useOnboardingAPI();

  const totalSteps = 7;

  // Initialize from server data once
  useEffect(() => {
    if (initialStep > 1 || initialUserType || Object.keys(initialData).length > 0) {
      initializeFromServer(initialStep, initialUserType, initialData);
    }
  }, []); // Only run once on mount

  const handleUserTypeSelect = async (type: UserType) => {
    setUserType(type);
    
    // Save user type selection to Redis
    try {
      const apiType = type === "individual" ? "individual" : "business";
      await saveStep(apiType, "step1", { userType: type });
    } catch (error) {
      console.error("Failed to save user type:", error);
    }
  };

  const handleStepComplete = async (data: Record<string, any>) => {
    updateFormData(data);

    // Save step data to Redis
    const apiType = userType === "individual" ? "individual" : "business";
    const stepKey = `step${currentStep}`;

    try {
      await saveStep(apiType, stepKey, data);

      if (currentStep < totalSteps) {
        nextStep();
      } else {
        // All steps completed - save to database and redirect
        await completeOnboarding(apiType);
      }
    } catch (error) {
      console.error("Failed to save step:", error);
      toast.error("Failed to save your progress. Please try again.");
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      previousStep();
    }
  };

  return (
    <div className="min-h-screen w-full bg-background flex flex-col">
      {/* Navbar */}
      <OnboardingNavbar />

      {/* Main content with sidebar */}
      <div className="flex-1 flex">
        {/* Sidebar - Only show after step 1 */}
        {currentStep > 1 && userType && (
          <StepsSidebar currentStep={currentStep} userType={userType} />
        )}

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-3xl">
            {/* Step 1: User Type Selection */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center mb-12">
                  <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Welcome Aboard
                  </h1>
                  <p className="text-muted-foreground">
                    Let's get you set up in just a few steps
                  </p>
                </div>

                <Card className="p-8 text-center border-2">
                  <h2 className="text-2xl font-semibold mb-6">
                    What brings you here today?
                  </h2>
                  <p className="text-muted-foreground mb-8">
                    Choose the option that best describes you
                  </p>

                  <div className="grid md:grid-cols-2 gap-6">
                    <button
                      onClick={() => handleUserTypeSelect("individual")}
                      className="group relative p-8 rounded-lg border-2 border-border hover:border-primary transition-all duration-300 bg-card hover:shadow-lg hover:scale-[1.02]"
                    >
                      <div className="flex flex-col items-center space-y-4">
                        <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          <User className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold mb-2">
                            Individual
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            I'm here for personal use
                          </p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleUserTypeSelect("business")}
                      className="group relative p-8 rounded-lg border-2 border-border hover:border-primary transition-all duration-300 bg-card hover:shadow-lg hover:scale-[1.02]"
                    >
                      <div className="flex flex-col items-center space-y-4">
                        <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          <Building2 className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold mb-2">
                            Business
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            I'm representing a company
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>
                </Card>
              </div>
            )}

            {/* Steps 2-7: Dynamic Forms */}
            {currentStep > 1 && userType && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500 w-full">
                {/* Step Indicator */}
                <div className="mb-8 text-right">
                  <span className="text-sm font-medium text-primary uppercase tracking-wider">
                    Step {currentStep} of {totalSteps}
                  </span>
                </div>

                {userType === "individual" ? (
                  <IndividualForm
                    currentStep={currentStep}
                    onStepComplete={handleStepComplete}
                    onBack={handleBack}
                    formData={formData}
                  />
                ) : (
                  <BusinessForm
                    currentStep={currentStep}
                    onStepComplete={handleStepComplete}
                    onBack={handleBack}
                    formData={formData}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
