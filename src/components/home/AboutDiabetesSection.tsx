import { Activity } from "lucide-react";
import { homeContent } from "@/constants/homeContent";
import SectionBand from "./SectionBand";
import SectionHeading from "./SectionHeading";

export default function AboutDiabetesSection() {
  const { about } = homeContent;

  return (
    <SectionBand id={about.id}>
      <SectionHeading title={about.title} />
      <div className="mt-10 space-y-8">
        <div className="rounded-2xl border border-teal-100 bg-white p-6 md:p-8">
          <h3 className="text-xl font-semibold text-teal-800">
            {about.whatIs.title}
          </h3>
          <p className="mt-3 leading-relaxed text-zinc-600">{about.whatIs.text}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {about.types.map((type) => (
            <div
              key={type.name}
              className="rounded-2xl border border-teal-100 bg-gradient-to-b from-white to-teal-50/40 p-6"
            >
              <h3 className="text-lg font-semibold text-teal-900">{type.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                {type.description}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-teal-200 bg-teal-600/5 p-6 md:flex-row md:items-start md:p-8">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-600 text-white">
            <Activity className="h-6 w-6" aria-hidden />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-teal-800">
              {about.monitoring.title}
            </h3>
            <p className="mt-2 leading-relaxed text-zinc-600">
              {about.monitoring.text}
            </p>
          </div>
        </div>
      </div>
    </SectionBand>
  );
}
