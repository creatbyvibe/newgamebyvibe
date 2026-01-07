interface StepCardProps {
  number: number;
  title: string;
  description: string;
  emoji: string;
  delay?: number;
}

const StepCard = ({ number, title, description, emoji, delay = 0 }: StepCardProps) => {
  return (
    <div 
      className="relative flex flex-col items-center text-center animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Step number bubble */}
      <div className="w-20 h-20 rounded-full gradient-fun flex items-center justify-center mb-4 shadow-playful">
        <span className="text-3xl font-bold text-primary-foreground">{number}</span>
      </div>
      
      {/* Emoji */}
      <span className="text-4xl mb-3">{emoji}</span>
      
      {/* Content */}
      <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm max-w-[200px]">{description}</p>
    </div>
  );
};

export default StepCard;
