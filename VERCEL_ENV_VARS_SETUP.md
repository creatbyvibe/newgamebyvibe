# Vercel 环境变量配置指南

## 🚨 页面空白 - 立即检查环境变量

页面空白最常见的原因是**环境变量缺失**。

## ✅ 必须配置的环境变量

在 Vercel Dashboard 中配置以下环境变量：

### 1. 进入环境变量设置

1. 访问：https://vercel.com/dashboard
2. 进入项目 `newgamebyvibe`
3. 点击 **Settings** → **Environment Variables**

### 2. 添加环境变量

添加以下两个环境变量：

#### 变量 1:
- **Key**: `VITE_SUPABASE_URL`
- **Value**: `https://zntuprdrkpceklptodkp.supabase.co`
- **Environment**: ✅ Production ✅ Preview ✅ Development（全选）
- 点击 **"Save"**

#### 变量 2:
- **Key**: `VITE_SUPABASE_PUBLISHABLE_KEY`
- **Value**: 你的 Supabase anon key（以 `eyJ...` 开头的长字符串）
- **Environment**: ✅ Production ✅ Preview ✅ Development（全选）
- 点击 **"Save"**

## ⚠️ 重要：重新部署

**环境变量添加或修改后，必须重新部署才能生效！**

### 重新部署方法：

1. **方法一：重新部署最新部署**
   - Deployments 页面
   - 点击最新的部署
   - 点击 **"Redeploy"** 按钮

2. **方法二：推送新提交（推荐）**
   - 推送任何新代码到 GitHub
   - Vercel 会自动触发新部署（使用新的环境变量）

## 🔍 验证环境变量

### 检查步骤：

1. **在浏览器控制台查看**
   - 打开网站
   - 按 `F12` 打开开发者工具
   - 查看 Console 标签
   - 如果有环境变量缺失，会看到错误提示

2. **检查 Vercel 部署日志**
   - Deployments → 点击部署
   - 查看 Build Logs
   - 检查是否有环境变量相关错误

## 📋 环境变量清单

确保以下变量都已配置：

- [x] `VITE_SUPABASE_URL` = `https://zntuprdrkpceklptodkp.supabase.co`
- [x] `VITE_SUPABASE_PUBLISHABLE_KEY` = 你的 anon key

## 🔧 如何获取 Supabase Key

1. 访问 Supabase Dashboard
2. 进入你的项目
3. Settings → API
4. 复制 **Project URL** 和 **anon public** key

## 💡 提示

- 环境变量名必须**完全匹配**：`VITE_SUPABASE_URL` 和 `VITE_SUPABASE_PUBLISHABLE_KEY`
- 注意大小写，必须一致
- 环境变量修改后**必须重新部署**
- 可以选择只在 Production 环境设置，但建议三个环境都设置

## 🚀 快速检查清单

1. [ ] 在 Vercel Settings → Environment Variables 中确认变量已添加
2. [ ] 确认变量值正确（特别是 key 完整复制了）
3. [ ] 确认选择了正确的环境（Production, Preview, Development）
4. [ ] **重新部署**（最重要！）
5. [ ] 检查浏览器控制台是否有错误
6. [ ] 验证页面是否可以正常加载
