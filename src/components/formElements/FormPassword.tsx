"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import FormField from "./FormField";

type FormPasswordProps = {
  label?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  fieldClassName?: string;
} & Omit<React.ComponentProps<"input">, "type">;

export default function FormPassword({
  label,
  required,
  error,
  hint,
  fieldClassName,
  id,
  ...props
}: FormPasswordProps) {
  const [showPassword, setShowPassword] = useState(false);
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
      <div className="relative">
        <Input
          id={inputId}
          type={showPassword ? "text" : "password"}
          required={required}
          className="pr-10"
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-zinc-400 hover:text-zinc-600"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </FormField>
  );
}
