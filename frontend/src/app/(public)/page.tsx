import Link from "next/link";

export default function HomePage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="rounded-2xl bg-gradient-to-br from-teal-600 to-teal-800 px-8 py-16 text-white">
        <p className="text-sm font-medium uppercase tracking-wide text-teal-100">
          Team 14 · Mental Health Cloud App
        </p>
        <h1 className="mt-4 max-w-2xl text-4xl font-bold leading-tight md:text-5xl">
          Your wellness journey starts here
        </h1>
        <p className="mt-4 max-w-xl text-lg text-teal-50">
          Track mood, book counselors, and access mental health resources.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/register"
            className="rounded-full bg-white px-6 py-3 font-semibold text-teal-800 hover:bg-teal-50"
          >
            Get started
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-white px-6 py-3 font-semibold hover:bg-teal-700"
          >
            Login
          </Link>
        </div>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {[
          { title: "Mood tracking", text: "Log daily mood and view trends." },
          { title: "Appointments", text: "Book sessions with counselors." },
          { title: "Resources", text: "Articles, videos, and self-help tools." },
        ].map((card) => (
          <div key={card.title} className="rounded-xl border border-teal-100 p-6">
            <h2 className="font-semibold text-teal-800">{card.title}</h2>
            <p className="mt-2 text-sm text-zinc-600">{card.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
