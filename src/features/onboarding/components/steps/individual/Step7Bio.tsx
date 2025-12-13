import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Step7BioProps {
  register: UseFormRegister<any>;
  errors: FieldErrors;
}

export const Step7Bio = ({ register, errors }: Step7BioProps) => {
  return (
    <>
      <h2 className="text-2xl font-semibold mb-6">Complete Your Profile</h2>
      <div className="space-y-4">
        <div>
          <Label htmlFor="bio" className="mb-2">Bio</Label>
          <Textarea
            id="bio"
            {...register("bio")}
            placeholder="Tell us a bit about yourself"
            rows={5}
          />
          {errors.bio && (
            <p className="text-sm text-destructive mt-1">{errors.bio.message as string}</p>
          )}
        </div>
        <div>
          <Label htmlFor="linkedIn" className="mb-2">LinkedIn Profile (Optional)</Label>
          <Input
            id="linkedIn"
            {...register("linkedIn")}
            placeholder="https://linkedin.com/in/yourprofile"
          />
          {errors.linkedIn && (
            <p className="text-sm text-destructive mt-1">{errors.linkedIn.message as string}</p>
          )}
        </div>
        <div>
          <Label htmlFor="website" className="mb-2">Personal Website (Optional)</Label>
          <Input
            id="website"
            {...register("website")}
            placeholder="https://yourwebsite.com"
          />
          {errors.website && (
            <p className="text-sm text-destructive mt-1">{errors.website.message as string}</p>
          )}
        </div>
      </div>
    </>
  );
};
