import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import AICreator from "@/components/AICreator";
import WorkGallery from "@/components/WorkGallery";
import {
  Gamepad2,
  Timer,
  Palette,
  Sparkles,
  Github,
  Twitter,
  ArrowRight,
  FlaskConical,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const featuredTemplates = [
  {
    title: "Pong Game",
    emoji: "🏓",
    description: "经典街机游戏",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    title: "Pomodoro",
    emoji: "🍅",
    description: "专注计时器",
    gradient: "from-red-500 to-orange-500",
  },
  {
    title: "Memory Cards",
    emoji: "🎴",
    description: "记忆翻牌游戏",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    title: "Drawing Board",
    emoji: "🎨",
    description: "创意画板",
    gradient: "from-green-500 to-teal-500",
  },
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-24 pb-16">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute top-40 right-20 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 w-full max-w-4xl mx-auto">
          <div className="flex flex-col items-center text-center mb-12">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-1.5 mb-6 animate-fade-in">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-sm font-medium text-primary tracking-wide">
                用 AI 创造一切
              </span>
            </div>

            {/* Title */}
            <h1 className="font-display animate-fade-in" style={{ animationDelay: "100ms" }}>
              <span className="block text-foreground">随心创造,</span>
              <span className="block text-gradient-primary mt-1">分享快乐</span>
            </h1>

            {/* Subtitle */}
            <p
              className="text-lg text-muted-foreground max-w-md mt-6 animate-fade-in"
              style={{ animationDelay: "200ms" }}
            >
              几分钟内将创意变成游戏和工具。
              <span className="text-foreground font-medium">无需编程。</span>
            </p>
          </div>

          {/* AI Creator */}
          <div
            className="flex justify-center animate-fade-in"
            style={{ animationDelay: "300ms" }}
          >
            <AICreator />
          </div>

          {/* Stats */}
          <div
            className="flex items-center justify-center gap-10 mt-16 animate-fade-in"
            style={{ animationDelay: "400ms" }}
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">50k+</div>
              <div className="text-sm text-muted-foreground mt-1">作品</div>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">10k+</div>
              <div className="text-sm text-muted-foreground mt-1">创作者</div>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">∞</div>
              <div className="text-sm text-muted-foreground mt-1">可能性</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Templates Section */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-xl text-foreground">精选模板</h2>
              <p className="text-sm text-muted-foreground mt-1">快速开始你的创作</p>
            </div>
            <Button 
              variant="ghost" 
              className="gap-2"
              onClick={() => navigate('/inspiration')}
            >
              查看全部 30+ 模板
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featuredTemplates.map((template, index) => (
              <div
                key={template.title}
                onClick={() => navigate('/inspiration')}
                className="group relative bg-card rounded-2xl p-5 border border-border hover:border-primary/30 transition-all duration-300 cursor-pointer hover:-translate-y-1 animate-fade-in"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                {/* Gradient bg on hover */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${template.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
                
                <div className="relative z-10">
                  <div className="text-3xl mb-3">{template.emoji}</div>
                  <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                    {template.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {template.description}
                  </p>
                </div>

                {/* Hover arrow */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                  <ArrowRight className="w-4 h-4 text-primary" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Game Lab CTA */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div 
            onClick={() => navigate('/game-lab')}
            className="relative rounded-2xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 border border-purple-500/20 p-8 cursor-pointer hover:border-purple-500/40 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <FlaskConical className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-display text-xl font-semibold">游戏实验室</h3>
                    <span className="px-2 py-0.5 text-xs bg-purple-500/20 text-purple-600 rounded-full">新功能</span>
                  </div>
                  <p className="text-muted-foreground">
                    选择多个游戏类型，让 AI 创造前所未有的融合游戏
                  </p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-3">
                <div className="flex items-center text-2xl">
                  🐍 <Zap className="w-4 h-4 text-yellow-500 mx-1" /> 🧱
                </div>
                <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <WorkGallery />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden shadow-medium">
            <div className="absolute inset-0 gradient-fun" />
            
            <div className="relative z-10 p-12 md:p-16 text-center">
              <h2 className="font-display text-2xl md:text-3xl text-white mb-4">
                准备好创造有趣的东西了吗?
              </h2>
              <p className="text-white/80 mb-8 max-w-sm mx-auto text-base">
                加入 10,000+ 创作者，将创意变为现实
              </p>
              <Button
                size="lg"
                className="bg-white text-foreground hover:bg-white/90 gap-2 shadow-soft"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                <Sparkles className="w-5 h-5 text-primary" />
                免费开始
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-border bg-muted/20">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
            {/* Logo */}
            <div>
              <div className="flex items-baseline gap-0">
                <span className="font-display font-bold text-xl tracking-tight text-gradient-primary">
                  byvibe
                </span>
                <span className="font-display font-bold text-xl tracking-tight text-foreground/50">
                  .ai
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                随心创造，分享快乐
              </p>
            </div>

            {/* Links */}
            <div className="flex items-center gap-8">
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                关于
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                帮助
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                隐私
              </a>
            </div>

            {/* Social */}
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="p-2.5 rounded-xl hover:bg-muted transition-colors"
              >
                <Twitter className="w-5 h-5 text-muted-foreground" />
              </a>
              <a
                href="#"
                className="p-2.5 rounded-xl hover:bg-muted transition-colors"
              >
                <Github className="w-5 h-5 text-muted-foreground" />
              </a>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              © 2024 byvibe.ai. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
