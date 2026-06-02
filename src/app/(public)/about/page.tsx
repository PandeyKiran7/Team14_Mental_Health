import Link from "next/link";
import {
  Activity,
  BookOpen,
  Calendar,
  CheckCircle2,
  Mail,
  Pill,
  Stethoscope,
  Target,
  Users,
  type LucideIcon,
} from "lucide-react";
import { aboutContent } from "@/constants/aboutContent";

const offerIconMap: Record<
  (typeof aboutContent.whatWeOffer.items)[number]["icon"],
  LucideIcon
> = {
  activity: Activity,
  calendar: Calendar,
  pill: Pill,
  book: BookOpen,
  stethoscope: Stethoscope,
};

export default function AboutPage() {
  const content = aboutContent;

  return (
    <div className="pb-16">
      {/* Page header */}
      <section className="px-4 pb-4 pt-8 md:pt-10">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-2xl bg-gradient-to-br from-teal-600 to-teal-800 px-8 py-12 text-center text-white shadow-xl md:py-14">
          <h1 className="text-3xl font-bold md:text-4xl">{content.title}</h1>
          <p className="mx-auto mt-3 max-w-2xl text-teal-50">
            Learn about Team 14 and our mission to improve diabetes care through
            technology.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-12 px-4 pt-10 md:space-y-16">
        {/* Our Mission */}
        <section>
          <h2 className="text-2xl font-bold text-teal-900 md:text-3xl">
            {content.mission.title}
          </h2>
          <p className="mt-4 leading-relaxed text-zinc-600">
            {content.mission.text}
          </p>
        </section>

        {/* Who We Are */}
        <section className="rounded-2xl border border-teal-100 bg-white p-6 shadow-md md:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700">
              <Users className="h-6 w-6" aria-hidden />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-teal-900">
                {content.whoWeAre.title}
              </h2>
              <p className="mt-3 leading-relaxed text-zinc-600">
                {content.whoWeAre.text}
              </p>
            </div>
          </div>
        </section>

        {/* Team Members */}
        <section>
          <h2 className="text-2xl font-bold text-teal-900 md:text-3xl">
            {content.teamMembers.title}
          </h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {content.teamMembers.members.map((name) => (
              <li
                key={name}
                className="rounded-2xl border border-teal-100 bg-gradient-to-b from-white to-teal-50/50 px-5 py-4 text-center font-medium text-teal-900 shadow-sm"
              >
                {name}
              </li>
            ))}
          </ul>
        </section>

        {/* What We Offer */}
        <section>
          <h2 className="text-center text-2xl font-bold text-teal-900 md:text-3xl">
            {content.whatWeOffer.title}
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {content.whatWeOffer.items.map((item) => {
              const Icon = offerIconMap[item.icon];
              return (
                <article
                  key={item.title}
                  className="rounded-2xl border border-teal-100 bg-white p-6 shadow-md"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-600 text-white">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-teal-900">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        {/* Our Vision */}
        <section className="rounded-2xl border border-teal-200 bg-teal-600/5 p-6 shadow-sm md:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-600 text-white">
              <Target className="h-6 w-6" aria-hidden />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-teal-900">
                {content.vision.title}
              </h2>
              <p className="mt-3 leading-relaxed text-zinc-600">
                {content.vision.text}
              </p>
            </div>
          </div>
        </section>

        {/* Why Choose Our System */}
        <section className="rounded-2xl border border-teal-100 bg-teal-50/60 p-6 md:p-8">
          <h2 className="text-2xl font-bold text-teal-900 md:text-3xl">
            {content.whyChoose.title}
          </h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {content.whyChoose.items.map((item) => (
              <li
                key={item}
                className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-medium text-zinc-700 shadow-sm"
              >
                <CheckCircle2
                  className="h-5 w-5 shrink-0 text-teal-600"
                  aria-hidden
                />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Contact Us */}
        <section className="rounded-2xl bg-gradient-to-r from-teal-700 to-teal-600 p-8 text-center text-white shadow-xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
            <Mail className="h-6 w-6" aria-hidden />
          </div>
          <h2 className="mt-4 text-2xl font-bold">{content.contact.title}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-teal-50">
            {content.contact.text}
          </p>
          <Link
            href={content.contact.linkHref}
            className="mt-6 inline-block rounded-full bg-white px-8 py-3 font-semibold text-teal-800 shadow-md transition hover:bg-teal-50"
          >
            {content.contact.linkLabel}
          </Link>
        </section>
      </div>
    </div>
  );
}
