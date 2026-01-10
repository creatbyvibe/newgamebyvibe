import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import AICreator from "@/components/AICreator";
import WorkGallery from "@/components/WorkGallery";
import { SEO } from "@/components/SEO";
import { Logo } from "@/components/Logo";
import { useTranslation } from "react-i18next";
import {
  Sparkles,
  Github,
  Twitter,
  ArrowRight,
  FlaskConical,
  Wand2,
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
    title: "Snake",
    emoji: "🐍",
    description: "经典贪吃蛇",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    title: "Memory Cards",
    emoji: "🃏",
    description: "记忆翻牌游戏",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    title: "Drawing Board",
    emoji: "🎨",
    description: "创意画板",
    gradient: "from-orange-500 to-red-500",
  },
];

const Index = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <SEO
        title="ByVibe - AI 游戏创作平台"
        description="用 AI 将你的想法变成可玩的游戏和实用工具。无需编程，立即开始。"
      />
      <Navbar />

      {/* Hero Section - More Compact */}
      <section className="relative flex items-center justify-center px-6 pt-24 pb-12">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute top-40 right-20 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 w-full max-w-4xl mx-auto">
          <div className="flex flex-col items-center text-center mb-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-1.5 mb-4 animate-fade-in">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-sm font-medium text-primary tracking-wide">
                {t('home.badge')}
              </span>
            </div>

            {/* Title */}
            <h1 className="font-display animate-fade-in" style={{ animationDelay: "100ms" }}>
              <span className="block text-foreground">{t('home.titleLine1')}</span>
              <span className="block text-gradient-primary mt-1">{t('home.titleLine2')}</span>
            </h1>

            {/* Subtitle */}
            <p
              className="text-lg text-muted-foreground max-w-md mt-4 animate-fade-in"
              style={{ animationDelay: "200ms" }}
            >
              {t('home.subtitle')}{' '}
              <span className="text-foreground font-medium">{t('home.subtitleHighlight')}</span>
            </p>
          </div>

          {/* AI Creator */}
          <div
            className="flex justify-center animate-fade-in"
            style={{ animationDelay: "300ms" }}
          >
            <AICreator />
          </div>
        </div>
      </section>

      {/* Dual Entry Cards */}
      <section className="py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Free Creation Card */}
            <div
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="group relative rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20 p-6 cursor-pointer hover:border-primary/40 transition-all hover:-translate-y-1"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
                  <Wand2 className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-lg font-semibold text-foreground mb-1">自由创作</h3>
                  <p className="text-sm text-muted-foreground">
                    输入任何想法，AI 帮你实现。完全自由发挥你的创意。
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-all transform translate-x-0 group-hover:translate-x-1" />
              </div>
            </div>

            {/* Game Lab Card */}
            <div
              onClick={() => navigate('/game-lab')}
              className="group relative rounded-2xl bg-gradient-to-br from-purple-500/5 to-pink-500/5 border border-purple-500/20 p-6 cursor-pointer hover:border-purple-500/40 transition-all hover:-translate-y-1"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
                  <FlaskConical className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-display text-lg font-semibold text-foreground">{t('home.gameLab')}</h3>
                    <span className="px-2 py-0.5 text-xs bg-purple-500/20 text-purple-600 rounded-full">{t('home.gameLabNew')}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t('home.gameLabDesc')}
                  </p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <span className="text-lg">🐍</span>
                  <Zap className="w-3 h-3 text-yellow-500" />
                  <span className="text-lg">🧱</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Templates Section */}
      <section className="py-12 px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-xl text-foreground">{t('home.featuredTemplates')}</h2>
              <p className="text-sm text-muted-foreground mt-1">{t('home.featuredTemplatesDesc')}</p>
            </div>
            <Button 
              variant="ghost" 
              className="gap-2"
              onClick={() => navigate('/inspiration')}
            >
              {t('home.viewAll')}
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

      {/* Gallery Section */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <WorkGallery />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden shadow-medium">
            <div className="absolute inset-0 gradient-fun" />
            
            <div className="relative z-10 p-12 md:p-16 text-center">
              <h2 className="font-display text-2xl md:text-3xl text-white mb-4">
                准备好创造有趣的东西了吗?
              </h2>
              <p className="text-white/80 mb-8 max-w-sm mx-auto text-base">
                加入创作者社区，将创意变为现实
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
      <footer className="py-12 px-6 border-t border-border bg-muted/20">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
            {/* Logo */}
            <div>
              <Logo size="lg" variant="footer" />
              <p className="text-sm text-muted-foreground mt-2">
                {t('home.footerDesc')}
              </p>
            </div>

            {/* Links */}
            <div className="flex items-center gap-8">
              <a
                href="/inspiration"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                灵感库
              </a>
              <a
                href="/game-lab"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                游戏实验室
              </a>
              <a
                href="/community"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                社区
              </a>
            </div>

            {/* Social */}
            <div className="flex items-center gap-3">
              <a
                href="https://twitter.com/byvibe_ai"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl hover:bg-muted transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5 text-muted-foreground" />
              </a>
              <a
                href="https://github.com/creatbyvibe"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl hover:bg-muted transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5 text-muted-foreground" />
              </a>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              {t('home.copyright')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;