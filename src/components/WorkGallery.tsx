import { useState, useEffect } from "react";
import { Play, Heart, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Creation {
  id: string;
  title: string;
  prompt: string;
  html_code: string;
  plays: number;
  likes: number;
  is_public: boolean;
  user_id?: string;
}

interface WorkGalleryProps {
  showPublicOnly?: boolean;
}

const WorkGallery = ({ showPublicOnly = true }: WorkGalleryProps) => {
  const { user } = useAuth();
  const [works, setWorks] = useState<Creation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWork, setSelectedWork] = useState<Creation | null>(null);
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchWorks();
    if (user) {
      fetchUserLikes();
    }
  }, [user, showPublicOnly]);

  const fetchWorks = async () => {
    try {
      let query = supabase
        .from("creations")
        .select("id, title, prompt, html_code, plays, likes, is_public, profiles(username)")
        .eq("is_public", true)
        .order("likes", { ascending: false })
        .limit(6);

      const { data, error } = await query;

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
      toast.error("Please sign in to like");
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

  const handlePlay = async (work: Creation) => {
    setSelectedWork(work);
    // Increment plays
    await supabase.rpc("increment_plays", { creation_id: work.id });
  };

  // Placeholder data when no creations exist
  const placeholderWorks = [
    { id: "1", title: "Pixel Pong Battle", author: "Alex", plays: 1234, likes: 89, gradient: "from-primary to-highlight" },
    { id: "2", title: "What to Eat?", author: "Sam", plays: 5678, likes: 234, gradient: "from-secondary to-accent" },
    { id: "3", title: "Focus Timer Pro", author: "Maya", plays: 3456, likes: 156, gradient: "from-accent to-info" },
    { id: "4", title: "Meme Factory", author: "Jordan", plays: 8901, likes: 567, gradient: "from-info to-secondary" },
    { id: "5", title: "Type Racer", author: "Chris", plays: 2345, likes: 123, gradient: "from-highlight to-primary" },
    { id: "6", title: "Memory Cards", author: "Taylor", plays: 4567, likes: 234, gradient: "from-primary to-accent" },
  ];

  const displayWorks = works.length > 0 ? works : null;
  const gradients = [
    "from-primary to-highlight",
    "from-secondary to-accent",
    "from-accent to-info",
    "from-info to-secondary",
    "from-highlight to-primary",
    "from-primary to-accent",
  ];

  if (selectedWork) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-foreground">{selectedWork.title}</h3>
          <button
            onClick={() => setSelectedWork(null)}
            className="text-sm text-primary hover:underline"
          >
            ← Back to gallery
          </button>
        </div>
        <div className="aspect-video rounded-xl overflow-hidden border border-border shadow-medium bg-white">
          <iframe
            srcDoc={selectedWork.html_code}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-forms"
            title={selectedWork.title}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-end justify-between mb-10">
        <div>
          <h2 className="font-display text-foreground">Trending Creations</h2>
          <p className="text-muted-foreground mt-2">See what others are building</p>
        </div>
        <a href="#gallery" className="text-sm text-primary hover:underline font-medium">
          View all →
        </a>
      </div>

      {/* Gallery */}
      <div className="flex gap-5 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
        {displayWorks
          ? displayWorks.map((work, index) => (
              <div
                key={work.id}
                className="flex-shrink-0 w-64 group cursor-pointer animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => handlePlay(work)}
              >
                {/* Preview */}
                <div className="relative aspect-video rounded-xl overflow-hidden mb-3 border border-border group-hover:border-primary/30 transition-all duration-300 shadow-soft group-hover:shadow-medium">
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${gradients[index % gradients.length]} opacity-30 group-hover:opacity-50 transition-opacity`}
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
                    <button
                      onClick={(e) => handleLike(e, work.id)}
                      className={`flex items-center gap-1 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-full transition-colors ${
                        userLikes.has(work.id) ? "text-primary" : "text-foreground"
                      }`}
                    >
                      <Heart className={`w-3 h-3 ${userLikes.has(work.id) ? "fill-current" : ""}`} />
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
                className="flex-shrink-0 w-64 group cursor-pointer animate-fade-in opacity-60"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative aspect-video rounded-xl overflow-hidden mb-3 border border-border shadow-soft">
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${work.gradient} opacity-30`}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">Coming soon</span>
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
