
import { FormFieldWrapper } from "./FormFieldWrapper";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock } from "lucide-react";
import { Control } from "react-hook-form";
import { ReviewFormValues } from "./ReviewRequestForm";

interface TimePickerFieldProps {
  control: Control<ReviewFormValues>;
  name: "time";
}

export const TimePickerField = ({ 
  control, 
  name 
}: TimePickerFieldProps) => {
  return (
    <FormFieldWrapper
      control={control}
      name={name}
      label="Preferred Time"
    >
      {(field) => (
        <div className="flex items-center">
          <Clock className="mr-2 h-4 w-4 opacity-50" />
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="09:00">9:00 AM</SelectItem>
              <SelectItem value="10:00">10:00 AM</SelectItem>
              <SelectItem value="11:00">11:00 AM</SelectItem>
              <SelectItem value="13:00">1:00 PM</SelectItem>
              <SelectItem value="14:00">2:00 PM</SelectItem>
              <SelectItem value="15:00">3:00 PM</SelectItem>
              <SelectItem value="16:00">4:00 PM</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </FormFieldWrapper>
  );
};
