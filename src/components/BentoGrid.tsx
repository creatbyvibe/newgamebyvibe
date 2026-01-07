import { LucideIcon } from "lucide-react";

interface BentoItemProps {
  title: string;
  description: string;
  icon: LucideIcon;
  gradient: "primary" | "secondary" | "accent" | "fun";
  size: "small" | "medium" | "large";
  delay?: number;
}

const gradientStyles = {
  primary: "gradient-primary",
  secondary: "gradient-secondary",
  accent: "gradient-accent",
  fun: "gradient-fun",
};

const sizeStyles = {
  small: "col-span-1 row-span-1",
  medium: "col-span-1 md:col-span-2 row-span-1",
  large: "col-span-1 md:col-span-2 row-span-2",
};

export const BentoItem = ({
  title,
  description,
  icon: Icon,
  gradient,
  size,
  delay = 0,
}: BentoItemProps) => {
  return (
    <div
      className={`${sizeStyles[size]} group relative bg-card rounded-2xl p-6 border border-border hover:border-primary/30 transition-all duration-300 cursor-pointer hover-lift animate-fade-in overflow-hidden`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Background decoration */}
      <div className="absolute -top-20 -right-20 w-40 h-40 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500">
        <div className={`w-full h-full rounded-full ${gradientStyles[gradient]}`} />
      </div>

      <div className="relative z-10">
        <div
          className={`w-11 h-11 rounded-xl ${gradientStyles[gradient]} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>

        <h3 className="text-base font-display font-semibold text-foreground mb-1.5 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>

      <div className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
        <span className="text-lg text-primary">→</span>
      </div>
    </div>
  );
};

interface BentoGridProps {
  children: React.ReactNode;
}

export const BentoGrid = ({ children }: BentoGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[minmax(140px,auto)]">
      {children}
    </div>
  );
};

export default BentoGrid;
