# Enjoy ByVibe (Self-Hosted)

React + Vite + Supabase 的 AI 创作平台，可自托管部署。

## 技术栈
- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Supabase (Postgres + Edge Functions)
- Gemini API（直接调用）

## 环境要求
- Node.js ≥ 18
- npm / pnpm / yarn 任一

## 快速开始
```bash
git clone <YOUR_GIT_URL>
cd enjoy-byvibe
npm install
cp .env.example .env     # 配置环境变量
npm run dev              # 本地开发
```

## 环境变量
在 `.env` 填写：
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key   # Edge Functions 使用
```

## 常用命令
- 开发：`npm run dev`
- 构建：`npm run build`
- 预览：`npm run preview`
- Lint：`npm run lint`

## 部署建议
- **Vercel**：零配置，推荐
- **Cloudflare Pages**：需设置环境变量
- **自托管**：`npm run build` 后将 `dist/` 部署到任意静态站点，Supabase Edge Functions 继续托管在 Supabase

## 注意
- Edge Functions 已改为直接调用 Gemini API（不再依赖 Lovable）
- 确保在 Supabase Dashboard 配置 `GEMINI_API_KEY`
