import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import ShareButtons from "@/components/ShareButtons";
import {
  Play,
  Heart,
  Bookmark,
  ArrowLeft,
  Maximize2,
  Minimize2,
  Loader2,
  User,
  Calendar,
  Eye,
} from "lucide-react";
import { toast } from "sonner";

interface Creation {
  id: string;
  title: string;
  prompt: string;
  html_code: string;
  plays: number;
  likes: number;
  is_public: boolean;
  created_at: string;
  user_id: string;
}

interface Profile {
  username: string;
  avatar_url: string | null;
}

const CreationPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [creation, setCreation] = useState<Creation | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    if (id) {
      fetchCreation();
      incrementPlays();
    }
  }, [id]);

  useEffect(() => {
    if (user && id) {
      checkUserInteractions();
    }
  }, [user, id]);

  const fetchCreation = async () => {
    try {
      const { data, error } = await supabase
        .from("creations")
        .select("*")
        .eq("id", id)
        .eq("is_public", true)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        toast.error("Creation not found");
        navigate("/");
        return;
      }

      setCreation(data);
      setLikeCount(data.likes);

      // Fetch creator profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("username, avatar_url")
        .eq("id", data.user_id)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData);
      }
    } catch (error) {
      console.error("Error fetching creation:", error);
      toast.error("Failed to load creation");
    } finally {
      setLoading(false);
    }
  };

  const incrementPlays = async () => {
    if (id) {
      await supabase.rpc("increment_plays", { creation_id: id });
    }
  };

  const checkUserInteractions = async () => {
    if (!user || !id) return;

    // Check if liked
    const { data: likeData } = await supabase
      .from("creation_likes")
      .select("id")
      .eq("user_id", user.id)
      .eq("creation_id", id)
      .maybeSingle();

    setIsLiked(!!likeData);

    // Check if bookmarked
    const { data: bookmarkData } = await supabase
      .from("bookmarks")
      .select("id")
      .eq("user_id", user.id)
      .eq("creation_id", id)
      .maybeSingle();

    setIsBookmarked(!!bookmarkData);
  };

  const handleLike = async () => {
    if (!user) {
      toast.error("Please sign in to like");
      return;
    }

    try {
      if (isLiked) {
        await supabase
          .from("creation_likes")
          .delete()
          .eq("user_id", user.id)
          .eq("creation_id", id);
        setIsLiked(false);
        setLikeCount((prev) => prev - 1);
      } else {
        await supabase.from("creation_likes").insert({
          user_id: user.id,
          creation_id: id,
        });
        setIsLiked(true);
        setLikeCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      toast.error("Please sign in to bookmark");
      return;
    }

    try {
      if (isBookmarked) {
        await supabase
          .from("bookmarks")
          .delete()
          .eq("user_id", user.id)
          .eq("creation_id", id);
        setIsBookmarked(false);
        toast.success("Removed from bookmarks");
      } else {
        await supabase.from("bookmarks").insert({
          user_id: user.id,
          creation_id: id,
        });
        setIsBookmarked(true);
        toast.success("Added to bookmarks");
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!creation) {
    return null;
  }

  const shareUrl = `${window.location.origin}/creation/${creation.id}`;
  const shareText = `Check out "${creation.title}" on byvibe.ai! 🎮✨`;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Fullscreen iframe */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-white">
          <Button
            variant="outline"
            size="icon"
            className="fixed top-4 right-4 z-50"
            onClick={() => setIsFullscreen(false)}
          >
            <Minimize2 className="w-4 h-4" />
          </Button>
          <iframe
            srcDoc={creation.html_code}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-forms"
            title={creation.title}
          />
        </div>
      )}

      <main className="pt-20 pb-16">
        {/* Header */}
        <div className="max-w-5xl mx-auto px-6 py-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                {creation.title}
              </h1>
              <p className="text-muted-foreground mt-2 max-w-xl">
                {creation.prompt}
              </p>

              {/* Creator info */}
              <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span>{profile?.username?.split("@")[0] || "Creator"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(creation.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button
                variant={isLiked ? "default" : "outline"}
                size="sm"
                onClick={handleLike}
                className="gap-2"
              >
                <Heart
                  className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`}
                />
                {likeCount}
              </Button>

              <Button
                variant={isBookmarked ? "default" : "outline"}
                size="sm"
                onClick={handleBookmark}
                className="gap-2"
              >
                <Bookmark
                  className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`}
                />
                Save
              </Button>

              <ShareButtons url={shareUrl} title={creation.title} text={shareText} />
            </div>
          </div>
        </div>

        {/* Game preview */}
        <div className="max-w-5xl mx-auto px-6">
          <div className="relative rounded-2xl overflow-hidden border border-border shadow-medium bg-white">
            {/* Stats bar */}
            <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {creation.plays.toLocaleString()} plays
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  {likeCount} likes
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFullscreen(true)}
                className="gap-2"
              >
                <Maximize2 className="w-4 h-4" />
                Fullscreen
              </Button>
            </div>

            {/* iframe */}
            <div className="aspect-video md:aspect-[16/10]">
              <iframe
                srcDoc={creation.html_code}
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-forms"
                title={creation.title}
              />
            </div>
          </div>
        </div>

        {/* Share section */}
        <div className="max-w-5xl mx-auto px-6 mt-8">
          <div className="bg-muted/30 rounded-2xl p-6 border border-border">
            <h3 className="font-display font-semibold text-foreground mb-4">
              Share this creation
            </h3>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1 w-full">
                <div className="flex items-center gap-2 bg-background rounded-lg border border-border px-4 py-2">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 bg-transparent text-sm text-muted-foreground outline-none"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(shareUrl);
                      toast.success("Link copied!");
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </div>
              <ShareButtons url={shareUrl} title={creation.title} text={shareText} variant="large" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreationPage;
