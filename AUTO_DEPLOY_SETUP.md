# 自动部署设置指南

## ✅ 当前部署状态

### 前端（Vercel）- 已自动部署
- ✅ **已配置**：Vercel 已连接到 `creatbyvibe/byvibe-game` 仓库
- ✅ **自动触发**：每次推送到 `main` 分支，Vercel 会自动部署
- ✅ **无需额外配置**

### Edge Functions（Supabase）- 需要设置

## 🚀 设置 Supabase Edge Functions 自动部署

### 方法 1: GitHub Actions（推荐）

已创建 `.github/workflows/deploy-edge-functions.yml`，需要配置：

#### 步骤 1: 获取 Supabase Access Token
1. 访问：https://supabase.com/dashboard/account/tokens
2. 点击 "Generate new token"
3. 复制 token

#### 步骤 2: 在 GitHub 添加 Secrets
1. 访问：https://github.com/creatbyvibe/byvibe-game/settings/secrets/actions
2. 点击 "New repository secret"
3. 添加以下 secrets：
   - **Name**: `SUPABASE_ACCESS_TOKEN`
   - **Value**: 你的 Supabase Access Token

#### 步骤 3: 提交工作流文件
```bash
git add .github/workflows/deploy-edge-functions.yml
git commit -m "feat: 添加 Edge Functions 自动部署"
git push new-origin main
```

完成后，每次修改 `supabase/functions/` 下的文件并推送到 `main` 分支，GitHub Actions 会自动部署。

---

### 方法 2: Supabase CLI + 本地脚本（备选）

如果需要手动触发，可以创建部署脚本：

```bash
#!/bin/bash
# deploy-functions.sh

supabase functions deploy game-lab-fusion
supabase functions deploy generate-creation
supabase functions deploy ai-code-assist
supabase functions deploy design-assistant
supabase functions deploy game-save
```

---

## 📋 部署流程总结

### 当前流程（手动）
1. 修改代码
2. `git add .`
3. `git commit -m "..."`
4. `git push new-origin main` → **Vercel 自动部署前端**
5. `supabase functions deploy ...` → **手动部署 Edge Functions**

### 设置自动部署后
1. 修改代码
2. `git add .`
3. `git commit -m "..."`
4. `git push new-origin main` → **Vercel 自动部署前端 + GitHub Actions 自动部署 Edge Functions**

---

## 🔍 验证自动部署

### 检查 Vercel 部署
- 访问：https://vercel.com/bywu28-5405s-projects/byvibe-game
- 查看 "Deployments" 标签页

### 检查 Edge Functions 部署
- 访问：https://supabase.com/dashboard/project/zntuprdrkpceklptodkp/functions
- 查看函数更新时间

### 检查 GitHub Actions
- 访问：https://github.com/creatbyvibe/byvibe-game/actions
- 查看工作流运行状态

---

## ⚠️ 注意事项

1. **Edge Functions 部署需要 Supabase Access Token**
2. **首次设置需要手动添加 GitHub Secrets**
3. **部署可能需要几分钟时间**
4. **如果部署失败，检查 GitHub Actions 日志**
