"use client";

import { client } from "@/lib/orpc";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function useOnboardingAPI() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const saveStep = async (
    type: "individual" | "business",
    step: string,
    data: Record<string, any>
  ) => {
    try {
      setIsSaving(true);
      const result = await client.onboarding.saveStep({
        type,
        step,
        data,
      });

      return result;
    } catch (error) {
      console.error("Error saving step:", error);
      toast.error("Failed to save progress. Please try again.");
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const completeOnboarding = async (type: "individual" | "business") => {
    try {
      setIsCompleting(true);
      const result = await client.onboarding.completeOnboarding({ type });

      if (result.success) {
        toast.success("Onboarding completed successfully!");
        router.push("/dashboard");
        router.refresh();
      }

      return result;
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast.error("Failed to complete onboarding. Please try again.");
      throw error;
    } finally {
      setIsCompleting(false);
    }
  };

  return {
    saveStep,
    completeOnboarding,
    isSaving,
    isCompleting,
  };
}
