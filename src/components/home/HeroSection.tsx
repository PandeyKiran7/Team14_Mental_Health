import Link from "next/link";
import { homeContent } from "@/constants/homeContent";

export default function HeroSection() {
  const { hero } = homeContent;

  return (
    <section id="hero" className="px-4 pb-4 pt-8 md:pt-10">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-2xl bg-gradient-to-br from-teal-600 to-teal-800 px-8 py-16 text-center text-white shadow-xl md:px-12 md:py-20">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10" />
        <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-white/5" />
        <div className="relative z-10">
          <h1 className="text-3xl font-bold leading-tight md:text-5xl">
            {hero.title}
          </h1>
          <p className="mt-4 text-lg font-medium text-teal-100 md:text-xl">
            {hero.tagline}
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-base text-teal-50 md:text-lg">
            {hero.description}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={hero.getStartedHref}
              className="rounded-full bg-white px-8 py-3 font-semibold text-teal-800 shadow-md transition hover:bg-teal-50"
            >
              Get Started
            </Link>
            <Link
              href={hero.loginHref}
              className="rounded-full border-2 border-white px-8 py-3 font-semibold transition hover:bg-teal-700"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
