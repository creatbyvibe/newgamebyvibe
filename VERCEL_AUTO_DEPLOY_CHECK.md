# Vercel 自动部署检查指南

## 🔍 问题：GitHub 推送后 Vercel 没有自动部署

### 可能的原因：

1. **Vercel 项目没有正确连接到 GitHub 仓库**
2. **自动部署功能未启用**
3. **Webhook 没有正确设置**

## ✅ 检查步骤

### 步骤 1: 确认 Vercel 项目连接状态

1. 访问 Vercel Dashboard
   - https://vercel.com/dashboard

2. 进入项目 `newgamebyvibe`

3. 进入 Settings → **Git**

4. 检查 "Connected Git Repository"
   - 应该显示：`creatbyvibe/newgamebyvibe`
   - 如果没有显示，说明**没有连接**，需要连接

5. 检查 "Vercel Automation" 设置
   - Pull Request Comments: 应该启用
   - deployment_status Events: 应该启用

### 步骤 2: 如果显示 "Not Connected"

需要连接 GitHub 仓库：

1. 在 Settings → Git 页面
2. 点击 **"Connect Git Repository"**
3. 选择 GitHub
4. 如果提示授权，点击授权 Vercel 访问 GitHub
5. 搜索并选择 `creatbyvibe/newgamebyvibe`
6. 点击 **"Import"**

### 步骤 3: 验证自动部署

连接后，应该自动触发一次部署。

之后每次推送到 `main` 分支都会自动部署。

### 步骤 4: 手动触发测试

如果想测试自动部署是否工作：

```bash
# 推送一个小的更改
git commit --allow-empty -m "test: 测试自动部署"
git push origin main
```

推送后，在 Vercel Dashboard 的 Deployments 页面应该能看到新的部署开始。

## 🔧 常见问题

### 问题 1: 授权问题

如果提示需要授权 GitHub：
1. 点击授权链接
2. 确保授权 Vercel 访问你的仓库
3. 选择访问所有仓库或特定仓库

### 问题 2: 仓库找不到

- 确保仓库是 Public，或者
- 确保已授权 Vercel 访问 Private 仓库

### 问题 3: Webhook 未设置

Vercel 连接仓库后会自动设置 Webhook。如果没自动设置：

1. 检查 GitHub 仓库 Settings → Webhooks
2. 应该能看到 Vercel 的 Webhook
3. 如果看不到，可能需要重新连接

## 📋 检查清单

- [ ] Vercel 项目 Settings → Git 中显示连接了 `creatbyvibe/newgamebyvibe`
- [ ] "Connected 7m ago" 或类似的连接时间显示
- [ ] 推送到 GitHub 后，Vercel 自动创建新部署
- [ ] GitHub 仓库 Settings → Webhooks 中有 Vercel 的 Webhook

## 💡 快速验证

**测试自动部署：**
```bash
# 推送空提交测试
git commit --allow-empty -m "test: 验证自动部署"
git push origin main
```

推送后，在 Vercel Dashboard 应该立即看到新的部署开始。
