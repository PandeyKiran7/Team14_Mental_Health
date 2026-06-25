import { Activity, BookOpen, Calendar, type LucideIcon } from "lucide-react";
import { homeContent } from "@/constants/homeContent";
import SectionBand from "./SectionBand";
import SectionHeading from "./SectionHeading";

const iconMap: Record<
  (typeof homeContent.features.items)[number]["icon"],
  LucideIcon
> = {
  activity: Activity,
  calendar: Calendar,
  book: BookOpen,
};

export default function KeyFeaturesSection() {
  const { features } = homeContent;

  return (
    <SectionBand id={features.id} alt>
      <SectionHeading title={features.title} />
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {features.items.map((feature) => {
          const Icon = iconMap[feature.icon];
          return (
            <div
              key={feature.title}
              className="rounded-2xl border border-teal-100 bg-white p-8 text-center transition"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-teal-600 text-white">
                <Icon className="h-7 w-7" aria-hidden />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-teal-900">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </SectionBand>
  );
}
