type SectionHeadingProps = {
  title: string;
  subtitle?: string;
};

export default function SectionHeading({ title, subtitle }: SectionHeadingProps) {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-teal-900 md:text-3xl">{title}</h2>
      {subtitle ? (
        <p className="mt-2 text-zinc-600">{subtitle}</p>
      ) : null}
    </div>
  );
}
