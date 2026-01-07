import { Play, GitFork, Heart } from "lucide-react";

interface WorkItem {
  id: string;
  title: string;
  author: string;
  plays: number;
  likes: number;
  color: string;
}

const works: WorkItem[] = [
  { id: "1", title: "像素弹球大作战", author: "小明", plays: 1234, likes: 89, color: "from-primary to-secondary" },
  { id: "2", title: "今天吃什么", author: "饭困难症", plays: 5678, likes: 234, color: "from-secondary to-accent" },
  { id: "3", title: "专注番茄钟", author: "效率达人", plays: 3456, likes: 156, color: "from-accent to-info" },
  { id: "4", title: "表情包工厂", author: "梗王", plays: 8901, likes: 567, color: "from-info to-highlight" },
  { id: "5", title: "打字练习", author: "速度达人", plays: 2345, likes: 123, color: "from-highlight to-primary" },
  { id: "6", title: "记忆翻牌", author: "脑力王", plays: 4567, likes: 234, color: "from-primary to-accent" },
];

const WorkGallery = () => {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-display font-bold text-foreground">
            🔥 热门作品
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            看看大家都在玩什么
          </p>
        </div>
        <a
          href="#gallery"
          className="text-sm text-primary hover:underline font-medium"
        >
          查看全部 →
        </a>
      </div>

      {/* Horizontal scroll gallery */}
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
        {works.map((work, index) => (
          <div
            key={work.id}
            className="flex-shrink-0 w-64 group cursor-pointer animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Preview card */}
            <div className="relative aspect-video rounded-xl overflow-hidden mb-3 border border-border group-hover:border-primary/50 transition-all duration-300">
              {/* Gradient placeholder */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${work.color} opacity-20 group-hover:opacity-30 transition-opacity`}
              />

              {/* Play icon overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-background/50 backdrop-blur-sm">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                  <Play className="w-5 h-5 text-primary-foreground ml-1" />
                </div>
              </div>

              {/* Stats overlay */}
              <div className="absolute bottom-2 left-2 right-2 flex items-center gap-3 text-xs text-foreground/80">
                <span className="flex items-center gap-1 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full">
                  <Play className="w-3 h-3" />
                  {work.plays.toLocaleString()}
                </span>
                <span className="flex items-center gap-1 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full">
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
              <button className="p-2 rounded-lg hover:bg-muted transition-colors opacity-0 group-hover:opacity-100">
                <GitFork className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkGallery;
