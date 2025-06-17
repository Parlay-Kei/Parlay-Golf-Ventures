
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { FormFieldWrapper } from "./FormFieldWrapper";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { CalendarIcon } from "lucide-react";
import { Control } from "react-hook-form";
import { cn } from "@/lib/utils";
import { ReviewFormValues } from "./ReviewRequestForm";

interface DatePickerFieldProps {
  control: Control<ReviewFormValues>;
  name: "date";
}

export const DatePickerField = ({ 
  control, 
  name 
}: DatePickerFieldProps) => {
  return (
    <FormFieldWrapper
      control={control}
      name={name}
      label="Preferred Date"
    >
      {(field) => (
        <>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full pl-3 text-left font-normal",
                  !field.value && "text-muted-foreground"
                )}
              >
                {field.value ? (
                  format(field.value, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value}
                onSelect={field.onChange}
                disabled={(date) =>
                  date < new Date() || date > new Date(new Date().setMonth(new Date().getMonth() + 3))
                }
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </>
      )}
    </FormFieldWrapper>
  );
};
