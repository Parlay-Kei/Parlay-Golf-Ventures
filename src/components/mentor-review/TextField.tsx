
import { FormFieldWrapper } from "./FormFieldWrapper";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";
import { ReviewFormValues } from "./ReviewRequestForm";

interface TextFieldProps {
  control: Control<ReviewFormValues>;
  name: "name" | "email";
  label: string;
  placeholder?: string;
  type?: string;
}

export const TextField = ({ 
  control, 
  name, 
  label, 
  placeholder, 
  type = "text" 
}: TextFieldProps) => {
  return (
    <FormFieldWrapper
      control={control}
      name={name}
      label={label}
    >
      {(field) => (
        <Input 
          type={type} 
          placeholder={placeholder} 
          {...field} 
        />
      )}
    </FormFieldWrapper>
  );
};
