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
          "inline-flex items-center justify-center rounded-full font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cinema-accent disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-cinema-accent text-white hover:bg-cinema-accent/90 shadow-lg shadow-cinema-accent/25":
              variant === "primary",
            "glass text-cinema-text hover:bg-white/10": variant === "secondary",
            "text-cinema-muted hover:text-cinema-text hover:bg-white/5":
              variant === "ghost",
            "border border-white/20 bg-transparent hover:bg-white/5":
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
