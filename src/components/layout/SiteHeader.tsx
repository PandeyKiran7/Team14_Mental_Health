import Link from "next/link";

const SITE_NAME = "Diabetes Management System";

const nav = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-teal-100 bg-white shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-bold text-teal-700 md:text-xl">
          {SITE_NAME}
        </Link>
        <nav className="flex items-center gap-5 text-sm font-medium text-zinc-700 md:gap-6">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-teal-600">
              {item.label}
            </Link>
          ))}
          <Link
            href="/register"
            className="hidden rounded-full bg-teal-600 px-4 py-2 text-white hover:bg-teal-700 sm:inline-block"
          >
            Register
          </Link>
          <Link href="/login" className="hover:text-teal-600">
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
}
