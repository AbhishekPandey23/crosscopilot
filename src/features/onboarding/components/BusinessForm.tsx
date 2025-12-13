import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Step2CompanyInfo } from "./steps/business/Step2CompanyInfo";
import { Step3IndustryType } from "./steps/business/Step3IndustryType";
import { Step4CompanyDetails } from "./steps/business/Step4CompanyDetails";
import { Step5Goals } from "./steps/business/Step5Goals";
import { Step6Budget } from "./steps/business/Step6Budget";
import { Step7Contact } from "./steps/business/Step7Contact";

interface BusinessFormProps {
  currentStep: number;
  onStepComplete: (data: Record<string, any>) => void;
  onBack: () => void;
  formData: Record<string, any>;
}

// Step schemas for business
const step2Schema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  registrationNumber: z.string().min(2, "Registration number is required"),
  website: z.string().url("Invalid URL").or(z.literal("")),
  contactEmail: z.string().email("Invalid email address"),
});

const step3Schema = z.object({
  industry: z.string().min(1, "Please select your industry"),
  businessType: z.string().min(1, "Please select business type"),
  description: z.string().min(20, "Description must be at least 20 characters"),
});

const step4Schema = z.object({
  teamSize: z.string().min(1, "Please select team size"),
  location: z.string().min(2, "Location is required"),
  foundedYear: z.string().min(4, "Please enter a valid year"),
});

const step5Schema = z.object({
  primaryGoal: z.string().min(1, "Please select a primary goal"),
  targetMarket: z.string().min(10, "Please describe your target market"),
});

const step6Schema = z.object({
  budget: z.string().min(1, "Please select a budget range"),
  timeline: z.string().min(1, "Please select a timeline"),
  requirements: z.string().min(20, "Please describe your requirements"),
});

const step7Schema = z.object({
  contactPerson: z.string().min(2, "Contact person name is required"),
  contactPhone: z.string().min(10, "Phone number must be at least 10 digits"),
  additionalInfo: z.string().optional(),
});

export const BusinessForm = ({ currentStep, onStepComplete, onBack, formData }: BusinessFormProps) => {
  const getSchema = () => {
    switch (currentStep) {
      case 2: return step2Schema;
      case 3: return step3Schema;
      case 4: return step4Schema;
      case 5: return step5Schema;
      case 6: return step6Schema;
      case 7: return step7Schema;
      default: return z.record(z.string(),z.any());
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
        return <Step2CompanyInfo register={register} errors={errors} />;
      case 3:
        return <Step3IndustryType {...commonProps} />;
      case 4:
        return <Step4CompanyDetails {...commonProps} />;
      case 5:
        return <Step5Goals {...commonProps} />;
      case 6:
        return <Step6Budget {...commonProps} />;
      case 7:
        return <Step7Contact register={register} errors={errors} />;
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
