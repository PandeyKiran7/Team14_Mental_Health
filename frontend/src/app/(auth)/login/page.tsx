import Link from "next/link";

export default function LoginPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-teal-800">Login</h1>
      <form className="mt-6 space-y-4">
        <input type="email" placeholder="Email" className="w-full rounded-lg border px-3 py-2" />
        <input type="password" placeholder="Password" className="w-full rounded-lg border px-3 py-2" />
        <button type="button" className="w-full rounded-lg bg-teal-600 py-2 text-white">
          Login (coming soon)
        </button>
      </form>
      <p className="mt-4 text-center text-sm">
        <Link href="/forgot-password" className="text-teal-600 hover:underline">Forgot password?</Link>
        {" · "}
        <Link href="/register" className="text-teal-600 hover:underline">Register</Link>
      </p>
    </>
  );
}
