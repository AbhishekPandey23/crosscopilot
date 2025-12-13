import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Step2PersonalInfoProps {
  register: UseFormRegister<any>;
  errors: FieldErrors;
}

export const Step2PersonalInfo = ({ register, errors }: Step2PersonalInfoProps) => {
  return (
    <>
      <h2 className="text-2xl font-semibold mb-6">Personal Information</h2>
      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName" className="mb-2">First Name</Label>
            <Input id="firstName" {...register("firstName")} placeholder="John" />
            {errors.firstName && (
              <p className="text-sm text-destructive mt-1">{errors.firstName.message as string}</p>
            )}
          </div>
          <div>
            <Label htmlFor="lastName" className="mb-2">Last Name</Label>
            <Input id="lastName" {...register("lastName")} placeholder="Doe" />
            {errors.lastName && (
              <p className="text-sm text-destructive mt-1">{errors.lastName.message as string}</p>
            )}
          </div>
        </div>
        <div>
          <Label htmlFor="email" className="mb-2">Email Address</Label>
          <Input id="email" type="email" {...register("email")} placeholder="john@example.com" />
          {errors.email && (
            <p className="text-sm text-destructive mt-1">{errors.email.message as string}</p>
          )}
        </div>
        <div>
          <Label htmlFor="phone" className="mb-2">Phone Number</Label>
          <Input id="phone" {...register("phone")} placeholder="+1 (555) 000-0000" />
          {errors.phone && (
            <p className="text-sm text-destructive mt-1">{errors.phone.message as string}</p>
          )}
        </div>
      </div>
    </>
  );
};
