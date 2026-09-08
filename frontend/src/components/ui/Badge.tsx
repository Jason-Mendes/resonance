import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

export const badgeVariants = cva(
  "inline-flex items-center rounded-none border px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors focus:outline-none select-none",
  {
    variants: {
      variant: {
        default: "border-transparent bg-zinc-900 text-zinc-50 hover:bg-zinc-800",
        secondary: "border-transparent bg-zinc-100 text-zinc-800",
        editorial:
          "border-zinc-200 bg-zinc-50 text-zinc-900 font-mono text-[11px] uppercase tracking-wider",
        outline: "border-zinc-300 text-zinc-700",
        success: "border-zinc-200 bg-zinc-100 text-zinc-900",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export const Badge: React.FC<BadgeProps> = ({ className, variant, ...props }) => {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
};
