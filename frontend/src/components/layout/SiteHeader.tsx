import Link from "next/link";

const nav = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact Us" },
];

export default function SiteHeader() {
  return (
    <header className="border-b border-teal-100 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-bold text-teal-700">
          MindWell
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-zinc-700">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-teal-600">
              {item.label}
            </Link>
          ))}
          <Link href="/login" className="hover:text-teal-600">
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-teal-600 px-4 py-2 text-white hover:bg-teal-700"
          >
            Register
          </Link>
        </nav>
      </div>
    </header>
  );
}
