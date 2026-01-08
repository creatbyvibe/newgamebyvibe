# Vercel 环境变量配置指南

## 问题说明

如果注册时出现 "Invalid API key" 错误，说明 Vercel 上的环境变量未正确配置。

## 配置步骤

### 1. 访问 Vercel Dashboard
- 访问：https://vercel.com/dashboard
- 选择项目：`newgamebyvibe`（或你的项目名称）

### 2. 进入 Environment Variables 设置
- 点击项目设置（Settings）
- 左侧菜单选择 "Environment Variables"

### 3. 添加以下环境变量

需要添加两个环境变量：

#### 变量 1：`VITE_SUPABASE_URL`
- **Key**: `VITE_SUPABASE_URL`
- **Value**: `https://oxuzepkyeknogqwktgha.supabase.co`
- **Environment**: 选择 `Production`, `Preview`, 和 `Development`

#### 变量 2：`VITE_SUPABASE_PUBLISHABLE_KEY`
- **Key**: `VITE_SUPABASE_PUBLISHABLE_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94dXplcGt5ZWtub2dxd2t0Z2hhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3NTU4NzcsImV4cCI6MjA4MzMzMTg3N30.Oh8lc6pe2XtB_zmSnuQ4-4S-a9iT7e7nfFRcsetztKc`
- **Environment**: 选择 `Production`, `Preview`, 和 `Development`

**⚠️ 重要提示**：
- 这个 key 必须是 **anon/public key**（以 `eyJ` 开头或 `sb_publishable_` 开头）
- **不要**使用 `sb_secret_` 开头的 secret key
- Secret key 只能在服务器端使用，不能在浏览器端使用

### 4. 获取正确的 Key

如果上面的 key 不对，请按以下步骤获取：

1. 访问 Supabase Dashboard: https://supabase.com/dashboard
2. 选择项目：`oxuzepkyeknogqwktgha`
3. 进入 **Settings** → **API**
4. 找到 **Project API keys**
5. 复制 **`anon` `public`** key（不是 `service_role` secret key）

### 5. 重新部署

配置完环境变量后：

1. 在 Vercel Dashboard 中点击 **Deployments**
2. 找到最新的部署记录
3. 点击右侧的三个点（...）
4. 选择 **Redeploy**
5. 或者直接推送新的代码到 GitHub，Vercel 会自动重新部署

### 6. 验证配置

部署完成后，在浏览器控制台检查：

```javascript
console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Key:', import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.substring(0, 20) + '...');
```

如果看到正确的值，说明配置成功。

## 常见问题

### Q: 环境变量配置后还是显示错误？
A: 确保：
1. 变量名称完全正确（区分大小写）
2. 选择的环境（Production/Preview/Development）正确
3. 已经重新部署了项目

### Q: 如何确认使用的是正确的 key？
A: 在 Supabase Dashboard → Settings → API 中：
- `anon` `public` key：可以在浏览器中使用 ✅
- `service_role` secret key：只能在服务器端使用 ❌

### Q: 本地开发可以注册，但生产环境不行？
A: 检查 Vercel 上的环境变量是否正确配置，特别是 Production 环境。

## 技术支持

如果配置后仍然有问题，请检查：
1. 浏览器控制台的错误信息
2. Vercel 部署日志中的错误
3. Supabase Dashboard 中的 API 使用日志
