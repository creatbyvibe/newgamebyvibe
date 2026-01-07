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
  Zap,
  Github,
  Twitter,
} from "lucide-react";

const templates = [
  {
    title: "弹球小游戏",
    description: "经典弹球，键盘控制，看你能得多少分",
    icon: Gamepad2,
    gradient: "neon" as const,
    size: "large" as const,
  },
  {
    title: "骰子决定器",
    description: "选择困难？让骰子决定",
    icon: Dices,
    gradient: "cyber" as const,
    size: "small" as const,
  },
  {
    title: "节拍器",
    description: "练琴练舞必备",
    icon: Music,
    gradient: "sunset" as const,
    size: "small" as const,
  },
  {
    title: "表情包生成器",
    description: "上传图片，添加文字，一键生成",
    icon: Palette,
    gradient: "electric" as const,
    size: "medium" as const,
  },
  {
    title: "番茄钟",
    description: "25分钟专注，高效工作",
    icon: Timer,
    gradient: "cyber" as const,
    size: "small" as const,
  },
  {
    title: "匿名聊天室",
    description: "临时聊天，聊完即焚",
    icon: MessageCircle,
    gradient: "neon" as const,
    size: "small" as const,
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-20">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 w-full max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left - Copy */}
            <div className="text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-card rounded-full px-4 py-2 border border-border mb-6 animate-fade-in">
                <span className="text-xs font-medium text-primary uppercase tracking-wider">
                  摸鱼神器
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">
                  5分钟创造
                </span>
              </div>

              {/* Title */}
              <h1
                className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mb-6 animate-fade-in leading-tight"
                style={{ animationDelay: "100ms" }}
              >
                一句话
                <br />
                <span className="text-gradient-neon">一个玩具</span>
              </h1>

              {/* Subtitle */}
              <p
                className="text-lg md:text-xl text-muted-foreground mb-8 max-w-md mx-auto lg:mx-0 animate-fade-in"
                style={{ animationDelay: "200ms" }}
              >
                上班无聊？用 ByVibe 把你的想法变成有趣的小游戏、小工具。
                <span className="text-foreground font-medium">
                  {" "}
                  无需代码。
                </span>
              </p>

              {/* Quick stats */}
              <div
                className="flex items-center justify-center lg:justify-start gap-6 animate-fade-in"
                style={{ animationDelay: "300ms" }}
              >
                <div>
                  <div className="text-2xl font-bold text-foreground">50k+</div>
                  <div className="text-xs text-muted-foreground">作品</div>
                </div>
                <div className="w-px h-8 bg-border" />
                <div>
                  <div className="text-2xl font-bold text-foreground">10k+</div>
                  <div className="text-xs text-muted-foreground">创作者</div>
                </div>
                <div className="w-px h-8 bg-border" />
                <div>
                  <div className="text-2xl font-bold text-primary">∞</div>
                  <div className="text-xs text-muted-foreground">可能性</div>
                </div>
              </div>
            </div>

            {/* Right - AI Creator */}
            <div
              className="animate-fade-in"
              style={{ animationDelay: "400ms" }}
            >
              <AICreator />
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-subtle">
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
            <div className="w-1 h-2 rounded-full bg-primary" />
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section id="explore" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              从模板开始，<span className="text-gradient-neon">秒变创作者</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              选择一个模板作为起点，或者直接描述你的想法
            </p>
          </div>

          <BentoGrid>
            {templates.map((template, index) => (
              <BentoItem
                key={template.title}
                {...template}
                delay={index * 100}
              />
            ))}
          </BentoGrid>

          <div className="text-center mt-10">
            <Button variant="outline" size="lg" className="gap-2">
              查看全部 100+ 模板
            </Button>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-24 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <WorkGallery />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 gradient-neon opacity-90" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_transparent_0%,_hsl(var(--background))_100%)] opacity-40" />

            {/* Content */}
            <div className="relative z-10 p-10 md:p-16 text-center">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-4">
                准备好摸鱼了吗？
              </h2>
              <p className="text-primary-foreground/80 mb-8 max-w-md mx-auto">
                加入 10,000+ 创作者，用 ByVibe 把无聊时间变成创造时间
              </p>
              <Button
                size="lg"
                className="bg-background text-foreground hover:bg-background/90 gap-2"
              >
                <Zap className="w-5 h-5 text-primary" />
                免费开始创作
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg gradient-neon flex items-center justify-center">
                <span className="text-lg font-bold text-primary-foreground">
                  B
                </span>
              </div>
              <div>
                <span className="font-display font-bold text-foreground">
                  ByVibe
                </span>
                <p className="text-xs text-muted-foreground">一句话，一个玩具</p>
              </div>
            </div>

            {/* Links */}
            <div className="flex items-center gap-6">
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
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <Twitter className="w-5 h-5 text-muted-foreground" />
              </a>
              <a
                href="#"
                className="p-2 rounded-lg hover:bg-muted transition-colors"
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
