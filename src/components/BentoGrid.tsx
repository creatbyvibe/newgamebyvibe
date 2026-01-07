import { LucideIcon } from "lucide-react";

interface BentoItemProps {
  title: string;
  description: string;
  icon: LucideIcon;
  gradient: "neon" | "cyber" | "sunset" | "electric";
  size: "small" | "medium" | "large";
  delay?: number;
}

const gradientStyles = {
  neon: "gradient-neon",
  cyber: "gradient-cyber",
  sunset: "gradient-sunset",
  electric: "gradient-electric",
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
      className={`${sizeStyles[size]} group relative bg-card rounded-2xl p-6 border-2 border-border hover:border-primary/50 transition-all duration-300 cursor-pointer card-brutal animate-fade-in overflow-hidden`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Background glow on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300">
        <div className={`w-full h-full ${gradientStyles[gradient]}`} />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Icon */}
        <div
          className={`w-12 h-12 rounded-xl ${gradientStyles[gradient]} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon className="w-6 h-6 text-primary-foreground" />
        </div>

        {/* Text */}
        <h3 className="text-lg font-display font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>

      {/* Arrow indicator */}
      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
        <span className="text-xl text-primary">→</span>
      </div>
    </div>
  );
};

interface BentoGridProps {
  children: React.ReactNode;
}

export const BentoGrid = ({ children }: BentoGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[minmax(160px,auto)]">
      {children}
    </div>
  );
};

export default BentoGrid;
