import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { Play, Heart, User, TrendingUp, Clock, Flame, Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { creationService } from "@/services/creationService";
import { userService } from "@/services/userService";
import { ErrorHandler } from "@/lib/errorHandler";
import { debounce } from "@/lib/utils/debounce";
import { CreationListSkeleton } from "@/components/CreationListSkeleton";

interface Creation {
  id: string;
  title: string;
  prompt: string;
  html_code: string;
  plays: number;
  likes: number;
  is_public: boolean;
  user_id: string;
  created_at: string;
}

type SortType = "trending" | "newest" | "popular";

const gradients = [
  "from-primary to-highlight",
  "from-secondary to-accent",
  "from-accent to-info",
  "from-info to-secondary",
  "from-highlight to-primary",
  "from-primary to-accent",
];

const Community = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [works, setWorks] = useState<Creation[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<SortType>("trending");
  const [searchQuery, setSearchQuery] = useState("");

  const sortOptions = useMemo(() => [
    { key: "trending" as SortType, label: t('community.trending'), icon: <Flame className="w-4 h-4" /> },
    { key: "newest" as SortType, label: t('community.newest'), icon: <Clock className="w-4 h-4" /> },
    { key: "popular" as SortType, label: t('community.popular'), icon: <TrendingUp className="w-4 h-4" /> },
  ], [t]);

  useEffect(() => {
    fetchWorks();
    if (user) {
      fetchUserLikes();
    }
  }, [user, sortBy, fetchWorks, fetchUserLikes]);

  // 搜索输入变化时使用防抖
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim() || !searchQuery.trim()) {
        fetchWorks();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, fetchWorks]);

  const fetchWorks = useCallback(async () => {
    try {
      let data: Creation[];
      
      if (searchQuery.trim()) {
        data = await creationService.searchCreations(searchQuery.trim(), 30);
      } else {
        // 获取公开创作，然后按排序类型排序
        const allData = await creationService.getAllPublicCreations();
        
        switch (sortBy) {
          case "newest":
            data = allData.sort((a, b) => 
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            ).slice(0, 30) as Creation[];
            break;
          case "popular":
            data = allData.sort((a, b) => (b.plays || 0) - (a.plays || 0)).slice(0, 30) as Creation[];
            break;
          case "trending":
          default:
            data = allData.sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 30) as Creation[];
            break;
        }
      }
      
      setWorks(data);
    } catch (error) {
      ErrorHandler.logError(error, 'Community.fetchWorks');
      toast.error(ErrorHandler.getUserMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const fetchUserLikes = useCallback(async () => {
    if (!user) return;
    try {
      const likes = await userService.getUserLikes(user.id);
      setUserLikes(new Set(likes));
    } catch (error) {
      ErrorHandler.logError(error, 'Community.fetchUserLikes');
    }
  }, [user]);

  const handleLike = useCallback(async (e: React.MouseEvent, creationId: string) => {
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
      ErrorHandler.logError(error, 'Community.handleLike');
      toast.error(ErrorHandler.getUserMessage(error));
    }
  }, [user, userLikes, works]);

  const handlePlay = useCallback((work: Creation) => {
    navigate(`/creation/${work.id}`);
  }, [navigate]);

  // 如果已经在 fetchWorks 中搜索，这里不需要再次过滤
  // 但如果需要客户端过滤，使用 useMemo 优化
  const filteredWorks = useMemo(() => {
    if (!searchQuery.trim()) return works;
    const query = searchQuery.toLowerCase();
    return works.filter((work) =>
      work.title.toLowerCase().includes(query) ||
      work.prompt.toLowerCase().includes(query)
    );
  }, [works, searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20 sm:pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">{t('community.title')}</h1>
            <p className="text-muted-foreground mt-2">
              {t('community.description')}
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            {/* Sort Tabs */}
            <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg">
              {sortOptions.map((option) => (
                <button
                  key={option.key}
                  onClick={() => setSortBy(option.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    sortBy === option.key
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {option.icon}
                  {option.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('community.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Gallery */}
          {loading ? (
            <CreationListSkeleton count={6} />
          ) : filteredWorks.length === 0 ? (
            <div className="text-center py-16 bg-muted/30 rounded-2xl border border-border">
              <p className="text-muted-foreground mb-4">
                {searchQuery ? t('community.noResults') : t('community.noPublicCreations')}
              </p>
              <Button onClick={() => navigate("/")} size="sm">
                创建第一个作品
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWorks.map((work, index) => (
                <div
                  key={work.id}
                  className="group cursor-pointer animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
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
                        {work.user_id ? t('community.creator') : t('community.anonymous')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default memo(Community);