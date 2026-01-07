# 从 Lovable 到自主部署迁移指南

> 目标: 从 Lovable 平台迁移到自主部署，保留可复用代码，替换平台特定代码

---

## 📋 迁移概览

### 当前状态
- ✅ 在 Lovable 中完成初步框架搭建
- ✅ 代码已同步到 GitHub (`enjoy-byvibe`)
- ⚠️ 包含 Lovable 平台特定代码需要替换

### 目标状态
- ✅ 完全自主部署（Vercel/Cloudflare/自托管）
- ✅ 直接使用 Gemini API（不依赖 Lovable Gateway）
- ✅ 保留所有业务逻辑和 UI 组件
- ✅ 可独立运行和维护

---

## 🔍 代码分类：保留 vs 替换

### ✅ 完全保留的代码（核心业务逻辑）

#### 1. 前端组件（100% 保留）
```
src/
├── components/          # ✅ 全部保留
│   ├── ui/             # ✅ shadcn/ui 组件
│   ├── studio/         # ✅ Studio 编辑器组件
│   ├── AICreator.tsx   # ✅ 核心创作组件
│   ├── Navbar.tsx      # ✅ 导航栏
│   └── ...             # ✅ 所有组件
├── pages/              # ✅ 全部保留
├── hooks/              # ✅ 全部保留
└── lib/                # ✅ 工具函数
```

**原因**: 这些是纯前端代码，不依赖任何平台

#### 2. 数据库 Schema（100% 保留）
```
supabase/
├── migrations/         # ✅ 数据库迁移文件
└── schema.sql         # ✅ 表结构定义
```

**原因**: Supabase 数据库结构可以完全保留

#### 3. 设计系统和样式（100% 保留）
```
src/index.css          # ✅ 设计 token 和全局样式
tailwind.config.ts     # ✅ Tailwind 配置
```

**原因**: 样式代码完全独立

---

### ⚠️ 需要修改的代码（平台特定）

#### 1. AI API 调用（需要替换）

**当前代码** (Lovable Gateway):
```typescript
// supabase/functions/generate-creation/index.ts
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
  headers: {
    Authorization: `Bearer ${LOVABLE_API_KEY}`,
  },
});
```

**替换为** (直接使用 Gemini API):
```typescript
// supabase/functions/generate-creation/index.ts
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:streamGenerateContent?key=${GEMINI_API_KEY}`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }]
    }),
  }
);
```

**需要修改的文件**:
- `supabase/functions/generate-creation/index.ts`
- `supabase/functions/ai-code-assist/index.ts`
- `supabase/functions/design-assistant/index.ts`
- `supabase/functions/game-lab-fusion/index.ts`

#### 2. 开发工具（可选移除）

**当前代码**:
```typescript
// vite.config.ts
import { componentTagger } from "lovable-tagger";
plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
```

**替换为**:
```typescript
// vite.config.ts
plugins: [react()].filter(Boolean),
// 移除 lovable-tagger（仅用于 Lovable 平台）
```

**需要修改的文件**:
- `vite.config.ts`
- `package.json` (移除 `lovable-tagger` 依赖)

#### 3. 环境变量（需要更新）

**当前环境变量**:
```bash
LOVABLE_API_KEY=xxx  # ❌ 需要移除
```

**新的环境变量**:
```bash
GEMINI_API_KEY=xxx                    # ✅ 直接使用 Gemini API
VITE_SUPABASE_URL=xxx                # ✅ 保留
VITE_SUPABASE_PUBLISHABLE_KEY=xxx    # ✅ 保留
```

---

## 🔧 详细迁移步骤

### 步骤 1: 替换 AI API 调用

#### 1.1 更新 `generate-creation` Edge Function

**文件**: `supabase/functions/generate-creation/index.ts`

**修改内容**:
```typescript
// 替换前
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${LOVABLE_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "google/gemini-2.5-flash",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Create: ${prompt.trim()}` }
    ],
    stream: true,
  }),
});

// 替换后
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not configured");
}

// Gemini API 流式调用
const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:streamGenerateContent?key=${GEMINI_API_KEY}`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: `${systemPrompt}\n\nUser request: ${prompt.trim()}` }
        ]
      }],
      generationConfig: {
        temperature: 0.9,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
    }),
  }
);

// 处理流式响应（Gemini API 格式不同）
const reader = response.body?.getReader();
const decoder = new TextDecoder();
let buffer = "";

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  buffer += decoder.decode(value, { stream: true });
  const lines = buffer.split("\n");
  buffer = lines.pop() || "";
  
  for (const line of lines) {
    if (line.startsWith("data: ")) {
      const data = JSON.parse(line.slice(6));
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        // 发送给客户端
      }
    }
  }
}
```

#### 1.2 更新其他 Edge Functions

同样的模式应用到：
- `ai-code-assist/index.ts`
- `design-assistant/index.ts`
- `game-lab-fusion/index.ts`

**注意**: 每个函数的 system prompt 和请求格式需要适配 Gemini API

---

### 步骤 2: 清理开发依赖

#### 2.1 移除 `lovable-tagger`

```bash
npm uninstall lovable-tagger
```

#### 2.2 更新 `vite.config.ts`

```typescript
// 移除
import { componentTagger } from "lovable-tagger";

// 修改 plugins
export default defineConfig(({ mode }) => ({
  plugins: [react()], // 移除 componentTagger
  // ...
}));
```

---

### 步骤 3: 更新环境变量配置

#### 3.1 创建 `.env.example`

```bash
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key

# Gemini API (用于 Edge Functions)
GEMINI_API_KEY=your_gemini_api_key
```

#### 3.2 更新 Supabase Edge Functions 环境变量

在 Supabase Dashboard 中设置：
- 移除: `LOVABLE_API_KEY`
- 添加: `GEMINI_API_KEY`

---

### 步骤 4: 更新文档

#### 4.1 更新 `README.md`

移除 Lovable 相关说明，添加自主部署说明

#### 4.2 更新 `PROJECT_HANDOFF.md`

更新技术栈说明：
```markdown
| AI网关 | Gemini API (直接调用) |
| 部署 | Vercel / Cloudflare Pages / 自托管 |
```

---

## 📦 保留的核心功能

### ✅ 完全保留的功能模块

1. **前端应用架构**
   - React 18 + TypeScript + Vite
   - React Router v6 路由
   - shadcn/ui 组件库
   - Tailwind CSS 样式系统

2. **业务逻辑**
   - AI 创作流程 (`AICreator.tsx`)
   - Studio 编辑器 (`StudioPage.tsx`)
   - 游戏融合实验室 (`GameLab.tsx`)
   - 社区功能 (`Community.tsx`)
   - 作品管理 (`MyCreations.tsx`)

3. **数据库设计**
   - 所有表结构
   - RLS 策略（需要添加）
   - 数据库函数

4. **UI/UX 设计**
   - 设计系统 token
   - 组件样式
   - 动画效果

---

## 🔄 API 调用对比

### Lovable Gateway vs Gemini API

| 特性 | Lovable Gateway | Gemini API (直接) |
|------|----------------|-------------------|
| **URL** | `https://ai.gateway.lovable.dev/v1/chat/completions` | `https://generativelanguage.googleapis.com/v1beta/models/...` |
| **认证** | `Bearer ${LOVABLE_API_KEY}` | `?key=${GEMINI_API_KEY}` |
| **请求格式** | OpenAI 兼容格式 | Google Gemini 格式 |
| **流式响应** | SSE 格式 | 自定义流式格式 |
| **成本** | 通过 Lovable | 直接计费 |
| **控制** | 有限 | 完全控制 |

### 响应格式差异

**Lovable Gateway (OpenAI 格式)**:
```json
{
  "choices": [{
    "delta": {
      "content": "生成的文本"
    }
  }]
}
```

**Gemini API (Google 格式)**:
```json
{
  "candidates": [{
    "content": {
      "parts": [{
        "text": "生成的文本"
      }]
    }
  }]
}
```

---

## 🚀 部署选项

### 选项 1: Vercel（推荐）

**优势**:
- ✅ 零配置部署
- ✅ 自动 HTTPS 和 CDN
- ✅ 完美支持 Vite + React
- ✅ 免费套餐足够

**配置**:
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

### 选项 2: Cloudflare Pages

**优势**:
- ✅ 全球 CDN
- ✅ 免费套餐
- ✅ 与 Supabase Edge Functions 配合好

**配置**:
- Build command: `npm run build`
- Output directory: `dist`
- Node version: `20`

### 选项 3: 自托管

**优势**:
- ✅ 完全控制
- ✅ 无平台限制

**需要**:
- Node.js 服务器
- Nginx 反向代理
- SSL 证书

---

## 📝 迁移检查清单

### 代码修改
- [ ] 替换所有 `LOVABLE_API_KEY` 为 `GEMINI_API_KEY`
- [ ] 更新所有 Edge Functions 的 API 调用
- [ ] 适配 Gemini API 的请求/响应格式
- [ ] 移除 `lovable-tagger` 依赖
- [ ] 更新 `vite.config.ts`

### 环境配置
- [ ] 在 Supabase 设置 `GEMINI_API_KEY`
- [ ] 更新 `.env.example`
- [ ] 更新部署平台环境变量

### 文档更新
- [ ] 更新 `README.md`
- [ ] 更新 `PROJECT_HANDOFF.md`
- [ ] 更新 API 文档

### 测试
- [ ] 测试 AI 创作功能
- [ ] 测试 Studio 编辑器
- [ ] 测试游戏融合功能
- [ ] 测试所有 Edge Functions

---

## 💡 优化建议

### 1. API 调用优化

**添加重试机制**:
```typescript
async function callGeminiWithRetry(prompt: string, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await callGeminiAPI(prompt);
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

**添加速率限制**:
```typescript
// 使用简单的令牌桶算法
const rateLimiter = {
  tokens: 10,
  lastRefill: Date.now(),
  refillRate: 10000, // 每10秒补充10个令牌
  
  async acquire() {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    this.tokens = Math.min(10, this.tokens + (elapsed / this.refillRate) * 10);
    this.lastRefill = now;
    
    if (this.tokens < 1) {
      await new Promise(resolve => setTimeout(resolve, this.refillRate));
      return this.acquire();
    }
    this.tokens--;
  }
};
```

### 2. 错误处理增强

```typescript
try {
  const response = await fetch(geminiUrl, options);
  if (!response.ok) {
    if (response.status === 429) {
      throw new Error("Rate limit exceeded. Please try again later.");
    }
    if (response.status === 401) {
      throw new Error("Invalid API key. Please check your GEMINI_API_KEY.");
    }
    throw new Error(`API error: ${response.status}`);
  }
  // ...
} catch (error) {
  console.error("Gemini API error:", error);
  return new Response(
    JSON.stringify({ error: error.message }),
    { status: 500, headers: corsHeaders }
  );
}
```

### 3. 成本监控

```typescript
// 记录每次 API 调用
const usageLog = {
  timestamp: Date.now(),
  model: "gemini-2.0-flash-exp",
  inputTokens: estimateTokens(prompt),
  outputTokens: estimateTokens(response),
  cost: calculateCost(inputTokens, outputTokens),
};

// 存储到数据库用于成本分析
await supabase.from("api_usage_logs").insert(usageLog);
```

---

## 🎯 迁移后的优势

### 1. 完全控制
- ✅ 直接控制 API 调用
- ✅ 可以自定义模型参数
- ✅ 可以切换不同的 Gemini 模型

### 2. 成本透明
- ✅ 直接看到 Gemini API 费用
- ✅ 可以优化调用频率
- ✅ 可以添加缓存减少调用

### 3. 灵活性
- ✅ 可以添加其他 AI 提供商（OpenAI, Anthropic）
- ✅ 可以实现多模型切换
- ✅ 可以自定义限流策略

### 4. 可移植性
- ✅ 不依赖任何特定平台
- ✅ 可以部署到任何支持 Node.js 的平台
- ✅ 代码完全自主可控

---

## 📚 参考资源

### Gemini API 文档
- [Gemini API 快速开始](https://ai.google.dev/docs/quickstart)
- [流式响应处理](https://ai.google.dev/gemini-api/docs/streaming)
- [API 参考](https://ai.google.dev/api/rest)

### Supabase Edge Functions
- [Edge Functions 文档](https://supabase.com/docs/guides/functions)
- [Deno 运行时](https://deno.land/manual)
- [环境变量配置](https://supabase.com/docs/guides/functions/secrets)

---

**迁移完成后，你将拥有一个完全自主可控的应用，可以自由部署到任何平台！** 🚀