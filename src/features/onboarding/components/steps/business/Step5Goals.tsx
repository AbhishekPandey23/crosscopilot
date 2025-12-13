import { UseFormRegister, FieldErrors, UseFormSetValue } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Step5GoalsProps {
  register: UseFormRegister<any>;
  errors: FieldErrors;
  setValue: UseFormSetValue<any>;
}

export const Step5Goals = ({ register, errors, setValue }: Step5GoalsProps) => {
  return (
    <>
      <h2 className="text-2xl font-semibold mb-6">Business Goals</h2>
      <div className="space-y-4">
        <div>
          <Label htmlFor="primaryGoal" className="mb-2">Primary Goal</Label>
          <Select onValueChange={(value) => setValue("primaryGoal", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select your primary goal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="growth">Business Growth</SelectItem>
              <SelectItem value="funding">Raise Funding</SelectItem>
              <SelectItem value="expansion">Market Expansion</SelectItem>
              <SelectItem value="product">Product Development</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          {errors.primaryGoal && (
            <p className="text-sm text-destructive mt-1">{errors.primaryGoal.message as string}</p>
          )}
        </div>
        <div>
          <Label htmlFor="targetMarket" className="mb-2">Target Market</Label>
          <Textarea
            id="targetMarket"
            {...register("targetMarket")}
            placeholder="Describe your target market and customers"
            rows={4}
          />
          {errors.targetMarket && (
            <p className="text-sm text-destructive mt-1">{errors.targetMarket.message as string}</p>
          )}
        </div>
      </div>
    </>
  );
};
