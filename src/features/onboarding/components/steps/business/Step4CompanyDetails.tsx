import { UseFormRegister, FieldErrors, UseFormSetValue } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Step4CompanyDetailsProps {
  register: UseFormRegister<any>;
  errors: FieldErrors;
  setValue: UseFormSetValue<any>;
}

export const Step4CompanyDetails = ({ register, errors, setValue }: Step4CompanyDetailsProps) => {
  return (
    <>
      <h2 className="text-2xl font-semibold mb-6">Company Details</h2>
      <div className="space-y-4">
        <div>
          <Label htmlFor="teamSize" className="mb-2">Team Size</Label>
          <Select onValueChange={(value) => setValue("teamSize", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select team size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-10">1-10 employees</SelectItem>
              <SelectItem value="11-50">11-50 employees</SelectItem>
              <SelectItem value="51-200">51-200 employees</SelectItem>
              <SelectItem value="201-500">201-500 employees</SelectItem>
              <SelectItem value="500+">500+ employees</SelectItem>
            </SelectContent>
          </Select>
          {errors.teamSize && (
            <p className="text-sm text-destructive mt-1">{errors.teamSize.message as string}</p>
          )}
        </div>
        <div>
          <Label htmlFor="location" className="mb-2">Company Location</Label>
          <Input id="location" {...register("location")} placeholder="City, Country" />
          {errors.location && (
            <p className="text-sm text-destructive mt-1">{errors.location.message as string}</p>
          )}
        </div>
        <div>
          <Label htmlFor="foundedYear" className="mb-2">Year Founded</Label>
          <Input id="foundedYear" {...register("foundedYear")} placeholder="2020" />
          {errors.foundedYear && (
            <p className="text-sm text-destructive mt-1">{errors.foundedYear.message as string}</p>
          )}
        </div>
      </div>
    </>
  );
};
