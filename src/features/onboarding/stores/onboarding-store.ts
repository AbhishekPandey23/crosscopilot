import { create } from 'zustand';

type UserType = "individual" | "business" | null;

interface OnboardingState {
  currentStep: number;
  userType: UserType;
  formData: Record<string, any>;
  completedSteps: number[];
  setCurrentStep: (step: number) => void;
  setUserType: (type: UserType) => void;
  updateFormData: (data: Record<string, any>) => void;
  nextStep: () => void;
  previousStep: () => void;
  markStepComplete: (step: number) => void;
  canNavigateToStep: (step: number) => boolean;
  resetOnboarding: () => void;
  initializeFromServer: (step: number, type: UserType, data: Record<string, any>) => void;
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  currentStep: 1,
  userType: null,
  formData: {},
  completedSteps: [],
  setCurrentStep: (step) => {
    const state = get();
    // Only allow navigation to completed steps or current step
    if (state.canNavigateToStep(step)) {
      set({ currentStep: step });
    }
  },
  setUserType: (type) => set({ userType: type, currentStep: 2, completedSteps: [1] }),
  updateFormData: (data) => set((state) => ({ 
    formData: { ...state.formData, ...data } 
  })),
  nextStep: () => set((state) => {
    const newStep = Math.min(state.currentStep + 1, 7);
    return {
      currentStep: newStep,
      completedSteps: [...new Set([...state.completedSteps, state.currentStep])]
    };
  }),
  previousStep: () => set((state) => ({ 
    currentStep: Math.max(state.currentStep - 1, 1) 
  })),
  markStepComplete: (step) => set((state) => ({
    completedSteps: [...new Set([...state.completedSteps, step])]
  })),
  canNavigateToStep: (step) => {
    const state = get();
    return step === 1 || state.completedSteps.includes(step) || step === state.currentStep;
  },
  resetOnboarding: () => set({ 
    currentStep: 1, 
    userType: null, 
    formData: {},
    completedSteps: []
  }),
  initializeFromServer: (step, type, data) => set({
    currentStep: step,
    userType: type,
    formData: data,
    completedSteps: Array.from({ length: step - 1 }, (_, i) => i + 1),
  }),
}));
