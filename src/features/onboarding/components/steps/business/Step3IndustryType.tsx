import { UseFormRegister, FieldErrors, UseFormSetValue } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Step3IndustryTypeProps {
  register: UseFormRegister<any>;
  errors: FieldErrors;
  setValue: UseFormSetValue<any>;
}

export const Step3IndustryType = ({ register, errors, setValue }: Step3IndustryTypeProps) => {
  return (
    <>
      <h2 className="text-2xl font-semibold mb-6">Industry & Business Type</h2>
      <div className="space-y-4">
        <div>
          <Label htmlFor="industry" className="mb-2">Industry</Label>
          <Select onValueChange={(value) => setValue("industry", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select your industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="technology">Technology</SelectItem>
              <SelectItem value="healthcare">Healthcare</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="retail">Retail</SelectItem>
              <SelectItem value="manufacturing">Manufacturing</SelectItem>
              <SelectItem value="education">Education</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          {errors.industry && (
            <p className="text-sm text-destructive mt-1">{errors.industry.message as string}</p>
          )}
        </div>
        <div>
          <Label htmlFor="businessType" className="mb-2">Business Type</Label>
          <Select onValueChange={(value) => setValue("businessType", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select business type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="b2b">B2B</SelectItem>
              <SelectItem value="b2c">B2C</SelectItem>
              <SelectItem value="b2b2c">B2B2C</SelectItem>
              <SelectItem value="marketplace">Marketplace</SelectItem>
            </SelectContent>
          </Select>
          {errors.businessType && (
            <p className="text-sm text-destructive mt-1">{errors.businessType.message as string}</p>
          )}
        </div>
        <div>
          <Label htmlFor="description" className="mb-2">Business Description</Label>
          <Textarea
            id="description"
            {...register("description")}
            placeholder="Describe what your business does"
            rows={4}
          />
          {errors.description && (
            <p className="text-sm text-destructive mt-1">{errors.description.message as string}</p>
          )}
        </div>
      </div>
    </>
  );
};
