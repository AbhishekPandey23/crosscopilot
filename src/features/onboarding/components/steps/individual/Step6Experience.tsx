import { UseFormRegister, FieldErrors, UseFormSetValue } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Step6ExperienceProps {
  register: UseFormRegister<any>;
  errors: FieldErrors;
  setValue: UseFormSetValue<any>;
}

export const Step6Experience = ({ register, errors, setValue }: Step6ExperienceProps) => {
  return (
    <>
      <h2 className="text-2xl font-semibold mb-6">Your Experience</h2>
      <div className="space-y-4">
        <div>
          <Label htmlFor="experience" className="mb-2">Years of Experience</Label>
          <Select onValueChange={(value) => setValue("experience", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select years of experience" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0-1">0-1 years</SelectItem>
              <SelectItem value="2-5">2-5 years</SelectItem>
              <SelectItem value="6-10">6-10 years</SelectItem>
              <SelectItem value="10+">10+ years</SelectItem>
            </SelectContent>
          </Select>
          {errors.experience && (
            <p className="text-sm text-destructive mt-1">{errors.experience.message as string}</p>
          )}
        </div>
        <div>
          <Label htmlFor="previousWork" className="mb-2">Tell us about your previous work</Label>
          <Textarea
            id="previousWork"
            {...register("previousWork")}
            placeholder="Describe your work history and notable projects"
            rows={4}
          />
          {errors.previousWork && (
            <p className="text-sm text-destructive mt-1">{errors.previousWork.message as string}</p>
          )}
        </div>
      </div>
    </>
  );
};
