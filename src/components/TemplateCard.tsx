import { LucideIcon } from "lucide-react";

interface TemplateCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color: "orange" | "yellow" | "mint" | "pink" | "blue";
  delay?: number;
}

const colorStyles = {
  orange: "gradient-fun",
  yellow: "bg-secondary",
  mint: "gradient-mint",
  pink: "gradient-sunset",
  blue: "gradient-sky",
};

const TemplateCard = ({ title, description, icon: Icon, color, delay = 0 }: TemplateCardProps) => {
  return (
    <div 
      className="group relative bg-card rounded-3xl p-6 shadow-card hover:shadow-float transition-all duration-300 hover:-translate-y-2 cursor-pointer border-2 border-transparent hover:border-primary/20 animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Icon container */}
      <div className={`w-16 h-16 rounded-2xl ${colorStyles[color]} flex items-center justify-center mb-4 group-hover:animate-wiggle`}>
        <Icon className="w-8 h-8 text-primary-foreground" />
      </div>
      
      {/* Content */}
      <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {description}
      </p>
      
      {/* Hover indicator */}
      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-2xl">→</span>
      </div>
    </div>
  );
};

export default TemplateCard;
