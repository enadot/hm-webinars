import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-bold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground hover:border-accent",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        gold:
          "bg-gradient-to-br from-brand-gold-light via-brand-gold to-[#E89500] text-brand-dark hover:brightness-110 shadow-glow-gold hover:-translate-y-0.5",
        brand:
          "bg-gradient-to-br from-brand-primary-2 to-brand-primary text-white hover:brightness-110 shadow-glow-brand hover:-translate-y-0.5",
        purple:
          "bg-gradient-to-br from-brand-purple-2 to-brand-purple text-white hover:brightness-110 shadow-glow-purple hover:-translate-y-0.5",
      },
      size: {
        default: "h-11 px-5 text-base [&_svg]:size-4",
        sm: "h-10 rounded-lg px-4 text-sm [&_svg]:size-4",
        lg: "h-14 rounded-xl px-8 text-lg [&_svg]:size-5",
        xl: "h-16 rounded-2xl px-10 text-xl [&_svg]:size-6",
        "2xl": "h-20 rounded-2xl px-12 text-2xl [&_svg]:size-7",
        icon: "h-11 w-11 [&_svg]:size-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
