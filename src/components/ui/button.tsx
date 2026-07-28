import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40 disabled:pointer-events-none disabled:opacity-50 min-h-11",
  {
    variants: {
      variant: {
        default: "bg-slate-900 text-white hover:bg-slate-800 shadow-sm",
        secondary:
          "border border-slate-200/80 bg-white text-slate-700 hover:bg-slate-50 shadow-sm",
        ghost: "text-slate-500 hover:text-slate-900 hover:bg-slate-100",
        outline:
          "border border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50",
        link: "text-sky-700 underline-offset-4 hover:underline h-auto min-h-0 px-0",
      },
      size: {
        default: "px-4 py-2.5",
        sm: "h-9 px-3 text-xs rounded-lg",
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
