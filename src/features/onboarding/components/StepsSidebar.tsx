import { Mail, Settings, PaperclipIcon, Tag, User, Building2, Briefcase, Target, DollarSign, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepsSidebarProps {
  currentStep: number;
  userType: "individual" | "business" | null;
}

const individualSteps = [
  { number: 1, icon: User, title: "User Type", description: "Choose your account type" },
  { number: 2, icon: User, title: "Personal Info", description: "Tell us about yourself" },
  { number: 3, icon: Briefcase, title: "About You", description: "Your background" },
  { number: 4, icon: Target, title: "Goals", description: "What you want to achieve" },
  { number: 5, icon: Settings, title: "Skills", description: "Your expertise" },
  { number: 6, icon: Briefcase, title: "Experience", description: "Your work history" },
  { number: 7, icon: PaperclipIcon, title: "Bio", description: "Tell your story" },
];

const businessSteps = [
  { number: 1, icon: Building2, title: "User Type", description: "Choose your account type" },
  { number: 2, icon: Building2, title: "Company Info", description: "Your company details" },
  { number: 3, icon: Tag, title: "Industry Type", description: "Business category" },
  { number: 4, icon: Settings, title: "Company Details", description: "More information" },
  { number: 5, icon: Target, title: "Goals", description: "Business objectives" },
  { number: 6, icon: DollarSign, title: "Budget", description: "Financial planning" },
  { number: 7, icon: Phone, title: "Contact", description: "How to reach you" },
];

export const StepsSidebar = ({ currentStep, userType }: StepsSidebarProps) => {
  const steps = userType === "individual" ? individualSteps : businessSteps;

  return (
    <div className="w-full lg:w-96 bg-[hsl(var(--sidebar-step-bg))] p-8 space-y-6">
      {/* Info Banner */}
      <div className="bg-[hsl(var(--sidebar-info-bg))] border border-[hsl(var(--sidebar-info-text))]/20 rounded-lg p-4 flex items-start gap-3">
        <div className="mt-0.5">
          <div className="w-5 h-5 rounded-full border-2 border-[hsl(var(--sidebar-info-text))] flex items-center justify-center">
            <span className="text-xs text-[hsl(var(--sidebar-info-text))] font-bold">i</span>
          </div>
        </div>
        <p className="text-sm text-[hsl(var(--sidebar-info-text))]">
          Get started by setting up your workspace and company email.
        </p>
      </div>

      {/* Steps List */}
      <div className="space-y-4">
        {steps.map((step) => {
          const Icon = step.icon;
          const isCompleted = currentStep > step.number;
          const isCurrent = currentStep === step.number;
          
          return (
            <div
              key={step.number}
              className={cn(
                "flex items-start gap-4 transition-opacity",
                !isCurrent && !isCompleted && "opacity-50"
              )}
            >
              {/* Icon Circle */}
              <div
                className={cn(
                  "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                  isCurrent || isCompleted
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
              </div>

              {/* Step Content */}
              <div className="flex-1 pt-2">
                <h3 className="font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
