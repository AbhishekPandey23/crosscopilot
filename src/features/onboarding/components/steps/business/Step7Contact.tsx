import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Step7ContactProps {
  register: UseFormRegister<any>;
  errors: FieldErrors;
}

export const Step7Contact = ({ register, errors }: Step7ContactProps) => {
  return (
    <>
      <h2 className="text-2xl font-semibold mb-6">Contact Information</h2>
      <div className="space-y-4">
        <div>
          <Label htmlFor="contactPerson" className="mb-2">Contact Person Name</Label>
          <Input
            id="contactPerson"
            {...register("contactPerson")}
            placeholder="John Doe"
          />
          {errors.contactPerson && (
            <p className="text-sm text-destructive mt-1">{errors.contactPerson.message as string}</p>
          )}
        </div>
        <div>
          <Label htmlFor="contactPhone" className="mb-2">Contact Phone</Label>
          <Input
            id="contactPhone"
            {...register("contactPhone")}
            placeholder="+1 (555) 000-0000"
          />
          {errors.contactPhone && (
            <p className="text-sm text-destructive mt-1">{errors.contactPhone.message as string}</p>
          )}
        </div>
        <div>
          <Label htmlFor="additionalInfo" className="mb-2">Additional Information (Optional)</Label>
          <Textarea
            id="additionalInfo"
            {...register("additionalInfo")}
            placeholder="Any additional details you'd like to share"
            rows={4}
          />
          {errors.additionalInfo && (
            <p className="text-sm text-destructive mt-1">{errors.additionalInfo.message as string}</p>
          )}
        </div>
      </div>
    </>
  );
};
