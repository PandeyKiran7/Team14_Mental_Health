import {
  Clock,
  Headphones,
  Mail,
  MapPin,
  Phone,
  Timer,
} from "lucide-react";
import ContactForm from "@/components/contact/ContactForm";
import { contactContent } from "@/constants/contactContent";

export default function ContactPage() {
  const content = contactContent;

  return (
    <div className="pb-16">
      <section className="px-4 pb-4 pt-8 md:pt-10">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-2xl bg-gradient-to-br from-teal-600 to-teal-800 px-8 py-12 text-center text-white shadow-xl md:py-14">
          <h1 className="text-3xl font-bold md:text-4xl">{content.title}</h1>
          <p className="mx-auto mt-3 max-w-2xl text-teal-50">
            {content.intro.text}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-12 px-4 pt-10 md:space-y-16">
        <section>
          <h2 className="text-2xl font-bold text-teal-900 md:text-3xl">
            {content.intro.title}
          </h2>
          <p className="mt-4 leading-relaxed text-zinc-600">{content.intro.text}</p>
        </section>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Contact Information + Working Hours */}
          <div className="space-y-8">
            <section className="rounded-2xl border border-teal-100 bg-white p-6 shadow-md md:p-8">
              <h2 className="text-xl font-bold text-teal-900">
                {content.contactInfo.title}
              </h2>
              <ul className="mt-6 space-y-5">
                {content.contactInfo.items.map((item) => (
                  <li key={item.label} className="flex items-start gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700">
                      {item.label === "Email" && (
                        <Mail className="h-5 w-5" aria-hidden />
                      )}
                      {item.label === "Phone" && (
                        <Phone className="h-5 w-5" aria-hidden />
                      )}
                      {item.label === "Address" && (
                        <MapPin className="h-5 w-5" aria-hidden />
                      )}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-zinc-500">
                        {item.label}
                      </p>
                      {item.href ? (
                        <a
                          href={item.href}
                          className="mt-0.5 font-medium text-teal-700 hover:text-teal-900 hover:underline"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="mt-0.5 font-medium text-zinc-800">
                          {item.value}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-2xl border border-teal-100 bg-teal-50/60 p-6 shadow-sm md:p-8">
              <div className="flex items-center gap-3">
                <Clock className="h-6 w-6 text-teal-700" aria-hidden />
                <h2 className="text-xl font-bold text-teal-900">
                  {content.workingHours.title}
                </h2>
              </div>
              <ul className="mt-4 space-y-3">
                {content.workingHours.schedule.map((row) => (
                  <li
                    key={row.days}
                    className="flex justify-between gap-4 border-b border-teal-100 pb-3 last:border-0 last:pb-0"
                  >
                    <span className="font-medium text-zinc-700">{row.days}</span>
                    <span className="text-zinc-600">{row.hours}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Contact Form */}
          <section className="rounded-2xl border border-teal-100 bg-white p-6 shadow-md md:p-8">
            <h2 className="text-xl font-bold text-teal-900">{content.form.title}</h2>
            <p className="mt-2 text-sm text-zinc-600">{content.form.description}</p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </section>
        </div>

        {/* Support Purpose */}
        <section className="rounded-2xl border border-teal-100 bg-white p-6 shadow-md md:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-600 text-white">
              <Headphones className="h-6 w-6" aria-hidden />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-teal-900">
                {content.supportPurpose.title}
              </h2>
              <p className="mt-2 text-zinc-600">{content.supportPurpose.intro}</p>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {content.supportPurpose.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-sm text-zinc-700"
                  >
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Response Time */}
        <section className="rounded-2xl border border-teal-200 bg-teal-600/5 p-6 text-center shadow-sm md:p-8">
          <Timer className="mx-auto h-8 w-8 text-teal-700" aria-hidden />
          <h2 className="mt-3 text-xl font-bold text-teal-900">
            {content.responseTime.title}
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-zinc-600">
            {content.responseTime.text}
          </p>
        </section>
      </div>
    </div>
  );
}
