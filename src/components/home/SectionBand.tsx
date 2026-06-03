import { cn } from "@/lib/utils";

type SectionBandProps = {
  id?: string;
  children: React.ReactNode;
  className?: string;
  alt?: boolean;
};

export default function SectionBand({
  id,
  children,
  className,
  alt = false,
}: SectionBandProps) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-24 py-14 md:py-20",
        alt ? "bg-teal-50/60" : "bg-transparent",
        className,
      )}
    >
      <div className="mx-auto max-w-6xl px-4">{children}</div>
    </section>
  );
}
