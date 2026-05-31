import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-full font-medium tracking-wide transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cinema-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-cinema-bg disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-cinema-accent text-cinema-bg hover:bg-cinema-accent-light shadow-[0_1px_2px_rgba(28,26,23,0.10),0_6px_20px_rgba(110,43,43,0.18)]":
              variant === "primary",
            "glass-warm text-cinema-text hover:border-cinema-accent/50 hover:bg-white":
              variant === "secondary",
            "text-cinema-muted hover:text-cinema-text hover:bg-cinema-text/5":
              variant === "ghost",
            "border border-cinema-text/25 bg-transparent text-cinema-text hover:border-cinema-accent hover:text-cinema-accent-light":
              variant === "outline",
            "h-9 px-4 text-sm": size === "sm",
            "h-11 px-6 text-sm": size === "md",
            "h-13 px-8 text-base": size === "lg",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
