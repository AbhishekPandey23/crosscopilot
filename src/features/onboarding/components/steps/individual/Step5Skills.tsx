import { UseFormRegister, FieldErrors, UseFormSetValue } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Step5SkillsProps {
  register: UseFormRegister<any>;
  errors: FieldErrors;
  setValue: UseFormSetValue<any>;
}

export const Step5Skills = ({ register, errors, setValue }: Step5SkillsProps) => {
  return (
    <>
      <h2 className="text-2xl font-semibold mb-6">Skills & Expertise</h2>
      <div className="space-y-4">
        <div>
          <Label htmlFor="skillLevel" className="mb-2">Skill Level</Label>
          <Select onValueChange={(value) => setValue("skillLevel", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select your skill level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
              <SelectItem value="expert">Expert</SelectItem>
            </SelectContent>
          </Select>
          {errors.skillLevel && (
            <p className="text-sm text-destructive mt-1">{errors.skillLevel.message as string}</p>
          )}
        </div>
        <div>
          <Label htmlFor="expertise" className="mb-2">Describe your expertise</Label>
          <Textarea
            id="expertise"
            {...register("expertise")}
            placeholder="Tell us about your key skills and areas of expertise"
            rows={4}
          />
          {errors.expertise && (
            <p className="text-sm text-destructive mt-1">{errors.expertise.message as string}</p>
          )}
        </div>
      </div>
    </>
  );
};
