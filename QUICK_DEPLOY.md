# 快速部署指南

## 🚀 步骤 1: 登录 Supabase CLI

在终端中执行（会打开浏览器）：
```bash
cd /Users/wubinyuan/enjoy-byvibe
supabase login
```

或者使用 Access Token（在 Supabase Dashboard → Account → Access Tokens 创建）：
```bash
export SUPABASE_ACCESS_TOKEN=your_access_token
supabase login --token $SUPABASE_ACCESS_TOKEN
```

## 🔗 步骤 2: 关联项目

```bash
supabase link --project-ref zntuprdrkpceklptodkp
```

## 🔑 步骤 3: 设置 Gemini API Key

**重要**: 需要先获取 Gemini API Key
- 访问: https://makersuite.google.com/app/apikey
- 创建新的 API Key
- 复制保存

然后执行：
```bash
supabase secrets set GEMINI_API_KEY=你的实际_gemini_api_key
```

## 📦 步骤 4: 部署所有 Edge Functions

```bash
# 部署游戏生成函数
supabase functions deploy generate-creation

# 部署代码助手函数
supabase functions deploy ai-code-assist

# 部署设计助手函数
supabase functions deploy design-assistant

# 部署游戏融合函数
supabase functions deploy game-lab-fusion

# 部署游戏存档函数
supabase functions deploy game-save
```

## ✅ 验证部署

部署完成后，在 Supabase Dashboard → Edge Functions 中应该能看到所有 5 个函数。

---

## 🚀 然后部署到 Vercel

### 1. 获取 Supabase 信息

在 Supabase Dashboard → Settings → API：
- **Project URL**: `https://zntuprdrkpceklptodkp.supabase.co`
- **anon/public key**: 复制 anon key

### 2. 在 Vercel 配置

1. 访问 https://vercel.com
2. 导入项目: `creatbyvibe/byvibe-game`
3. 添加环境变量：
   ```
   VITE_SUPABASE_URL=https://zntuprdrkpceklptodkp.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=你的_anon_key
   ```
4. 点击 Deploy

---

## 📝 完整命令序列

```bash
# 1. 登录（需要手动在浏览器完成）
supabase login

# 2. 关联项目
cd /Users/wubinyuan/enjoy-byvibe
supabase link --project-ref zntuprdrkpceklptodkp

# 3. 设置 API Key（替换为实际 key）
supabase secrets set GEMINI_API_KEY=你的_gemini_api_key

# 4. 部署所有函数
supabase functions deploy generate-creation
supabase functions deploy ai-code-assist
supabase functions deploy design-assistant
supabase functions deploy game-lab-fusion
supabase functions deploy game-save
```

---

## ⚠️ 注意事项

1. **Gemini API Key**: 必须先在 Google AI Studio 创建
2. **登录**: 第一次登录需要在浏览器中完成
3. **项目关联**: 确保 project-ref 正确（`zntuprdrkpceklptodkp`）