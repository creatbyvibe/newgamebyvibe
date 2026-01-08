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
        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "邮箱或密码错误";
        } else if (error.message.includes("User already registered")) {
          errorMessage = "该邮箱已被注册";
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "请先验证您的邮箱";
        } else if (error.message.includes("Password")) {
          errorMessage = "密码格式不正确";
        }
        toast.error(errorMessage);
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
