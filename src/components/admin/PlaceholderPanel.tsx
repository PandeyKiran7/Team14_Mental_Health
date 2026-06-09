import { cn } from "@/lib/utils";

type PlaceholderPanelProps = {
  title: string;
  description: string;
  className?: string;
};

export default function PlaceholderPanel({
  title,
  description,
  className,
}: PlaceholderPanelProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-dashed border-teal-200 bg-white p-8 text-center shadow-sm",
        className,
      )}
    >
      <h2 className="text-lg font-semibold text-teal-800">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-zinc-600">{description}</p>
    </div>
  );
}
