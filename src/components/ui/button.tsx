import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/60 disabled:pointer-events-none disabled:opacity-50 min-h-11",
  {
    variants: {
      variant: {
        default: "bg-teal-500 text-zinc-950 hover:bg-teal-400",
        secondary:
          "border border-white/10 bg-white/[0.03] text-zinc-100 hover:bg-white/[0.06]",
        ghost: "text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04]",
        outline: "border border-teal-500/40 text-teal-300 hover:bg-teal-500/10",
        link: "text-teal-300 underline-offset-4 hover:underline h-auto min-h-0 px-0",
      },
      size: {
        default: "px-4 py-2.5",
        sm: "h-9 px-3 text-xs",
        lg: "h-12 px-6 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export { buttonVariants };
