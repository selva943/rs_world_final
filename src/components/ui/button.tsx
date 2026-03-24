import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, HTMLMotionProps } from "motion/react";
import { Loader2 } from "lucide-react";
import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-pb-green-deep/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 hover:scale-[1.02] active:scale-[0.97]",
  {
    variants: {
      variant: {
        primary: "bg-pb-green-deep text-white shadow-sm hover:bg-pb-green-deep/90 hover:shadow-md",
        secondary: "bg-pb-green-soft text-pb-green-deep hover:bg-pb-green-soft/80 shadow-sm hover:shadow-md",
        ghost: "bg-transparent text-pb-green-deep hover:bg-pb-green-soft/50",
        danger: "bg-destructive text-white hover:bg-destructive/90 shadow-sm hover:shadow-md",
        outline: "border-2 border-pb-green-deep/10 bg-transparent text-pb-green-deep hover:bg-pb-green-deep hover:text-white hover:border-pb-green-deep shadow-sm hover:shadow-md",
      },
      size: {
        sm: "h-[36px] px-4 rounded-[var(--btn-radius)] text-xs",
        md: "h-[44px] px-6 rounded-[var(--btn-radius)] text-sm",
        lg: "h-[48px] px-8 rounded-[var(--btn-radius)] text-base",
        icon: "size-[44px] rounded-[var(--btn-radius)]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {!loading && children}
        {loading && <span className="sr-only">Loading...</span>}
      </Comp>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
