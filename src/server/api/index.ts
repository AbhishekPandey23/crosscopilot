import { getProgress } from "./routers/onboarding/getProgress";
import { saveStep } from "./routers/onboarding/saveStepData";
import { checkOnboarding } from "./routers/onboarding/checkOnboarding";
import { completeOnboarding } from "./routers/onboarding/completeOnboarding";

export const router = {
  onboarding: {
    getProgress: getProgress,
    saveStep: saveStep,
    checkOnboarding: checkOnboarding,
    completeOnboarding: completeOnboarding,
  },
  dashboard: {
    
  }
};
