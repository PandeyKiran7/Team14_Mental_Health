import * as React from "react";
import { cn } from "@/lib/utils";

function Select({ className, children, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      className={cn(
        "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 outline-none",
        "focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export { Select };
