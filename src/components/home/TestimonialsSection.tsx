import { Quote } from "lucide-react";
import { homeContent } from "@/constants/homeContent";
import SectionBand from "./SectionBand";
import SectionHeading from "./SectionHeading";

export default function TestimonialsSection() {
  const { testimonials } = homeContent;

  return (
    <SectionBand id={testimonials.id}>
      <SectionHeading title={testimonials.title} subtitle={testimonials.subtitle} />
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {testimonials.items.map((item) => (
          <blockquote
            key={item.name}
            className="flex flex-col rounded-2xl border border-teal-100 bg-white p-6 shadow-md"
          >
            <Quote className="h-8 w-8 text-teal-300" aria-hidden />
            <p className="mt-4 flex-1 text-sm leading-relaxed text-zinc-600">
              &ldquo;{item.quote}&rdquo;
            </p>
            <footer className="mt-6 border-t border-teal-50 pt-4">
              <p className="font-semibold text-teal-900">{item.name}</p>
              <p className="text-xs text-zinc-500">{item.role}</p>
            </footer>
          </blockquote>
        ))}
      </div>
    </SectionBand>
  );
}
