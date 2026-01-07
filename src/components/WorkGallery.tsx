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
      <div className="flex items-end justify-between mb-10">
        <div>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
            Trending Creations
          </h2>
          <p className="text-muted-foreground mt-2">
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

      {/* Gallery */}
      <div className="flex gap-5 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
        {works.map((work, index) => (
          <div
            key={work.id}
            className="flex-shrink-0 w-64 group cursor-pointer animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Preview */}
            <div className="relative aspect-video rounded-xl overflow-hidden mb-3 border border-border group-hover:border-primary/30 transition-all duration-300 shadow-soft group-hover:shadow-medium">
              <div
                className={`absolute inset-0 bg-gradient-to-br ${work.gradient} opacity-30 group-hover:opacity-50 transition-opacity`}
              />

              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-foreground/10 backdrop-blur-sm">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-glow">
                  <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
                </div>
              </div>

              <div className="absolute bottom-2 left-2 right-2 flex items-center gap-2 text-xs">
                <span className="flex items-center gap-1 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-full text-foreground">
                  <Play className="w-3 h-3" />
                  {work.plays.toLocaleString()}
                </span>
                <span className="flex items-center gap-1 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-full text-foreground">
                  <Heart className="w-3 h-3" />
                  {work.likes}
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {work.title}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">by {work.author}</p>
              </div>
              <button className="p-2 rounded-lg hover:bg-muted transition-colors opacity-0 group-hover:opacity-100">
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
