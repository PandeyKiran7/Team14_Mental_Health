import Link from "next/link";

export default function RegisterPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-teal-800">Register</h1>
      <form className="mt-6 space-y-4">
        <input type="text" placeholder="Full name" className="w-full rounded-lg border px-3 py-2" />
        <input type="email" placeholder="Email" className="w-full rounded-lg border px-3 py-2" />
        <input type="password" placeholder="Password" className="w-full rounded-lg border px-3 py-2" />
        <select className="w-full rounded-lg border px-3 py-2">
          <option>Patient</option>
          <option>Doctor</option>
        </select>
        <button type="button" className="w-full rounded-lg bg-teal-600 py-2 text-white">
          Register (coming soon)
        </button>
      </form>
      <p className="mt-4 text-center text-sm">
        <Link href="/login" className="text-teal-600 hover:underline">Already have an account?</Link>
      </p>
    </>
  );
}
