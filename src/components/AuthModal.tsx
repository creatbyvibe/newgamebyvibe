import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuthModal = ({ open, onOpenChange }: AuthModalProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { t } = useTranslation();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 检查 Supabase 配置
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    
    if (!supabaseUrl || !supabaseKey || 
        supabaseUrl.includes('placeholder') || 
        supabaseKey.includes('placeholder')) {
      toast.error(
        "Supabase 未配置！请在 Vercel Dashboard 的 Environment Variables 中添加：\n" +
        "- VITE_SUPABASE_URL\n" +
        "- VITE_SUPABASE_PUBLISHABLE_KEY",
        { duration: 8000 }
      );
      return;
    }
    
    // 验证输入
    if (!email.trim() || !password.trim()) {
      toast.error(t('auth.fillAllFields') || "请填写所有字段");
      return;
    }

    if (!validateEmail(email)) {
      toast.error(t('auth.invalidEmail'));
      return;
    }

    if (!isLogin && !validatePassword(password)) {
      toast.error(t('auth.passwordTooShort'));
      return;
    }
    
    setLoading(true);
    try {
      const { error } = isLogin 
        ? await signIn(email, password)
        : await signUp(email, password);
      
      if (error) {
        // 将常见错误信息中文化
        let errorMessage = error.message;
        const errorLower = error.message.toLowerCase();
        
        if (errorLower.includes("invalid login credentials") || errorLower.includes("invalid credentials")) {
          errorMessage = "邮箱或密码错误";
        } else if (errorLower.includes("user already registered") || errorLower.includes("already registered")) {
          errorMessage = "该邮箱已被注册";
        } else if (errorLower.includes("email not confirmed") || errorLower.includes("email_not_confirmed")) {
          errorMessage = "请先验证您的邮箱";
        } else if (errorLower.includes("password")) {
          errorMessage = "密码格式不正确";
        } else if (errorLower.includes("fetch") || errorLower.includes("network") || errorLower.includes("failed to fetch")) {
          errorMessage = "网络连接失败，请检查网络后重试";
        } else if (errorLower.includes("invalid") && (errorLower.includes("api") || errorLower.includes("key"))) {
          // API key 错误 - 提供详细的配置指导
          const hasUrl = !!import.meta.env.VITE_SUPABASE_URL;
          const hasKey = !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
          const url = import.meta.env.VITE_SUPABASE_URL || "未配置";
          const keyPreview = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY 
            ? `${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY.substring(0, 20)}...` 
            : "未配置";
          
          errorMessage = `API Key 配置错误！\n\n` +
            `请在 Vercel Dashboard → Settings → Environment Variables 配置：\n\n` +
            `1. VITE_SUPABASE_URL\n` +
            `   当前: ${hasUrl ? '✅ 已配置' : '❌ 未配置'} (${url})\n\n` +
            `2. VITE_SUPABASE_PUBLISHABLE_KEY (必须是 anon/public key)\n` +
            `   当前: ${hasKey ? '✅ 已配置' : '❌ 未配置'} (${keyPreview})\n\n` +
            `配置后需要重新部署才能生效！`;
        } else if (errorLower.includes("jwt") || errorLower.includes("token")) {
          errorMessage = "认证令牌错误，请刷新页面后重试";
        } else if (errorLower.includes("rate limit") || errorLower.includes("429")) {
          errorMessage = "请求过于频繁，请稍后再试";
        }
        
        toast.error(errorMessage, { duration: 10000 });
      } else {
        if (isLogin) {
          toast.success("欢迎回来！");
        } else {
          toast.success("账户创建成功！请检查邮箱验证链接");
        }
        onOpenChange(false);
        setEmail("");
        setPassword("");
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      const errorMsg = err?.message || "未知错误";
      
      // 添加调试信息
      console.log('🔍 注册/登录失败，调试信息:');
      console.log('  - 错误信息:', errorMsg);
      console.log('  - 环境变量 URL:', import.meta.env.VITE_SUPABASE_URL ? '已设置' : '未设置');
      console.log('  - 环境变量 Key:', import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? '已设置 (' + import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY.substring(0, 30) + '...)' : '未设置');
      
      if (errorMsg.includes("fetch") || errorMsg.includes("network") || errorMsg.includes("Failed to fetch")) {
        toast.error("无法连接到 Supabase，请检查环境变量配置。打开控制台查看详细信息。", { duration: 8000 });
      } else if (errorMsg.toLowerCase().includes("invalid") && errorMsg.toLowerCase().includes("api")) {
        // API key 错误 - 显示详细指导
        const hasUrl = !!import.meta.env.VITE_SUPABASE_URL;
        const hasKey = !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
        const keyPreview = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY 
          ? `${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY.substring(0, 30)}...` 
          : "未设置";
        
        toast.error(
          `API Key 错误！\n\n` +
          `请在浏览器控制台（F12）查看详细配置信息。\n\n` +
          `如果环境变量已配置，请：\n` +
          `1. 确认已重新部署\n` +
          `2. 清除浏览器缓存\n` +
          `3. 刷新页面后重试`,
          { duration: 10000 }
        );
      } else {
        toast.error(errorMsg, { duration: 6000 });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            {isLogin ? t('auth.welcomeBack') : t('auth.joinByvibe')}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t('auth.email')}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t('auth.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">{t('auth.password')}</Label>
            <Input
              id="password"
              type="password"
              placeholder={t('auth.passwordPlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            {!isLogin && (
              <p className="text-xs text-muted-foreground">
                {t('auth.passwordTooShort')}
              </p>
            )}
          </div>
          
          <Button type="submit" className="w-full gap-2" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLogin ? t('auth.login') : t('auth.createAccount')}
          </Button>
        </form>
        
        <div className="text-center text-sm text-muted-foreground mt-4">
          {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary hover:underline ml-1 font-medium"
          >
            {isLogin ? t('auth.signupNow') : t('auth.loginNow')}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
