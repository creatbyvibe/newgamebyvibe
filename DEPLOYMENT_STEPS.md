# 部署步骤指南

## ✅ 已完成
- [x] 数据库表创建
- [x] RLS 策略配置

## 📋 下一步：部署 Edge Functions

### 方法 1: 使用 Supabase CLI（推荐）

1. **安装 Supabase CLI**
   ```bash
   npm install -g supabase
   ```

2. **登录 Supabase**
   ```bash
   supabase login
   ```

3. **关联项目**
   ```bash
   cd /Users/wubinyuan/enjoy-byvibe
   supabase link --project-ref zntuprdrkpceklptodkp
   ```
   （project-ref 从 Supabase Dashboard URL 获取）

4. **设置环境变量**
   ```bash
   supabase secrets set GEMINI_API_KEY=your_gemini_api_key_here
   ```

5. **部署所有 Edge Functions**
   ```bash
   supabase functions deploy generate-creation
   supabase functions deploy ai-code-assist
   supabase functions deploy design-assistant
   supabase functions deploy game-lab-fusion
   supabase functions deploy game-save
   ```

### 方法 2: 使用 Supabase Dashboard（如果 CLI 不可用）

1. 进入 Supabase Dashboard → Edge Functions
2. 为每个函数手动创建并粘贴代码
3. 在 Settings → Secrets 中设置 `GEMINI_API_KEY`

---

## 🚀 Vercel 部署

### 1. 准备环境变量

在 Vercel 项目设置中需要配置：

```
VITE_SUPABASE_URL=https://zntuprdrkpceklptodkp.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=你的_anon_key
```

**注意**: `GEMINI_API_KEY` 不需要在 Vercel 配置，它只在 Supabase Edge Functions 中使用。

### 2. 部署步骤

1. 访问 https://vercel.com
2. 使用 GitHub 登录
3. 点击 "Add New Project"
4. 选择仓库: `creatbyvibe/byvibe-game`
5. Vercel 会自动检测 Vite 项目
6. 添加环境变量（见上方）
7. 点击 "Deploy"

### 3. 构建配置（自动检测）

- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

---

## ✅ 部署后检查清单

- [ ] Vercel 部署成功
- [ ] 环境变量已配置
- [ ] Edge Functions 已部署
- [ ] 测试 AI 创作功能
- [ ] 测试 Studio 编辑器
- [ ] 测试游戏融合功能

---

## 🔍 获取 Supabase 信息

### Project URL
在 Supabase Dashboard → Settings → API → Project URL

### Anon Key
在 Supabase Dashboard → Settings → API → anon/public key

### Project Ref
从 Dashboard URL 获取：`supabase.com/dashboard/project/zntuprdrkpceklptodkp`
project-ref 就是 `zntuprdrkpceklptodkp`