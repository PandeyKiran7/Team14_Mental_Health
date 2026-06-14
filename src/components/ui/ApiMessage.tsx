import { cn } from "@/lib/utils";

type ApiMessageProps = {
  message: string;
  variant?: "error" | "success" | "info";
  className?: string;
};

const VARIANT_STYLES = {
  error: "border-red-200 bg-red-50 text-red-700",
  success: "border-teal-200 bg-teal-50 text-teal-800",
  info: "border-amber-200 bg-amber-50 text-amber-900",
} as const;

export default function ApiMessage({
  message,
  variant = "error",
  className,
}: ApiMessageProps) {
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={cn(
        "rounded-lg border px-4 py-3 text-sm",
        VARIANT_STYLES[variant],
        className,
      )}
    >
      {message}
    </div>
  );
}
