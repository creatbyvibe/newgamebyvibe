import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";
import { getRandomMessage } from "@/lib/utils/messageUtils";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const AuthModal = ({ open, onOpenChange, onSuccess }: AuthModalProps) => {
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
          errorMessage = getRandomMessage(t('auth.invalidCredentials'));
        } else if (errorLower.includes("user already registered") || errorLower.includes("already registered")) {
          errorMessage = getRandomMessage(t('auth.emailExists'));
        } else if (errorLower.includes("email not confirmed") || errorLower.includes("email_not_confirmed")) {
          errorMessage = getRandomMessage(t('auth.emailNotConfirmed'));
        } else if (errorLower.includes("password")) {
          errorMessage = getRandomMessage(t('auth.passwordInvalid'));
        } else if (errorLower.includes("fetch") || errorLower.includes("network") || errorLower.includes("failed to fetch")) {
          errorMessage = getRandomMessage(t('auth.networkError'));
        } else if (errorLower.includes("invalid") && (errorLower.includes("api") || errorLower.includes("key"))) {
          // API key 错误 - 提供详细的配置指导
          const hasUrl = !!import.meta.env.VITE_SUPABASE_URL;
          const hasKey = !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
          const url = import.meta.env.VITE_SUPABASE_URL || t('common.notSet');
          const keyPreview = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY 
            ? `${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY.substring(0, 20)}...` 
            : t('common.notSet');
          
          errorMessage = getRandomMessage(t('auth.apiKeyError')) + `\n\n` +
            `${t('auth.configureInVercel')}:\n\n` +
            `1. VITE_SUPABASE_URL\n` +
            `   ${t('common.current')}: ${hasUrl ? '✅ ' + t('common.configured') : '❌ ' + t('common.notConfigured')} (${url})\n\n` +
            `2. VITE_SUPABASE_PUBLISHABLE_KEY (${t('auth.mustBeAnonKey')})\n` +
            `   ${t('common.current')}: ${hasKey ? '✅ ' + t('common.configured') : '❌ ' + t('common.notConfigured')} (${keyPreview})\n\n` +
            `${t('auth.redeployAfterConfig')}`;
        } else if (errorLower.includes("jwt") || errorLower.includes("token")) {
          errorMessage = getRandomMessage(t('auth.tokenError'));
        } else if (errorLower.includes("rate limit") || errorLower.includes("429")) {
          errorMessage = getRandomMessage(t('auth.rateLimitError'));
        }
        
        toast.error(errorMessage, { duration: 10000 });
      } else {
        if (isLogin) {
          toast.success(getRandomMessage(t('auth.loginSuccess')));
        } else {
          toast.success(getRandomMessage(t('auth.signupSuccess')));
        }
        
        // 执行成功回调
        onSuccess?.();
        
        onOpenChange(false);
        setEmail("");
        setPassword("");
      }
    } catch (err: any) {
      ErrorHandler.logError(err, 'AuthModal.handleSubmit');
      const errorMsg = err?.message || "未知错误";
      
      if (errorMsg.includes("fetch") || errorMsg.includes("network") || errorMsg.includes("Failed to fetch")) {
        toast.error(getRandomMessage(t('auth.cannotConnectSupabase')), { duration: 8000 });
      } else if (errorMsg.toLowerCase().includes("invalid") && errorMsg.toLowerCase().includes("api")) {
        // API key 错误 - 显示详细指导
        const hasUrl = !!import.meta.env.VITE_SUPABASE_URL;
        const hasKey = !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
        const keyPreview = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY 
          ? `${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY.substring(0, 30)}...` 
          : t('common.notSet');
        
        toast.error(
          `${getRandomMessage(t('auth.apiKeyError'))}\n\n` +
          `${t('auth.checkConsoleForDetails')}\n\n` +
          `${t('auth.ifEnvConfigured')}\n` +
          `${t('auth.confirmRedeploy')}\n` +
          `${t('auth.clearCache')}\n` +
          `${t('auth.refreshRetry')}`,
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
