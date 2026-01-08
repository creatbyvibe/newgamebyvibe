# Vercel 连接了错误的 GitHub 仓库 - 快速修复

## 🚨 问题确认

从构建日志看到：
```
Cloning github.com/creatbyvibe/byvibe-game (Branch: main, Commit: 07345e7)
```

**错误**：连接的是 `byvibe-game` 仓库  
**正确**：应该是 `enjoy-byvibe` 仓库

## ✅ 立即修复步骤

### 方法一：在 Vercel Dashboard 中修改（最快）

1. **访问 Vercel Dashboard**
   - https://vercel.com/dashboard

2. **找到错误的项目**
   - 找到连接 `byvibe-game` 的项目

3. **进入项目设置**
   - 点击项目名称进入详情页
   - 点击顶部 **"Settings"** 标签

4. **修改 Git Repository**
   - 滚动到 **"Git"** 部分
   - 找到 **"Git Repository"** 设置
   - 点击 **"Disconnect"** 按钮
   - 确认断开连接

5. **连接正确的仓库**
   - 点击 **"Connect Git Repository"**
   - 搜索 `enjoy-byvibe`
   - 选择 `creatbyvibe/enjoy-byvibe`
   - 点击 **"Import"**

6. **验证配置**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Framework Preset: `Vite`

7. **重新部署**
   - 点击 **"Deploy"** 或推送到 GitHub 触发自动部署

### 方法二：删除项目并重新创建（如果方法一不行）

1. **删除错误的项目**
   - Settings → 底部 "Danger Zone" → "Delete Project"

2. **创建新项目**
   - Dashboard → "Add New..." → "Project"
   - Import `creatbyvibe/enjoy-byvibe`
   - 配置：
     - Framework Preset: `Vite`
     - Build Command: `npm run build`
     - Output Directory: `dist`
   - Deploy

## 📋 修复后验证

部署日志应该显示：
```
Cloning github.com/creatbyvibe/enjoy-byvibe (Branch: main, Commit: ...)
```

## 🔧 其他需要检查的配置

### Build Command
```
npm run build
```

### Output Directory
```
dist
```

### Install Command
```
npm install
```

### Framework Preset
```
Vite
```

## ⚠️ 注意事项

1. **环境变量**：如果旧项目有环境变量，记得在新项目中重新添加：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - 其他需要的环境变量

2. **自定义域名**：如果配置了自定义域名，需要在 Settings → Domains 中重新添加

3. **Browserslist 警告**（非紧急）：
   ```
   npx update-browserslist-db@latest
   ```
   这个警告不影响构建，但可以稍后更新。

## 🎯 推荐操作

1. **立即操作**：使用**方法一**修改 Git Repository
2. **验证**：推送代码到 GitHub，确认 Vercel 自动部署正确的仓库
3. **清理**：如果 `byvibe-game` 项目不再需要，可以删除它
