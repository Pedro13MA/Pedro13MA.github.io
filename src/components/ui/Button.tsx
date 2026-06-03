import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";

const variants: Record<Variant, string> = {
  primary:
    "bg-indigo-500 hover:bg-indigo-400 text-white font-medium px-6 py-3 rounded-full transition-all duration-200 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] inline-flex items-center justify-center gap-2 min-h-[44px]",
  secondary:
    "border border-white/10 hover:border-white/20 text-white px-6 py-3 rounded-full transition-all duration-200 hover:bg-white/5 inline-flex items-center justify-center gap-2 min-h-[44px]",
  ghost: "text-zinc-400 hover:text-white transition-colors duration-200 min-h-[44px] inline-flex items-center",
};

type Props = {
  href?: string;
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
  external?: boolean;
  onClick?: () => void;
};

export function Button({
  href,
  variant = "primary",
  className,
  children,
  external,
  onClick,
}: Props) {
  const classes = cn(variants[variant], className);

  if (href) {
    if (external) {
      return (
        <a href={href} className={classes} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} onClick={onClick}>
      {children}
    </button>
  );
}
