import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-teal-800">Forgot password</h1>
      <form className="mt-6 space-y-4">
        <input type="email" placeholder="Email" className="w-full rounded-lg border px-3 py-2" />
        <button type="button" className="w-full rounded-lg bg-teal-600 py-2 text-white">
          Send reset link (coming soon)
        </button>
      </form>
      <p className="mt-4 text-center text-sm">
        <Link href="/login" className="text-teal-600 hover:underline">Back to login</Link>
      </p>
    </>
  );
}
