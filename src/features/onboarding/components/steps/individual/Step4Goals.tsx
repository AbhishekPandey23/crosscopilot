import { UseFormRegister, FieldErrors, UseFormSetValue } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Step4GoalsProps {
  register: UseFormRegister<any>;
  errors: FieldErrors;
  setValue: UseFormSetValue<any>;
}

export const Step4Goals = ({ register, errors, setValue }: Step4GoalsProps) => {
  return (
    <>
      <h2 className="text-2xl font-semibold mb-6">Your Goals</h2>
      <div className="space-y-4">
        <div>
          <Label htmlFor="primaryGoal" className="mb-2">Primary Goal</Label>
          <Select onValueChange={(value) => setValue("primaryGoal", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select your primary goal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="learning">Learning & Development</SelectItem>
              <SelectItem value="career">Career Advancement</SelectItem>
              <SelectItem value="networking">Networking</SelectItem>
              <SelectItem value="projects">Personal Projects</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          {errors.primaryGoal && (
            <p className="text-sm text-destructive mt-1">{errors.primaryGoal.message as string}</p>
          )}
        </div>
        <div>
          <Label htmlFor="interests" className="mb-2">Tell us about your interests</Label>
          <Textarea
            id="interests"
            {...register("interests")}
            placeholder="What are you passionate about?"
            rows={4}
          />
          {errors.interests && (
            <p className="text-sm text-destructive mt-1">{errors.interests.message as string}</p>
          )}
        </div>
      </div>
    </>
  );
};
