import { Play, GitFork, Heart } from "lucide-react";

interface WorkItem {
  id: string;
  title: string;
  author: string;
  plays: number;
  likes: number;
  gradient: string;
}

const works: WorkItem[] = [
  { id: "1", title: "Pixel Pong Battle", author: "Alex", plays: 1234, likes: 89, gradient: "from-primary to-highlight" },
  { id: "2", title: "What to Eat?", author: "Sam", plays: 5678, likes: 234, gradient: "from-secondary to-accent" },
  { id: "3", title: "Focus Timer Pro", author: "Maya", plays: 3456, likes: 156, gradient: "from-accent to-info" },
  { id: "4", title: "Meme Factory", author: "Jordan", plays: 8901, likes: 567, gradient: "from-info to-secondary" },
  { id: "5", title: "Type Racer", author: "Chris", plays: 2345, likes: 123, gradient: "from-highlight to-primary" },
  { id: "6", title: "Memory Cards", author: "Taylor", plays: 4567, likes: 234, gradient: "from-primary to-accent" },
];

const WorkGallery = () => {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-display font-bold text-foreground">
            Trending Creations
          </h3>
          <p className="text-muted-foreground mt-1">
            See what others are building
          </p>
        </div>
        <a
          href="#gallery"
          className="text-sm text-primary hover:underline font-medium"
        >
          View all →
        </a>
      </div>

      {/* Horizontal scroll gallery */}
      <div className="flex gap-5 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
        {works.map((work, index) => (
          <div
            key={work.id}
            className="flex-shrink-0 w-72 group cursor-pointer animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Preview card */}
            <div className="relative aspect-video rounded-2xl overflow-hidden mb-3 border border-border group-hover:border-primary/30 transition-all duration-300 shadow-soft group-hover:shadow-medium">
              {/* Gradient placeholder */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${work.gradient} opacity-30 group-hover:opacity-50 transition-opacity`}
              />

              {/* Play icon overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-foreground/10 backdrop-blur-sm">
                <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-glow">
                  <Play className="w-6 h-6 text-primary-foreground ml-1" />
                </div>
              </div>

              {/* Stats overlay */}
              <div className="absolute bottom-2 left-2 right-2 flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 bg-background/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-foreground">
                  <Play className="w-3 h-3" />
                  {work.plays.toLocaleString()}
                </span>
                <span className="flex items-center gap-1 bg-background/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-foreground">
                  <Heart className="w-3 h-3" />
                  {work.likes}
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {work.title}
                </h4>
                <p className="text-sm text-muted-foreground">by {work.author}</p>
              </div>
              <button className="p-2 rounded-xl hover:bg-muted transition-colors opacity-0 group-hover:opacity-100">
                <GitFork className="w-4 h-4 text-muted-foreground hover:text-primary" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkGallery;
