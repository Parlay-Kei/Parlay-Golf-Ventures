
import { FormFieldWrapper } from "./FormFieldWrapper";
import { Textarea } from "@/components/ui/textarea";
import { Control } from "react-hook-form";
import { ReviewFormValues } from "./ReviewRequestForm";

interface TextareaFieldProps {
  control: Control<ReviewFormValues>;
  name: "notes";
  label: string;
  placeholder?: string;
}

export const TextareaField = ({ 
  control, 
  name, 
  label, 
  placeholder
}: TextareaFieldProps) => {
  return (
    <FormFieldWrapper
      control={control}
      name={name}
      label={label}
    >
      {(field) => (
        <Textarea
          placeholder={placeholder}
          className="min-h-[120px]"
          {...field}
        />
      )}
    </FormFieldWrapper>
  );
};
