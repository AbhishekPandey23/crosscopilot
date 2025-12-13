import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Step2CompanyInfoProps {
  register: UseFormRegister<any>;
  errors: FieldErrors;
}

export const Step2CompanyInfo = ({ register, errors }: Step2CompanyInfoProps) => {
  return (
    <>
      <h2 className="text-2xl font-semibold mb-6">Company Information</h2>
      <div className="space-y-4">
        <div>
          <Label htmlFor="companyName" className="mb-2">Company Name</Label>
          <Input id="companyName" {...register("companyName")} placeholder="Acme Corporation" />
          {errors.companyName && (
            <p className="text-sm text-destructive mt-1">{errors.companyName.message as string}</p>
          )}
        </div>
        <div>
          <Label htmlFor="registrationNumber" className="mb-2">Registration Number</Label>
          <Input id="registrationNumber" {...register("registrationNumber")} placeholder="12345678" />
          {errors.registrationNumber && (
            <p className="text-sm text-destructive mt-1">{errors.registrationNumber.message as string}</p>
          )}
        </div>
        <div>
          <Label htmlFor="website" className="mb-2">Company Website</Label>
          <Input id="website" {...register("website")} placeholder="https://example.com" />
          {errors.website && (
            <p className="text-sm text-destructive mt-1">{errors.website.message as string}</p>
          )}
        </div>
        <div>
          <Label htmlFor="contactEmail" className="mb-2">Contact Email</Label>
          <Input id="contactEmail" type="email" {...register("contactEmail")} placeholder="contact@example.com" />
          {errors.contactEmail && (
            <p className="text-sm text-destructive mt-1">{errors.contactEmail.message as string}</p>
          )}
        </div>
      </div>
    </>
  );
};
