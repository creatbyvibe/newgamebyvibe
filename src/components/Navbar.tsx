import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Zap, Menu, X } from "lucide-react";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/80 backdrop-blur-lg border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-neon flex items-center justify-center">
              <span className="text-lg font-bold text-primary-foreground">B</span>
            </div>
            <span className="font-display font-bold text-xl text-foreground">
              ByVibe
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#explore"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              探索
            </a>
            <a
              href="#gallery"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              画廊
            </a>
            <a
              href="#about"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              关于
            </a>
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="default" size="sm" className="gap-2">
              <Zap className="w-4 h-4" />
              开始创作
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-4">
              <a
                href="#explore"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-2"
              >
                探索
              </a>
              <a
                href="#gallery"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-2"
              >
                画廊
              </a>
              <a
                href="#about"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-2"
              >
                关于
              </a>
              <Button variant="default" size="sm" className="gap-2 w-full">
                <Zap className="w-4 h-4" />
                开始创作
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
