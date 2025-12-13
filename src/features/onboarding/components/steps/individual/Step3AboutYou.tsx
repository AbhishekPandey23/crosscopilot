import { UseFormRegister, FieldErrors, UseFormSetValue } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Step3AboutYouProps {
  register: UseFormRegister<any>;
  errors: FieldErrors;
  setValue: UseFormSetValue<any>;
}

export const Step3AboutYou = ({ register, errors, setValue }: Step3AboutYouProps) => {
  return (
    <>
      <h2 className="text-2xl font-semibold mb-6">About You</h2>
      <div className="space-y-4">
        <div>
          <Label htmlFor="age" className="mb-2">Age Range</Label>
          <Select onValueChange={(value) => setValue("age", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select age range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="18-24">18-24</SelectItem>
              <SelectItem value="25-34">25-34</SelectItem>
              <SelectItem value="35-44">35-44</SelectItem>
              <SelectItem value="45-54">45-54</SelectItem>
              <SelectItem value="55+">55+</SelectItem>
            </SelectContent>
          </Select>
          {errors.age && (
            <p className="text-sm text-destructive mt-1">{errors.age.message as string}</p>
          )}
        </div>
        <div>
          <Label htmlFor="location" className="mb-2">Location</Label>
          <Input id="location" {...register("location")} placeholder="City, Country" />
          {errors.location && (
            <p className="text-sm text-destructive mt-1">{errors.location.message as string}</p>
          )}
        </div>
        <div>
          <Label htmlFor="occupation" className="mb-2">Current Occupation</Label>
          <Input id="occupation" {...register("occupation")} placeholder="Software Developer" />
          {errors.occupation && (
            <p className="text-sm text-destructive mt-1">{errors.occupation.message as string}</p>
          )}
        </div>
      </div>
    </>
  );
};
