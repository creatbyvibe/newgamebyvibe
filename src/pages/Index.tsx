import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import AICreator from "@/components/AICreator";
import { BentoGrid, BentoItem } from "@/components/BentoGrid";
import WorkGallery from "@/components/WorkGallery";
import {
  Gamepad2,
  Dices,
  Music,
  Palette,
  Timer,
  MessageCircle,
  Sparkles,
  Github,
  Twitter,
} from "lucide-react";

const templates = [
  {
    title: "Pong Game",
    description: "Classic arcade game with paddle controls",
    icon: Gamepad2,
    gradient: "primary" as const,
    size: "large" as const,
  },
  {
    title: "Decision Dice",
    description: "Can't decide? Let fate choose",
    icon: Dices,
    gradient: "secondary" as const,
    size: "small" as const,
  },
  {
    title: "Beat Keeper",
    description: "Metronome for practice sessions",
    icon: Music,
    gradient: "accent" as const,
    size: "small" as const,
  },
  {
    title: "Meme Maker",
    description: "Create & share custom memes",
    icon: Palette,
    gradient: "fun" as const,
    size: "medium" as const,
  },
  {
    title: "Pomodoro",
    description: "25 min focus, 5 min break",
    icon: Timer,
    gradient: "secondary" as const,
    size: "small" as const,
  },
  {
    title: "Quick Chat",
    description: "Temporary chat rooms",
    icon: MessageCircle,
    gradient: "primary" as const,
    size: "small" as const,
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-20">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute top-40 right-20 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 w-full max-w-6xl mx-auto">
          <div className="flex flex-col items-center text-center mb-12">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-8 animate-fade-in">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                Create anything with AI
              </span>
            </div>

            {/* Title */}
            <h1
              className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-foreground mb-6 animate-fade-in leading-tight"
              style={{ animationDelay: "100ms" }}
            >
              One prompt.
              <br />
              <span className="text-gradient-primary">One creation.</span>
            </h1>

            {/* Subtitle */}
            <p
              className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl animate-fade-in"
              style={{ animationDelay: "200ms" }}
            >
              Turn your ideas into fun games and tools in minutes.
              <span className="text-foreground font-medium"> No coding needed.</span>
            </p>
          </div>

          {/* AI Creator - Centered */}
          <div
            className="flex justify-center animate-fade-in"
            style={{ animationDelay: "300ms" }}
          >
            <AICreator />
          </div>

          {/* Quick stats */}
          <div
            className="flex items-center justify-center gap-8 mt-16 animate-fade-in"
            style={{ animationDelay: "400ms" }}
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">50k+</div>
              <div className="text-sm text-muted-foreground">Creations</div>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">10k+</div>
              <div className="text-sm text-muted-foreground">Creators</div>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">∞</div>
              <div className="text-sm text-muted-foreground">Possibilities</div>
            </div>
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section id="explore" className="py-24 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Start from a template
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Pick a starter or describe your own idea
            </p>
          </div>

          <BentoGrid>
            {templates.map((template, index) => (
              <BentoItem
                key={template.title}
                {...template}
                delay={index * 80}
              />
            ))}
          </BentoGrid>

          <div className="text-center mt-12">
            <Button variant="outline" size="lg" className="gap-2">
              Browse 100+ templates
            </Button>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <WorkGallery />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden shadow-medium">
            {/* Background */}
            <div className="absolute inset-0 gradient-fun" />
            
            {/* Content */}
            <div className="relative z-10 p-12 md:p-16 text-center">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
                Ready to create something fun?
              </h2>
              <p className="text-white/80 mb-8 max-w-md mx-auto">
                Join 10,000+ creators turning ideas into reality
              </p>
              <Button
                size="lg"
                className="bg-white text-foreground hover:bg-white/90 gap-2 shadow-soft"
              >
                <Sparkles className="w-5 h-5 text-primary" />
                Start for free
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <div>
              <span className="font-display font-bold text-2xl text-gradient-primary">
                ByVibe
              </span>
              <p className="text-sm text-muted-foreground mt-1">
                One prompt, one creation.
              </p>
            </div>

            {/* Links */}
            <div className="flex items-center gap-6">
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                About
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Help
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy
              </a>
            </div>

            {/* Social */}
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="p-2 rounded-xl hover:bg-muted transition-colors"
              >
                <Twitter className="w-5 h-5 text-muted-foreground" />
              </a>
              <a
                href="#"
                className="p-2 rounded-xl hover:bg-muted transition-colors"
              >
                <Github className="w-5 h-5 text-muted-foreground" />
              </a>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              © 2024 ByVibe. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
