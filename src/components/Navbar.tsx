import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Menu, X, User, LogOut, CreditCard } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import AuthModal from "./AuthModal";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Logo } from "./Logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const { user, signOut, loading } = useAuth();
  const { t } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-background/80 backdrop-blur-lg border-b border-border shadow-soft"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Logo size="lg" href="/" />

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a
                href="/inspiration"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {t('navbar.inspiration')}
              </a>
              <a
                href="/game-lab"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {t('navbar.gameLab')}
              </a>
              <a
                href="/card-game"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                <CreditCard className="w-4 h-4" />
                {t('navbar.cardGame')}
              </a>
              <a
                href="/community"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {t('navbar.community')}
              </a>
            </div>

            {/* CTA / User */}
            <div className="hidden md:flex items-center gap-3">
              <LanguageSwitcher />
              {loading ? null : user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <User className="w-4 h-4" />
                      {user.email?.split("@")[0]}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <a href="/my-creations">{t('navbar.myCreations')}</a>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                      <LogOut className="w-4 h-4 mr-2" />
                      {t('navbar.logout')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button variant="ghost" size="sm" onClick={() => setShowAuthModal(true)}>
                    {t('navbar.login')}
                  </Button>
                  <Button size="sm" className="gap-2" onClick={() => setShowAuthModal(true)}>
                    <Sparkles className="w-4 h-4" />
                    {t('navbar.signup')}
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-foreground"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-border animate-fade-in bg-background">
              <div className="flex flex-col gap-4">
                <div className="px-2 pb-2">
                  <LanguageSwitcher />
                </div>
                <a
                  href="/inspiration"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                >
                  {t('navbar.inspiration')}
                </a>
                <a
                  href="/game-lab"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                >
                  {t('navbar.gameLab')}
                </a>
                <a
                  href="/card-game"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2 flex items-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  {t('navbar.cardGame')}
                </a>
                <a
                  href="/community"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                >
                  {t('navbar.community')}
                </a>
                {user ? (
                  <>
                    <a
                      href="/my-creations"
                      className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                    >
                      {t('navbar.myCreations')}
                    </a>
                    <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-2">
                      <LogOut className="w-4 h-4" />
                      {t('navbar.logout')}
                    </Button>
                  </>
                ) : (
                  <Button size="sm" className="gap-2 w-full mt-2" onClick={() => setShowAuthModal(true)}>
                    <Sparkles className="w-4 h-4" />
                    {t('navbar.signup')}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </>
  );
};

export default Navbar;
