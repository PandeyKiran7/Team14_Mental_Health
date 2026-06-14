import { cn } from "@/lib/utils";

type DashboardHeroProps = {
  greeting: string;
  name: string;
  description: string;
  className?: string;
};

export default function DashboardHero({
  greeting,
  name,
  description,
  className,
}: DashboardHeroProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-600 via-teal-700 to-teal-900 px-6 py-8 text-white md:px-8",
        className,
      )}
    >
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
      <div className="absolute -bottom-8 left-1/3 h-28 w-28 rounded-full bg-white/5" />
      <div className="relative">
        <p className="text-sm font-medium text-teal-100">{greeting}</p>
        <h2 className="mt-1 text-2xl font-bold md:text-3xl">{name}</h2>
        <p className="mt-3 max-w-2xl text-sm text-teal-50 md:text-base">{description}</p>
      </div>
    </div>
  );
}

export function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
