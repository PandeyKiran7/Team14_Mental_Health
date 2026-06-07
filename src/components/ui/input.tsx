import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 outline-none",
        "placeholder:text-zinc-400",
        "focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
