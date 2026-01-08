# Vercel 部署成功但页面空白 - 修复指南

## 🔍 问题诊断

部署成功但页面空白，常见原因：

1. **环境变量缺失** - Supabase URL/Key 未配置
2. **JavaScript 错误** - 控制台可能有错误
3. **路由配置问题** - vercel.json 路由规则
4. **构建产物问题** - Output Directory 配置错误

## ✅ 立即检查步骤

### 步骤 1: 检查浏览器控制台

1. 打开网站：`newgamebyvibe.vercel.app`
2. 按 `F12` 或 `Cmd+Option+I` 打开开发者工具
3. 查看 **Console** 标签
4. 检查是否有红色错误信息

常见错误：
- `VITE_SUPABASE_URL is not defined`
- `Cannot read property of undefined`
- `i18next error`
- `Module not found`

### 步骤 2: 检查网络请求

在开发者工具的 **Network** 标签中：
- 检查 JS/CSS 文件是否成功加载（200 状态）
- 检查是否有 404 或 500 错误

### 步骤 3: 检查环境变量

在 Vercel Dashboard 中检查：

1. 进入项目 Settings → **Environment Variables**
2. 确认以下变量已设置：
   ```
   VITE_SUPABASE_URL=https://zntuprdrkpceklptodkp.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=你的_Key
   ```
3. 确保选择了正确的环境：
   - ✅ Production
   - ✅ Preview
   - ✅ Development

### 步骤 4: 检查构建配置

在 Vercel Dashboard 中：

1. Settings → **Build and Deployment Settings**
2. 确认配置：
   ```
   Framework Preset: Vite
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

## 🔧 修复步骤

### 如果环境变量缺失：

1. 进入 Settings → **Environment Variables**
2. 添加：
   - **Key**: `VITE_SUPABASE_URL`
   - **Value**: `https://zntuprdrkpceklptodkp.supabase.co`
   - **Environment**: Production, Preview, Development（全选）
3. 添加：
   - **Key**: `VITE_SUPABASE_PUBLISHABLE_KEY`
   - **Value**: 你的 Supabase anon key
   - **Environment**: Production, Preview, Development（全选）
4. 点击 **"Save"**
5. **重新部署**（环境变量更新后需要重新部署）

### 如果控制台有 JavaScript 错误：

把错误信息发给我，我会帮你修复。

### 如果构建产物有问题：

检查 Vercel 构建日志：
1. Deployments → 点击失败的部署
2. 查看 **Build Logs**
3. 检查是否有构建错误或警告

## 🚀 快速修复

### 添加环境变量（如果缺失）：

1. Vercel Dashboard → 项目 Settings → Environment Variables
2. 添加上述两个环境变量
3. 保存后，进入 Deployments 页面
4. 找到最新的部署
5. 点击 **"Redeploy"** 按钮

### 重新部署：

环境变量配置后，需要重新部署：
1. Deployments → 点击最新部署
2. 点击 **"Redeploy"**
3. 或推送一个新提交触发自动部署

## 📋 验证清单

- [ ] 环境变量已配置（VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY）
- [ ] 环境变量选择了正确的环境（Production, Preview, Development）
- [ ] 构建配置正确（Vite, dist, npm run build）
- [ ] 已重新部署（环境变量更新后必须重新部署）
- [ ] 浏览器控制台无错误
- [ ] 网络请求成功（JS/CSS 文件 200 状态）

## 💡 重要提示

**环境变量更新后必须重新部署才能生效！**

如果添加或修改了环境变量：
1. 在 Deployments 页面找到最新部署
2. 点击 **"Redeploy"**
3. 或推送一个新提交触发自动部署
