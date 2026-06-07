"use client";

import { Select } from "@/components/ui/select";
import FormField from "./FormField";

type Option = {
  value: string;
  label: string;
};

type FormSelectProps = {
  label?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  fieldClassName?: string;
  options: Option[];
  placeholder?: string;
} & Omit<React.ComponentProps<"select">, "children">;

export default function FormSelect({
  label,
  required,
  error,
  hint,
  fieldClassName,
  options,
  placeholder,
  id,
  ...props
}: FormSelectProps) {
  const selectId = id ?? props.name;

  return (
    <FormField
      label={label}
      htmlFor={selectId}
      required={required}
      error={error}
      hint={hint}
      className={fieldClassName}
    >
      <Select id={selectId} required={required} {...props}>
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </FormField>
  );
}
