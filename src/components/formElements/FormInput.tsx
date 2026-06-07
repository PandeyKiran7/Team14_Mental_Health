"use client";

import { Input } from "@/components/ui/input";
import FormField from "./FormField";

type FormInputProps = {
  label?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  fieldClassName?: string;
} & React.ComponentProps<"input">;

export default function FormInput({
  label,
  required,
  error,
  hint,
  fieldClassName,
  id,
  ...props
}: FormInputProps) {
  const inputId = id ?? props.name;

  return (
    <FormField
      label={label}
      htmlFor={inputId}
      required={required}
      error={error}
      hint={hint}
      className={fieldClassName}
    >
      <Input id={inputId} required={required} {...props} />
    </FormField>
  );
}
