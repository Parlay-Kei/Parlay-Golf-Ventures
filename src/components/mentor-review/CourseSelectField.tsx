
import { FormFieldWrapper } from "./FormFieldWrapper";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Control } from "react-hook-form";
import { ReviewFormValues } from "./ReviewRequestForm";

interface CourseSelectFieldProps {
  control: Control<ReviewFormValues>;
  name: "course";
}

export const CourseSelectField = ({ 
  control, 
  name 
}: CourseSelectFieldProps) => {
  return (
    <FormFieldWrapper
      control={control}
      name={name}
      label="Select Course"
    >
      {(field) => (
        <Select onValueChange={field.onChange} defaultValue={field.value}>
          <SelectTrigger>
            <SelectValue placeholder="Select a course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="short-game">Short Game Secrets</SelectItem>
            <SelectItem value="basics">Breaking Down the Basics</SelectItem>
            <SelectItem value="mental-game">Mastering the Mental Game</SelectItem>
          </SelectContent>
        </Select>
      )}
    </FormFieldWrapper>
  );
};
