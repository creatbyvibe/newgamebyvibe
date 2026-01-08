# 创建新仓库并重新部署指南

## 📋 步骤概览

1. 在 GitHub 创建新仓库
2. 更新本地 git remote
3. 推送代码到新仓库
4. 在 Vercel 中连接新仓库
5. 配置环境变量
6. 部署

## 🚀 详细步骤

### 步骤 1: 在 GitHub 创建新仓库

1. 访问 https://github.com/new
2. 填写仓库信息：
   - **Repository name**: `enjoy-byvibe-v2` (或你喜欢的名称)
   - **Description**: `Create by Vibe, Share the Joy - AI Game Creation Platform`
   - **Visibility**: Public 或 Private（根据你的需求）
   - **不要**勾选 "Initialize this repository with a README"
   - **不要**添加 .gitignore 或 license（我们已有）
3. 点击 **"Create repository"**

### 步骤 2: 更新本地 git remote

创建新仓库后，GitHub 会显示仓库 URL，类似：
```
https://github.com/creatbyvibe/enjoy-byvibe-v2.git
```

在本地执行：

```bash
cd /Users/wubinyuan/enjoy-byvibe

# 查看当前 remote
git remote -v

# 更新 remote URL（替换为你的新仓库 URL）
git remote set-url origin https://github.com/creatbyvibe/enjoy-byvibe-v2.git

# 或者添加新的 remote（如果你想保留旧的）
git remote add new-origin https://github.com/creatbyvibe/enjoy-byvibe-v2.git
```

### 步骤 3: 推送代码到新仓库

```bash
# 确保所有更改已提交
git add .
git commit -m "chore: 准备新仓库部署"

# 推送到新仓库
git push -u origin main

# 或者如果使用了 new-origin
git push -u new-origin main
```

### 步骤 4: 在 Vercel 中连接新仓库

1. 访问 https://vercel.com/dashboard
2. 点击 **"Add New..."** → **"Project"**
3. 在 "Import Git Repository" 中搜索新仓库名称
4. 选择新仓库并点击 **"Import"**
5. 配置项目：
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
6. 点击 **"Deploy"**

### 步骤 5: 配置环境变量

在 Vercel 项目设置中添加环境变量：

1. 进入项目 Settings → **Environment Variables**
2. 添加以下变量（根据你的实际值）：
   ```
   VITE_SUPABASE_URL=你的_Supabase_URL
   VITE_SUPABASE_PUBLISHABLE_KEY=你的_Supabase_Key
   ```
3. 选择环境：Production, Preview, Development（全选）
4. 点击 **"Save"**

### 步骤 6: 重新部署

环境变量配置后，Vercel 会自动触发重新部署。或者：

1. 在 Deployments 页面
2. 找到最新的部署
3. 点击 **"Redeploy"**

## ✅ 验证清单

- [ ] 新仓库已创建
- [ ] 代码已推送到新仓库
- [ ] Vercel 项目已连接新仓库
- [ ] 构建配置正确（Vite, dist, npm run build）
- [ ] 环境变量已配置
- [ ] 部署成功
- [ ] 网站可以正常访问

## 🔧 如果遇到问题

### 问题：推送被拒绝
```bash
# 如果新仓库有初始提交，需要先拉取
git pull origin main --allow-unrelated-histories
git push -u origin main
```

### 问题：Vercel 找不到仓库
- 确保 GitHub 账户已授权 Vercel
- 检查仓库是否为 Private（需要授权访问）

### 问题：构建失败
- 检查 Build Command: `npm run build`
- 检查 Output Directory: `dist`
- 查看构建日志中的错误信息

## 💡 建议

1. **仓库命名**：使用有意义的名称，如 `enjoy-byvibe-v2` 或 `byvibe-platform`
2. **保留旧仓库**：可以保留旧仓库作为备份
3. **文档**：在新仓库的 README 中说明这是新版本

## 📝 快速命令总结

```bash
# 1. 创建新仓库后，更新 remote
git remote set-url origin https://github.com/creatbyvibe/新仓库名.git

# 2. 推送代码
git push -u origin main

# 3. 在 Vercel 中导入新仓库并部署
```
