import Link from "next/link";
import { homeContent } from "@/constants/homeContent";
import SectionBand from "./SectionBand";

export default function CallToActionSection() {
  const { cta } = homeContent;

  return (
    <SectionBand className="pb-16 md:pb-20">
      <div className="rounded-2xl bg-gradient-to-r from-teal-700 to-teal-600 px-8 py-12 text-center text-white md:px-12">
        <h2 className="text-2xl font-bold md:text-3xl">{cta.title}</h2>
        <p className="mx-auto mt-4 max-w-xl text-teal-50">{cta.description}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href={cta.registerHref}
            className="rounded-full bg-white px-8 py-3 font-semibold text-teal-800 transition hover:bg-teal-50"
          >
            Register Now
          </Link>
          <Link
            href={cta.learnMoreHref}
            className="rounded-full border-2 border-white px-8 py-3 font-semibold transition hover:bg-teal-800"
          >
            Learn More
          </Link>
        </div>
      </div>
    </SectionBand>
  );
}
