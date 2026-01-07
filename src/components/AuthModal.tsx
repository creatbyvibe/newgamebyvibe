import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
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
      toast.error("请填写所有字段");
      return;
    }

    if (!validateEmail(email)) {
      toast.error("请输入有效的邮箱地址");
      return;
    }

    if (!isLogin && !validatePassword(password)) {
      toast.error("密码至少需要 6 个字符");
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
            {isLogin ? "欢迎回来" : "加入 byvibe.ai"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <Input
              id="password"
              type="password"
              placeholder="至少 6 个字符"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            {!isLogin && (
              <p className="text-xs text-muted-foreground">
                密码至少需要 6 个字符
              </p>
            )}
          </div>
          
          <Button type="submit" className="w-full gap-2" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLogin ? "登录" : "创建账户"}
          </Button>
        </form>
        
        <div className="text-center text-sm text-muted-foreground mt-4">
          {isLogin ? "还没有账户？" : "已有账户？"}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary hover:underline ml-1 font-medium"
          >
            {isLogin ? "立即注册" : "立即登录"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
