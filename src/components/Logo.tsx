import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  href?: string;
  onClick?: () => void;
  variant?: "default" | "footer" | "hero";
}

const sizeClasses = {
  sm: "text-sm md:text-base",
  md: "text-base md:text-lg",
  lg: "text-lg md:text-xl",
  xl: "text-xl md:text-2xl lg:text-3xl",
};

const variantClasses = {
  default: {
    brand: "text-gradient-primary",
    suffix: "text-foreground/70",
  },
  footer: {
    brand: "text-gradient-primary",
    suffix: "text-foreground/50",
  },
  hero: {
    brand: "text-gradient-primary",
    suffix: "text-foreground/60",
  },
};

export const Logo = ({
  className,
  size = "md",
  showText = true,
  href = "/",
  onClick,
  variant = "default",
}: LogoProps) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === " ") && onClick) {
      e.preventDefault();
      onClick();
    }
  };

  const Component = href && !onClick ? Link : "div";
  const linkProps = href && !onClick
    ? { to: href, className: "flex items-baseline gap-0 cursor-pointer" }
    : {
        className: "flex items-baseline gap-0",
        onClick,
        ...(onClick && { role: "button", tabIndex: 0, onKeyDown: handleKeyDown }),
      };

  const variantStyle = variantClasses[variant];

  return (
    <Component {...linkProps}>
      <span
        className={cn(
          "font-display font-bold tracking-tight",
          variantStyle.brand,
          sizeClasses[size],
          className
        )}
      >
        byvibe
      </span>
      {showText && (
        <span
          className={cn(
            "font-display font-bold tracking-tight",
            variantStyle.suffix,
            sizeClasses[size],
            className
          )}
        >
          .ai
        </span>
      )}
    </Component>
  );
};

export default Logo;
