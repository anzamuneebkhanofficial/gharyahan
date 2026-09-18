import { cn } from "../../lib/utils";

export default function Badge({
  children,
  variant = "default",
  className,
  size = "md",
}) {
  const variants = {
    default: "bg-background text-secondary border-border",
    available: "badge-available font-semibold",
    indeal: "badge-indeal font-semibold",
    sealed: "badge-sealed font-medium",
    vacancy: "badge-vacancy font-semibold",
    primary: "bg-primary/10 text-primary border-primary/20 font-medium",
    amber: "bg-accent-light text-foreground border-accent font-medium",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border tracking-wide transition-colors",
        variants[variant] || variants.default,
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}
