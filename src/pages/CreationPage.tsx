import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";
import ShareButtons from "@/components/ShareButtons";
import CommentsSection from "@/components/CommentsSection";
import { creationService } from "@/services/creationService";
import { userService } from "@/services/userService";
import { ErrorHandler } from "@/lib/errorHandler";
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
  MessageCircle,
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
  const { t } = useTranslation();
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
    if (!id) return;
    
    try {
      const data = await creationService.getCreationById(id);
      
      if (!data || !data.is_public) {
        toast.error(t('creation.notPublic'));
        navigate("/");
        return;
      }

      setCreation(data as Creation);
      setLikeCount(data.likes || 0);

      // Fetch creator profile
      const profileData = await userService.getProfile(data.user_id);
      if (profileData) {
        setProfile(profileData as Profile);
      }
    } catch (error) {
      ErrorHandler.logError(error, 'CreationPage.fetchCreation');
      toast.error(ErrorHandler.getUserMessage(error));
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const incrementPlays = async () => {
    if (!id) return;
    try {
      await creationService.incrementPlays(id);
    } catch (error) {
      // 静默失败，不影响用户体验
      ErrorHandler.logError(error, 'CreationPage.incrementPlays');
    }
  };

  const checkUserInteractions = async () => {
    if (!user || !id) return;

    try {
      // Check if liked
      const hasLiked = await userService.hasLiked(user.id, id);
      setIsLiked(hasLiked);

      // Check if bookmarked
      const hasBookmarked = await userService.hasBookmarked(user.id, id);
      setIsBookmarked(hasBookmarked);
    } catch (error) {
      ErrorHandler.logError(error, 'CreationPage.checkUserInteractions');
    }
  };

  const handleLike = async () => {
    if (!user || !id) {
      toast.error("请先登录");
      return;
    }

    try {
      const newLikedState = await userService.toggleLike(user.id, id);
      setIsLiked(newLikedState);
      setLikeCount((prev) => (newLikedState ? prev + 1 : Math.max(0, prev - 1)));
    } catch (error) {
      ErrorHandler.logError(error, 'CreationPage.handleLike');
      toast.error(ErrorHandler.getUserMessage(error));
    }
  };

  const handleBookmark = async () => {
    if (!user || !id) {
      toast.error("请先登录");
      return;
    }

    try {
      const newBookmarkedState = await userService.toggleBookmark(user.id, id);
      setIsBookmarked(newBookmarkedState);
      toast.success(newBookmarkedState ? "已添加收藏" : "已取消收藏");
    } catch (error) {
      ErrorHandler.logError(error, 'CreationPage.handleBookmark');
      toast.error(ErrorHandler.getUserMessage(error));
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
  const shareText = `来看看我在 byvibe.ai 上创作的 "${creation.title}"！🎮✨`;

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
            返回
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
                  <span>{profile?.username || t('creation.by')}</span>
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
                {t('creation.bookmark')}
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
                  {creation.plays.toLocaleString()} {t('creation.plays')}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  {likeCount} {t('creation.likes')}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFullscreen(true)}
                className="gap-2"
              >
                <Maximize2 className="w-4 h-4" />
                {t('common.fullscreen')}
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
              {t('creation.shareTitle')}
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
                      toast.success("链接已复制！");
                    }}
                  >
                    复制
                  </Button>
                </div>
              </div>
              <ShareButtons url={shareUrl} title={creation.title} text={shareText} variant="large" />
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="max-w-5xl mx-auto px-6 mt-8">
          <div className="flex items-center gap-2 mb-6">
            <MessageCircle className="w-5 h-5 text-primary" />
            <h2 className="font-display font-semibold text-xl text-foreground">
              {t('creation.commentsAndFeedback')}
            </h2>
          </div>
          <CommentsSection creationId={creation.id} />
        </div>
      </main>
    </div>
  );
};

export default CreationPage;
