import { cn } from "@/lib/utils";

type FormButtonProps = React.ComponentProps<"button"> & {
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
};

export default function FormButton({
  variant = "primary",
  fullWidth = true,
  className,
  children,
  ...props
}: FormButtonProps) {
  return (
    <button
      type={props.type ?? "button"}
      className={cn(
        "rounded-lg px-4 py-2.5 text-sm font-medium transition disabled:opacity-50",
        fullWidth && "w-full",
        variant === "primary" &&
          "bg-teal-600 text-white hover:bg-teal-700 disabled:cursor-not-allowed",
        variant === "secondary" &&
          "border border-teal-200 bg-white text-teal-800 hover:bg-teal-50",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
