import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Step2PersonalInfo } from "./steps/individual/Step2PersonalInfo";
import { Step3AboutYou } from "./steps/individual/Step3AboutYou";
import { Step4Goals } from "./steps/individual/Step4Goals";
import { Step5Skills } from "./steps/individual/Step5Skills";
import { Step6Experience } from "./steps/individual/Step6Experience";
import { Step7Bio } from "./steps/individual/Step7Bio";

interface IndividualFormProps {
  currentStep: number;
  onStepComplete: (data: Record<string, any>) => void;
  onBack: () => void;
  formData: Record<string, any>;
}

// Step schemas
const step2Schema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
});

const step3Schema = z.object({
  age: z.string().min(1, "Please select your age range"),
  location: z.string().min(2, "Location is required"),
  occupation: z.string().min(2, "Occupation is required"),
});

const step4Schema = z.object({
  primaryGoal: z.string().min(1, "Please select a primary goal"),
  interests: z.string().min(10, "Please tell us more about your interests"),
});

const step5Schema = z.object({
  skillLevel: z.string().min(1, "Please select your skill level"),
  expertise: z.string().min(10, "Please describe your expertise"),
});

const step6Schema = z.object({
  experience: z.string().min(1, "Please select your experience level"),
  previousWork: z.string().min(10, "Please describe your previous work"),
});

const step7Schema = z.object({
  bio: z.string().min(20, "Bio must be at least 20 characters").max(500, "Bio must be less than 500 characters"),
  linkedIn: z.string().optional(),
  website: z.string().optional(),
});

export const IndividualForm = ({ currentStep, onStepComplete, onBack, formData }: IndividualFormProps) => {
  const getSchema = () => {
    switch (currentStep) {
      case 2: return step2Schema;
      case 3: return step3Schema;
      case 4: return step4Schema;
      case 5: return step5Schema;
      case 6: return step6Schema;
      case 7: return step7Schema;
      default: return z.record(z.string(), z.any());
    }
  };

  const { register, handleSubmit, formState: { errors }, setValue } = useForm({
    resolver: zodResolver(getSchema()),
    defaultValues: formData,
  });

  const onSubmit = (data: any) => {
    onStepComplete(data);
  };

  const renderStepContent = () => {
    const commonProps = { register, errors, setValue };
    
    switch (currentStep) {
      case 2:
        return <Step2PersonalInfo register={register} errors={errors} />;
      case 3:
        return <Step3AboutYou {...commonProps} />;
      case 4:
        return <Step4Goals {...commonProps} />;
      case 5:
        return <Step5Skills {...commonProps} />;
      case 6:
        return <Step6Experience {...commonProps} />;
      case 7:
        return <Step7Bio register={register} errors={errors} />;
      default:
        return null;
    }
  };

  return (
    <Card className="p-10 shadow-sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {renderStepContent()}
        
        <div className="flex justify-between pt-6">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onBack}
            className="px-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button 
            type="submit"
            className="px-8 bg-primary hover:bg-primary/90"
          >
            {currentStep === 7 ? "Process and set up" : "Save and continue"}
            {currentStep !== 7 && <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </form>
    </Card>
  );
};
