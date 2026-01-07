import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Share2, Twitter, Facebook, Link2, MessageCircle } from "lucide-react";
import { toast } from "sonner";

interface ShareButtonsProps {
  url: string;
  title: string;
  text?: string;
  variant?: "default" | "large";
}

const ShareButtons = ({ url, title, text, variant = "default" }: ShareButtonsProps) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text || title);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: text || title,
          url,
        });
      } catch (error) {
        // User cancelled or error
      }
    }
  };

  if (variant === "large") {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => window.open(shareLinks.twitter, "_blank")}
        >
          <Twitter className="w-4 h-4" />
          Twitter
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => window.open(shareLinks.facebook, "_blank")}
        >
          <Facebook className="w-4 h-4" />
          Facebook
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => window.open(shareLinks.whatsapp, "_blank")}
        >
          <MessageCircle className="w-4 h-4" />
          WhatsApp
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="w-4 h-4" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {navigator.share && (
          <DropdownMenuItem onClick={handleNativeShare} className="gap-2 cursor-pointer">
            <Share2 className="w-4 h-4" />
            Share...
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={() => window.open(shareLinks.twitter, "_blank")}
          className="gap-2 cursor-pointer"
        >
          <Twitter className="w-4 h-4" />
          Twitter / X
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => window.open(shareLinks.facebook, "_blank")}
          className="gap-2 cursor-pointer"
        >
          <Facebook className="w-4 h-4" />
          Facebook
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => window.open(shareLinks.whatsapp, "_blank")}
          className="gap-2 cursor-pointer"
        >
          <MessageCircle className="w-4 h-4" />
          WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyLink} className="gap-2 cursor-pointer">
          <Link2 className="w-4 h-4" />
          Copy Link
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ShareButtons;
