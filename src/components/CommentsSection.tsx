import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { Star, Send, Trash2, User, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { commentService } from "@/services/commentService";
import { userService } from "@/services/userService";
import { ErrorHandler } from "@/lib/errorHandler";

interface Comment {
  id: string;
  content: string;
  rating: number | null;
  created_at: string;
  user_id: string;
  profile?: {
    username: string;
    avatar_url: string | null;
  };
}

interface CommentsSectionProps {
  creationId: string;
}

const CommentsSection = ({ creationId }: CommentsSectionProps) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    fetchComments();
  }, [creationId]);

  const fetchComments = async () => {
    try {
      const data = await commentService.getCommentsByCreationId(creationId);
      setComments(data);
    } catch (error) {
      ErrorHandler.logError(error, 'CommentsSection.fetchComments');
      toast.error(ErrorHandler.getUserMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error(t('errors.pleaseLogin'));
      return;
    }

    if (!newComment.trim()) {
      toast.error(t('creation.commentPlaceholder'));
      return;
    }

    setSubmitting(true);
    try {
      const newCommentData = await commentService.createComment({
        creation_id: creationId,
        content: newComment.trim(),
        rating: newRating > 0 ? newRating : undefined,
      });

      // 获取用户资料
      const profile = await userService.getProfile(user.id);

      setComments([
        { ...newCommentData, profile: profile || undefined } as Comment,
        ...comments,
      ]);
      setNewComment("");
      setNewRating(0);
      toast.success(t('creation.commentPosted'));
    } catch (error) {
      ErrorHandler.logError(error, 'CommentsSection.handleSubmit');
      toast.error(ErrorHandler.getUserMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!user) {
      toast.error("请先登录");
      return;
    }

    try {
      await commentService.deleteComment(commentId);
      setComments(comments.filter((c) => c.id !== commentId));
      toast.success("评论已删除");
    } catch (error) {
      ErrorHandler.logError(error, 'CommentsSection.handleDelete');
      toast.error(ErrorHandler.getUserMessage(error));
    }
  };

  const averageRating = comments.length > 0
    ? comments.filter(c => c.rating).reduce((acc, c) => acc + (c.rating || 0), 0) / comments.filter(c => c.rating).length
    : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: comments.filter(c => c.rating === rating).length,
  }));

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      {comments.some(c => c.rating) && (
        <div className="bg-muted/30 rounded-2xl p-6 border border-border">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-foreground">
                {averageRating.toFixed(1)}
              </div>
              <div className="flex items-center justify-center gap-0.5 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(averageRating)
                        ? "text-yellow-500 fill-yellow-500"
                        : "text-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {comments.filter(c => c.rating).length} {t('creation.ratings')}
              </div>
            </div>
            
            <div className="flex-1 space-y-1">
              {ratingCounts.map(({ rating, count }) => (
                <div key={rating} className="flex items-center gap-2 text-sm">
                  <span className="w-3 text-muted-foreground">{rating}</span>
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-500 rounded-full transition-all"
                      style={{
                        width: `${comments.filter(c => c.rating).length > 0 ? (count / comments.filter(c => c.rating).length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="w-8 text-muted-foreground text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Write Comment */}
      <div className="bg-muted/30 rounded-2xl p-6 border border-border">
        <h3 className="font-display font-semibold text-foreground mb-4">
          {t('creation.addComment')}
        </h3>
        
        {/* Rating Selection */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-muted-foreground">{t('creation.yourRating')}:</span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setNewRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-0.5 transition-transform hover:scale-110"
              >
                <Star
                  className={`w-6 h-6 transition-colors ${
                    star <= (hoverRating || newRating)
                      ? "text-yellow-500 fill-yellow-500"
                      : "text-muted-foreground/30"
                  }`}
                />
              </button>
            ))}
          </div>
          {newRating > 0 && (
            <button
              onClick={() => setNewRating(0)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              {t('common.cancel')}
            </button>
          )}
        </div>

        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={t('creation.commentPlaceholder')}
          className="min-h-[100px] resize-none mb-4"
        />
        
        <Button
          onClick={handleSubmit}
          disabled={submitting || !newComment.trim()}
          className="gap-2"
        >
          {submitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          {t('creation.postComment')}
        </Button>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        <h3 className="font-display font-semibold text-foreground">
          Reviews ({comments.length})
        </h3>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No reviews yet. Be the first to share your thoughts!
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="bg-background rounded-xl p-4 border border-border"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-foreground">
                          {comment.profile?.username?.split("@")[0] || "User"}
                        </span>
                        {comment.rating && (
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3 h-3 ${
                                  star <= comment.rating!
                                    ? "text-yellow-500 fill-yellow-500"
                                    : "text-muted-foreground/30"
                                }`}
                              />
                            ))}
                          </div>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-muted-foreground mt-1 whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                  
                  {user?.id === comment.user_id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(comment.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentsSection;