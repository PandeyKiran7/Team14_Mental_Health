import Link from "next/link";

const SITE_NAME = "Diabetes Management System";

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/login", label: "Login" },
];

export default function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-teal-100 bg-teal-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm font-semibold text-teal-800">{SITE_NAME}</p>
          <nav className="flex flex-wrap justify-center gap-5 text-sm text-zinc-600">
            {footerLinks.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-teal-600">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <p className="mt-6 text-center text-sm text-zinc-500">
          © {new Date().getFullYear()} Team 14 – Diabetes Management | CT071-3-3-DDAC
        </p>
      </div>
    </footer>
  );
}
