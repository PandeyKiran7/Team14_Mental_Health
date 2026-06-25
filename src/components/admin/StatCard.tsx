import type { Icon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string | number;
  icon: Icon;
  accent?: "teal" | "amber" | "sky" | "emerald";
  className?: string;
};

const accentStyles = {
  teal: "bg-teal-50 text-teal-600",
  amber: "bg-amber-50 text-amber-600",
  sky: "bg-sky-50 text-sky-600",
  emerald: "bg-emerald-50 text-emerald-600",
};

export default function StatCard({
  label,
  value,
  icon: Icon,
  accent = "teal",
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-teal-100 bg-white p-5",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-zinc-500">{label}</p>
          <p
            className={cn(
              "mt-2 font-bold text-teal-900",
              typeof value === "number" ? "text-3xl" : "text-xl leading-snug",
            )}
          >
            {value}
          </p>
        </div>
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
            accentStyles[accent],
          )}
        >
          <Icon size={22} weight="duotone" />
        </span>
      </div>
    </div>
  );
}
