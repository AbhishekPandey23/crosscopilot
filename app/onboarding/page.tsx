import { checkUserOnboarding } from "@/server/services/onboarding";
import { redirect } from "next/navigation";
import OnboardingClient from "@/features/onboarding/components/OnboardingClient";

export default async function OnboardingPage() {
  const status = await checkUserOnboarding();

  // If not logged in, redirect to login
  if (!status) {
    redirect("/api/auth/login");
  }

  // If onboarding is complete, redirect to dashboard
  if (status.isComplete) {
    redirect("/dashboard");
  }

  // Prepare initial data for client component
  const initialStep = status.currentStep;
  const initialUserType = 
    status.userType === "individual" 
      ? "individual" 
      : status.userType === "business" 
        ? "business" 
        : null;
  
  // Flatten Redis data for form
  const initialData = status.redisData
    ? Object.values(status.redisData).reduce(
        (acc, curr) => ({ ...acc, ...curr }),
        {}
      )
    : {};

  return (
    <OnboardingClient
      initialStep={initialStep}
      initialUserType={initialUserType}
      initialData={initialData}
    />
  );
}
