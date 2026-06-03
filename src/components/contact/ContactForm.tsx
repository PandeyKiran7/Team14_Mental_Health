"use client";

import { useState } from "react";
import { contactContent } from "@/constants/contactContent";

export default function ContactForm() {
  const { form } = contactContent;
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    // Placeholder until backend contact API is available
    await new Promise((resolve) => setTimeout(resolve, 600));
    setLoading(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div
        className="rounded-2xl border border-teal-200 bg-teal-50 p-8 text-center"
        role="status"
      >
        <p className="font-medium text-teal-800">{form.successMessage}</p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-4 text-sm font-medium text-teal-600 underline hover:text-teal-800"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-zinc-700">
          {form.fields.fullName}
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          required
          autoComplete="name"
          className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-zinc-900 outline-none ring-teal-500 focus:border-teal-500 focus:ring-2"
        />
      </div>

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-zinc-700">
          {form.fields.email}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-zinc-900 outline-none ring-teal-500 focus:border-teal-500 focus:ring-2"
        />
      </div>

      <div>
        <label htmlFor="subject" className="mb-1.5 block text-sm font-medium text-zinc-700">
          {form.fields.subject}
        </label>
        <input
          id="subject"
          name="subject"
          type="text"
          required
          className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-zinc-900 outline-none ring-teal-500 focus:border-teal-500 focus:ring-2"
        />
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-zinc-700">
          {form.fields.message}
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="w-full resize-y rounded-lg border border-zinc-200 px-4 py-2.5 text-zinc-900 outline-none ring-teal-500 focus:border-teal-500 focus:ring-2"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-teal-600 px-8 py-3 font-semibold text-white shadow-md transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
      >
        {loading ? "Sending…" : form.submitLabel}
      </button>
    </form>
  );
}
