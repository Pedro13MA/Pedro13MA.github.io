import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium tracking-wide",
  {
    variants: {
      variant: {
        default: "border-white/10 bg-white/[0.04] text-zinc-200",
        teal: "border-teal-500/30 bg-teal-500/15 text-teal-300",
        buy: "border-emerald-500/30 bg-emerald-500/15 text-emerald-300",
        fair: "border-amber-500/30 bg-amber-500/15 text-amber-300",
        wait: "border-rose-500/30 bg-rose-500/15 text-rose-300",
        tier: "border-amber-400/30 bg-amber-400/10 text-amber-200",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
