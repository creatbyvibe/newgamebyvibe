import { useState, useEffect, useCallback } from "react";
import { Play, Heart, User, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { creationService } from "@/services/creationService";
import { userService } from "@/services/userService";
import { ErrorHandler } from "@/lib/errorHandler";
import { ErrorCode } from "@/lib/errorTypes";

interface Creation {
  id: string;
  title: string;
  prompt: string;
  html_code: string;
  plays: number;
  likes: number;
  is_public: boolean;
  user_id: string;
}

interface WorkGalleryProps {
  showPublicOnly?: boolean;
}

const gradients = [
  "from-primary to-highlight",
  "from-secondary to-accent",
  "from-accent to-info",
  "from-info to-secondary",
  "from-highlight to-primary",
  "from-primary to-accent",
];

const WorkGallery = ({ showPublicOnly = true }: WorkGalleryProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [works, setWorks] = useState<Creation[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set());

  // 使用 useCallback 包装 fetchWorks，避免依赖问题
  const fetchWorks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await creationService.getPublicCreations(6);
      setWorks(data as Creation[]);
    } catch (error) {
      ErrorHandler.logError(error, 'WorkGallery.fetchWorks');
      const errorMessage = ErrorHandler.getUserMessage(error);
      
      // 对 401 错误提供更友好的提示
      const appError = ErrorHandler.handle(error);
      if (appError.code === ErrorCode.UNAUTHORIZED || appError.statusCode === 401) {
        toast.error('无法加载作品：请检查网络连接或刷新页面', { duration: 5000 });
      } else {
        toast.error(errorMessage);
      }
      
      // 如果出错，保持空数组（显示占位符）
      setWorks([]);
    } finally {
      setLoading(false);
    }
  }, [showPublicOnly]); // 只依赖 showPublicOnly

  // 使用 useCallback 包装 fetchUserLikes
  const fetchUserLikes = useCallback(async () => {
    if (!user) return;
    try {
      const likes = await userService.getUserLikes(user.id);
      setUserLikes(new Set(likes));
    } catch (error) {
      ErrorHandler.logError(error, 'WorkGallery.fetchUserLikes');
      // 点赞状态获取失败不影响主功能，静默失败
    }
  }, [user]);

  useEffect(() => {
    fetchWorks();
  }, [fetchWorks]);

  useEffect(() => {
    if (user) {
      fetchUserLikes();
    } else {
      // 用户登出时清空点赞状态
      setUserLikes(new Set());
    }
  }, [user, fetchUserLikes]);

  const handleLike = async (e: React.MouseEvent, creationId: string) => {
    e.stopPropagation();
    if (!user) {
      toast.error("请先登录");
      return;
    }

    try {
      const isLiked = await userService.toggleLike(user.id, creationId);
      
      setUserLikes((prev) => {
        const next = new Set(prev);
        if (isLiked) {
          next.add(creationId);
        } else {
          next.delete(creationId);
        }
        return next;
      });
      
      setWorks((prev) =>
        prev.map((w) =>
          w.id === creationId
            ? { ...w, likes: isLiked ? w.likes + 1 : Math.max(0, w.likes - 1) }
            : w
        )
      );
    } catch (error) {
      ErrorHandler.logError(error, 'WorkGallery.handleLike');
      toast.error(ErrorHandler.getUserMessage(error));
    }
  };

  const handlePlay = (work: Creation) => {
    navigate(`/creation/${work.id}`);
  };

  // Placeholder data when no creations exist
  const placeholderWorks = [
    { id: "1", title: "Pixel Pong Battle", author: "Alex", plays: 1234, likes: 89 },
    { id: "2", title: "What to Eat?", author: "Sam", plays: 5678, likes: 234 },
    { id: "3", title: "Focus Timer Pro", author: "Maya", plays: 3456, likes: 156 },
    { id: "4", title: "Meme Factory", author: "Jordan", plays: 8901, likes: 567 },
    { id: "5", title: "Type Racer", author: "Chris", plays: 2345, likes: 123 },
    { id: "6", title: "Memory Cards", author: "Taylor", plays: 4567, likes: 234 },
  ];

  const hasRealWorks = works.length > 0;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-end justify-between mb-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary">热门</span>
          </div>
          <h2 className="font-display text-foreground">社区作品</h2>
          <p className="text-muted-foreground mt-2">
            发现并体验社区创作者的游戏
          </p>
        </div>
        <a href="/community" className="text-sm text-primary hover:underline font-medium">
          查看全部 →
        </a>
      </div>

      {/* Gallery */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {hasRealWorks
          ? works.map((work, index) => (
              <div
                key={work.id}
                className="group cursor-pointer animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => handlePlay(work)}
              >
                {/* Preview */}
                <div className="relative aspect-video rounded-xl overflow-hidden mb-3 border border-border group-hover:border-primary/30 transition-all duration-300 shadow-soft group-hover:shadow-medium">
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${gradients[index % gradients.length]} opacity-30 group-hover:opacity-50 transition-opacity`}
                  />

                  {/* Mini preview */}
                  <div className="absolute inset-0 opacity-50">
                    <iframe
                      srcDoc={work.html_code}
                      className="w-full h-full border-0 pointer-events-none"
                      sandbox=""
                      title={work.title}
                      loading="lazy"
                    />
                  </div>

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
                    <button
                      onClick={(e) => handleLike(e, work.id)}
                      className={`flex items-center gap-1 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-full transition-colors ${
                        userLikes.has(work.id) ? "text-primary" : "text-foreground"
                      }`}
                    >
                      <Heart
                        className={`w-3 h-3 ${userLikes.has(work.id) ? "fill-current" : ""}`}
                      />
                      {work.likes}
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-display text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {work.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      Creator
                    </p>
                  </div>
                </div>
              </div>
            ))
          : placeholderWorks.map((work, index) => (
              <div
                key={work.id}
                className="group animate-fade-in opacity-60"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative aspect-video rounded-xl overflow-hidden mb-3 border border-border shadow-soft">
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${gradients[index % gradients.length]} opacity-30`}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs text-muted-foreground bg-background/80 px-3 py-1 rounded-full">
                      Coming soon
                    </span>
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
                <div>
                  <h4 className="font-display text-sm font-semibold text-foreground line-clamp-1">
                    {work.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">by {work.author}</p>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
};

export default WorkGallery;
