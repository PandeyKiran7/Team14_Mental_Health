"use client";

import * as React from "react";
import { CaretDownIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

function Select({ className, children, ...props }: React.ComponentProps<"select">) {
  return (
    <div className="relative">
      <select
        className={cn(
          "w-full appearance-none rounded-lg border border-zinc-300 bg-white px-4 py-2.5 pr-10 text-sm text-zinc-900 outline-none",
          "focus:border-teal-500 focus:ring-2 focus:ring-teal-100",
          "disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-500",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <CaretDownIcon
        size={16}
        weight="bold"
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500"
        aria-hidden
      />
    </div>
  );
}

export { Select };
