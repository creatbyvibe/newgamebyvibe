import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Menu, X } from "lucide-react";

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
          ? "bg-background/80 backdrop-blur-lg border-b border-border shadow-soft"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Pure text */}
          <a href="/" className="flex items-center">
            <span className="font-display font-bold text-2xl text-gradient-primary">
              ByVibe
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#explore"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Explore
            </a>
            <a
              href="#gallery"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Gallery
            </a>
            <a
              href="#about"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              About
            </a>
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex items-center gap-4">
            <Button size="sm" className="gap-2">
              <Sparkles className="w-4 h-4" />
              Start Creating
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
          <div className="md:hidden py-4 border-t border-border animate-fade-in bg-background">
            <div className="flex flex-col gap-4">
              <a
                href="#explore"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-2"
              >
                Explore
              </a>
              <a
                href="#gallery"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-2"
              >
                Gallery
              </a>
              <a
                href="#about"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-2"
              >
                About
              </a>
              <Button size="sm" className="gap-2 w-full">
                <Sparkles className="w-4 h-4" />
                Start Creating
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
