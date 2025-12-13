import { UseFormRegister, FieldErrors, UseFormSetValue } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Step6BudgetProps {
  register: UseFormRegister<any>;
  errors: FieldErrors;
  setValue: UseFormSetValue<any>;
}

export const Step6Budget = ({ register, errors, setValue }: Step6BudgetProps) => {
  return (
    <>
      <h2 className="text-2xl font-semibold mb-6">Budget & Timeline</h2>
      <div className="space-y-4">
        <div>
          <Label htmlFor="budget" className="mb-2">Budget Range</Label>
          <Select onValueChange={(value) => setValue("budget", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select budget range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="<10k">Less than $10,000</SelectItem>
              <SelectItem value="10k-50k">$10,000 - $50,000</SelectItem>
              <SelectItem value="50k-100k">$50,000 - $100,000</SelectItem>
              <SelectItem value="100k-500k">$100,000 - $500,000</SelectItem>
              <SelectItem value="500k+">$500,000+</SelectItem>
            </SelectContent>
          </Select>
          {errors.budget && (
            <p className="text-sm text-destructive mt-1">{errors.budget.message as string}</p>
          )}
        </div>
        <div>
          <Label htmlFor="timeline" className="mb-2">Project Timeline</Label>
          <Select onValueChange={(value) => setValue("timeline", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select timeline" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-3">1-3 months</SelectItem>
              <SelectItem value="3-6">3-6 months</SelectItem>
              <SelectItem value="6-12">6-12 months</SelectItem>
              <SelectItem value="12+">12+ months</SelectItem>
            </SelectContent>
          </Select>
          {errors.timeline && (
            <p className="text-sm text-destructive mt-1">{errors.timeline.message as string}</p>
          )}
        </div>
        <div>
          <Label htmlFor="requirements" className="mb-2">Project Requirements</Label>
          <Textarea
            id="requirements"
            {...register("requirements")}
            placeholder="Describe your project requirements and expectations"
            rows={4}
          />
          {errors.requirements && (
            <p className="text-sm text-destructive mt-1">{errors.requirements.message as string}</p>
          )}
        </div>
      </div>
    </>
  );
};
