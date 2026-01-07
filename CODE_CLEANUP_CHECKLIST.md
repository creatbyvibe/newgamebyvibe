# 代码清理清单 - 从 Lovable 迁移到自主部署

> 目标: 识别并清理所有 Lovable 平台特定代码，准备自主部署

---

## 🔍 需要清理的代码

### 1. AI API 调用（必须替换）

#### ✅ 需要修改的文件

- [ ] `supabase/functions/generate-creation/index.ts`
  - [ ] 替换 `LOVABLE_API_KEY` → `GEMINI_API_KEY`
  - [ ] 替换 API URL: `ai.gateway.lovable.dev` → `generativelanguage.googleapis.com`
  - [ ] 适配 Gemini API 请求格式
  - [ ] 适配 Gemini API 响应格式（流式处理）

- [ ] `supabase/functions/ai-code-assist/index.ts`
  - [ ] 替换 `LOVABLE_API_KEY` → `GEMINI_API_KEY`
  - [ ] 替换 API URL
  - [ ] 适配请求/响应格式

- [ ] `supabase/functions/design-assistant/index.ts`
  - [ ] 替换 `LOVABLE_API_KEY` → `GEMINI_API_KEY`
  - [ ] 替换 API URL
  - [ ] 适配请求/响应格式

- [ ] `supabase/functions/game-lab-fusion/index.ts`
  - [ ] 替换 `LOVABLE_API_KEY` → `GEMINI_API_KEY`
  - [ ] 替换 API URL
  - [ ] 适配请求/响应格式

---

### 2. 开发依赖（可选移除）

- [ ] `package.json`
  - [ ] 移除 `lovable-tagger` 依赖
  - [ ] 运行 `npm uninstall lovable-tagger`

- [ ] `vite.config.ts`
  - [ ] 移除 `import { componentTagger } from "lovable-tagger"`
  - [ ] 从 plugins 数组中移除 `componentTagger()`

---

### 3. 文档和配置（需要更新）

- [ ] `README.md`
  - [ ] 移除 Lovable 相关说明
  - [ ] 添加自主部署说明
  - [ ] 更新环境变量说明

- [ ] `PROJECT_HANDOFF.md`
  - [ ] 更新技术栈表格（AI网关、部署平台）
  - [ ] 更新环境变量说明
  - [ ] 移除 Lovable 相关描述

- [ ] `index.html`
  - [ ] 更新 Open Graph 图片 URL（移除 lovable.dev 链接）
  - [ ] 更新 Twitter Card 图片 URL

- [ ] `.env.example` (如果存在)
  - [ ] 移除 `LOVABLE_API_KEY`
  - [ ] 添加 `GEMINI_API_KEY`

---

### 4. 环境变量配置

#### Supabase Dashboard
- [ ] 移除环境变量: `LOVABLE_API_KEY`
- [ ] 添加环境变量: `GEMINI_API_KEY`

#### 部署平台（Vercel/Cloudflare）
- [ ] 移除环境变量: `LOVABLE_API_KEY`
- [ ] 添加环境变量: `GEMINI_API_KEY`

---

## ✅ 完全保留的代码（无需修改）

### 前端代码（100% 保留）
```
✅ src/components/          # 所有组件
✅ src/pages/              # 所有页面
✅ src/hooks/              # 所有 hooks
✅ src/lib/                # 工具函数
✅ src/integrations/        # Supabase 集成
```

### 样式和配置（100% 保留）
```
✅ src/index.css           # 全局样式
✅ tailwind.config.ts      # Tailwind 配置
✅ tsconfig.json           # TypeScript 配置
✅ postcss.config.js       # PostCSS 配置
```

### 数据库（100% 保留）
```
✅ supabase/migrations/    # 数据库迁移
✅ supabase/schema.sql     # 表结构
✅ supabase/config.toml    # Supabase 配置（保留）
```

### 业务逻辑（100% 保留）
```
✅ AI 创作流程逻辑
✅ Studio 编辑器逻辑
✅ 游戏融合逻辑
✅ 社区功能逻辑
✅ 认证和授权逻辑
```

---

## 🔄 API 格式转换参考

### 请求格式转换

**Lovable Gateway (OpenAI 格式)**:
```typescript
{
  model: "google/gemini-2.5-flash",
  messages: [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt }
  ],
  stream: true
}
```

**Gemini API (Google 格式)**:
```typescript
{
  contents: [{
    parts: [
      { text: `${systemPrompt}\n\nUser: ${userPrompt}` }
    ]
  }],
  generationConfig: {
    temperature: 0.9,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 8192
  }
}
```

### 响应格式转换

**Lovable Gateway (SSE 格式)**:
```
data: {"choices":[{"delta":{"content":"text"}}]}
```

**Gemini API (流式格式)**:
```json
{
  "candidates": [{
    "content": {
      "parts": [{
        "text": "text"
      }]
    }
  }]
}
```

---

## 📋 清理步骤顺序

### 阶段 1: 准备（不破坏现有功能）
1. [ ] 创建新的分支: `git checkout -b migrate-from-lovable`
2. [ ] 备份当前代码
3. [ ] 创建 `.env.example` 文件

### 阶段 2: 代码替换
1. [ ] 替换所有 Edge Functions 中的 API 调用
2. [ ] 测试每个 Edge Function 的修改
3. [ ] 移除 `lovable-tagger` 依赖
4. [ ] 更新 `vite.config.ts`

### 阶段 3: 配置更新
1. [ ] 更新 Supabase 环境变量
2. [ ] 更新部署平台环境变量
3. [ ] 更新文档

### 阶段 4: 测试验证
1. [ ] 测试 AI 创作功能
2. [ ] 测试 Studio 编辑器
3. [ ] 测试游戏融合功能
4. [ ] 测试所有 Edge Functions

### 阶段 5: 部署
1. [ ] 部署到测试环境
2. [ ] 完整功能测试
3. [ ] 部署到生产环境

---

## 🐛 常见问题处理

### 问题 1: Gemini API 响应格式不同

**解决方案**: 需要解析 Gemini 的流式响应格式
```typescript
// Gemini 流式响应解析
const lines = buffer.split("\n");
for (const line of lines) {
  if (line.trim() === "") continue;
  try {
    const data = JSON.parse(line);
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) {
      // 处理文本块
    }
  } catch (e) {
    // 忽略解析错误
  }
}
```

### 问题 2: 模型名称不同

**Lovable**: `google/gemini-2.5-flash`  
**Gemini API**: `gemini-2.0-flash-exp` 或 `gemini-pro`

**解决方案**: 使用 Gemini API 支持的模型名称

### 问题 3: 认证方式不同

**Lovable**: `Authorization: Bearer ${KEY}`  
**Gemini API**: `?key=${KEY}` (URL 参数)

**解决方案**: 修改请求 URL 和 headers

---

## ✅ 完成标准

清理完成后，应该满足：

- [ ] 所有 Edge Functions 使用 Gemini API
- [ ] 没有 `LOVABLE_API_KEY` 引用
- [ ] 没有 `lovable-tagger` 依赖
- [ ] 所有功能测试通过
- [ ] 文档已更新
- [ ] 环境变量已配置
- [ ] 可以独立部署运行

---

**清理完成后，代码将完全独立，可以部署到任何平台！** 🎉