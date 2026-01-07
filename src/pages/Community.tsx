import { useState, useEffect } from "react";
import { Play, Heart, User, TrendingUp, Clock, Flame, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
  const [works, setWorks] = useState<Creation[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<SortType>("trending");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchWorks();
    if (user) {
      fetchUserLikes();
    }
  }, [user, sortBy]);

  const fetchWorks = async () => {
    try {
      let query = supabase
        .from("creations")
        .select("id, title, prompt, html_code, plays, likes, is_public, user_id, created_at")
        .eq("is_public", true);

      switch (sortBy) {
        case "newest":
          query = query.order("created_at", { ascending: false });
          break;
        case "popular":
          query = query.order("plays", { ascending: false });
          break;
        case "trending":
        default:
          query = query.order("likes", { ascending: false });
          break;
      }

      const { data, error } = await query.limit(30);

      if (error) throw error;
      setWorks((data as Creation[]) || []);
    } catch (error) {
      console.error("Error fetching works:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserLikes = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from("creation_likes")
        .select("creation_id")
        .eq("user_id", user.id);

      if (data) {
        setUserLikes(new Set(data.map((like) => like.creation_id)));
      }
    } catch (error) {
      console.error("Error fetching likes:", error);
    }
  };

  const handleLike = async (e: React.MouseEvent, creationId: string) => {
    e.stopPropagation();
    if (!user) {
      toast.error("请先登录");
      return;
    }

    try {
      if (userLikes.has(creationId)) {
        await supabase
          .from("creation_likes")
          .delete()
          .eq("user_id", user.id)
          .eq("creation_id", creationId);

        setUserLikes((prev) => {
          const next = new Set(prev);
          next.delete(creationId);
          return next;
        });
        setWorks((prev) =>
          prev.map((w) => (w.id === creationId ? { ...w, likes: w.likes - 1 } : w))
        );
      } else {
        await supabase.from("creation_likes").insert({
          user_id: user.id,
          creation_id: creationId,
        });

        setUserLikes((prev) => new Set(prev).add(creationId));
        setWorks((prev) =>
          prev.map((w) => (w.id === creationId ? { ...w, likes: w.likes + 1 } : w))
        );
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handlePlay = (work: Creation) => {
    navigate(`/creation/${work.id}`);
  };

  const filteredWorks = works.filter((work) =>
    work.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    work.prompt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortOptions: { key: SortType; label: string; icon: React.ReactNode }[] = [
    { key: "trending", label: "热门", icon: <Flame className="w-4 h-4" /> },
    { key: "newest", label: "最新", icon: <Clock className="w-4 h-4" /> },
    { key: "popular", label: "最多游玩", icon: <TrendingUp className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20 sm:pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">社区作品</h1>
            <p className="text-muted-foreground mt-2">
              发现和体验社区创作者的精彩作品
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
                placeholder="搜索作品..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Gallery */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-video bg-muted rounded-xl mb-3" />
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredWorks.length === 0 ? (
            <div className="text-center py-16 bg-muted/30 rounded-2xl border border-border">
              <p className="text-muted-foreground mb-4">
                {searchQuery ? "没有找到匹配的作品" : "还没有公开的作品"}
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
                        创作者
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

export default Community;