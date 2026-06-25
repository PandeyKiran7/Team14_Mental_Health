import { Globe, HeartPulse } from "lucide-react";
import { homeContent } from "@/constants/homeContent";
import SectionBand from "./SectionBand";
import SectionHeading from "./SectionHeading";

export default function DiabetesStatisticsSection() {
  const { statistics } = homeContent;

  return (
    <SectionBand id={statistics.id}>
      <SectionHeading title={statistics.title} />
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {statistics.items.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-teal-100 bg-white p-8 text-center"
          >
            <p className="text-3xl font-bold text-teal-700 md:text-4xl">
              {stat.value}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {statistics.highlights.map((item, index) => (
          <div
            key={item.title}
            className="flex gap-4 rounded-2xl border border-teal-100 bg-white p-6"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700">
              {index === 0 ? (
                <Globe className="h-5 w-5" aria-hidden />
              ) : (
                <HeartPulse className="h-5 w-5" aria-hidden />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-teal-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                {item.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </SectionBand>
  );
}
