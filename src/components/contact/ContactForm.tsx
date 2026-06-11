"use client";

import { contactContent } from "@/constants/contactContent";

export default function ContactForm() {
  const { form } = contactContent;

  return (
    <div className="space-y-5">
      <div
        className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        role="status"
      >
        Contact messages are not sent to the server yet — there is no contact API
        in the backend. Use the email or phone details on this page instead.
      </div>

      <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-zinc-700">
            {form.fields.fullName}
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            disabled
            className="w-full cursor-not-allowed rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-zinc-500"
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
            disabled
            className="w-full cursor-not-allowed rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-zinc-500"
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
            disabled
            className="w-full cursor-not-allowed rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-zinc-500"
          />
        </div>

        <div>
          <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-zinc-700">
            {form.fields.message}
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            disabled
            className="w-full cursor-not-allowed resize-y rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-zinc-500"
          />
        </div>

        <button
          type="button"
          disabled
          className="w-full cursor-not-allowed rounded-full bg-zinc-300 px-8 py-3 font-semibold text-zinc-500 sm:w-auto"
        >
          {form.submitLabel} (unavailable)
        </button>
      </form>
    </div>
  );
}
