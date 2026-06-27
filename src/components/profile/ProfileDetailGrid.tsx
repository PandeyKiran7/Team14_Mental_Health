type ProfileDetailItem = {
  label: string;
  value?: string | number | null | undefined;
};

type ProfileDetailGridProps = {
  items: ProfileDetailItem[];
};

export default function ProfileDetailGrid({ items }: ProfileDetailGridProps) {
  return (
    <dl className="grid gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className={item.label === "Address" ? "sm:col-span-2" : undefined}>
          <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            {item.label}
          </dt>
          <dd className="mt-1 text-sm font-medium text-zinc-800">
            {String(item.value ?? '').trim() ? String(item.value) : "—"}
          </dd>
        </div>
      ))}
    </dl>
  );
}