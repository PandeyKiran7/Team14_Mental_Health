import Link from "next/link";
import type { Icon } from "@phosphor-icons/react";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

type QuickActionCardProps = {
  href: string;
  title: string;
  description: string;
  icon: Icon;
  className?: string;
};

export default function QuickActionCard({
  href,
  title,
  description,
  icon: Icon,
  className,
}: QuickActionCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-start gap-4 rounded-xl border border-teal-100 bg-white p-5 transition hover:border-teal-200",
        className,
      )}
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 transition group-hover:bg-teal-100">
        <Icon size={22} weight="duotone" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="font-semibold text-zinc-800">{title}</p>
          <ArrowRightIcon
            size={16}
            className="shrink-0 text-teal-600 opacity-0 transition group-hover:opacity-100"
          />
        </div>
        <p className="mt-1 text-sm text-zinc-500">{description}</p>
      </div>
    </Link>
  );
}
