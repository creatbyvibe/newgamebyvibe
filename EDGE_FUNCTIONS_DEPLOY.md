# Edge Functions 部署指南

## 📋 前置条件

- ✅ Supabase 项目已创建
- ✅ 数据库表已创建
- ✅ 已获取 Gemini API Key

## 🚀 部署方法

### 方法 1: 使用 Supabase CLI（推荐）

#### 1. 安装 CLI
```bash
npm install -g supabase
```

#### 2. 登录
```bash
supabase login
```
会打开浏览器，使用 GitHub 账号登录

#### 3. 关联项目
```bash
cd /Users/wubinyuan/enjoy-byvibe
supabase link --project-ref zntuprdrkpceklptodkp
```

#### 4. 设置环境变量
```bash
supabase secrets set GEMINI_API_KEY=your_actual_gemini_api_key
```

#### 5. 部署所有函数
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

### 方法 2: 使用 Supabase Dashboard

如果 CLI 不可用，可以手动部署：

1. 进入 Supabase Dashboard → Edge Functions
2. 点击 "Create a new function"
3. 为每个函数创建并粘贴代码
4. 在 Settings → Secrets 中设置 `GEMINI_API_KEY`

---

## 🔍 验证部署

部署后，可以在 Dashboard → Edge Functions 中看到所有函数。

测试函数是否正常工作：
```bash
curl -X POST https://zntuprdrkpceklptodkp.supabase.co/functions/v1/generate-creation \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "创建一个简单的贪吃蛇游戏"}'
```

---

## ⚠️ 注意事项

1. **JWT 验证**: 当前所有函数都设置了 `verify_jwt = false`，建议生产环境改为 `true`
2. **环境变量**: `GEMINI_API_KEY` 必须设置，否则函数会失败
3. **CORS**: 函数已配置 CORS，允许跨域请求

---

## 📝 获取 Gemini API Key

1. 访问 https://makersuite.google.com/app/apikey
2. 登录 Google 账号
3. 创建新的 API Key
4. 复制并保存（只显示一次）

---

## ✅ 部署检查清单

- [ ] Supabase CLI 已安装
- [ ] 已登录 Supabase
- [ ] 项目已关联
- [ ] `GEMINI_API_KEY` 已设置
- [ ] 所有 5 个函数已部署
- [ ] 测试函数调用成功