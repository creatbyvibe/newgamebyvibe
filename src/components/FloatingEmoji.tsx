interface FloatingEmojiProps {
  emoji: string;
  className?: string;
  delay?: number;
}

const FloatingEmoji = ({ emoji, className = "", delay = 0 }: FloatingEmojiProps) => {
  return (
    <span 
      className={`absolute text-4xl md:text-5xl animate-float select-none pointer-events-none ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {emoji}
    </span>
  );
};

export default FloatingEmoji;
