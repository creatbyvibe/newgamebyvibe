# Vercel 环境变量修复指南

## 问题原因

代码**没有硬编码**任何 Supabase URL，所有配置都是从环境变量读取的：
- `VITE_SUPABASE_URL` 
- `VITE_SUPABASE_PUBLISHABLE_KEY`

**问题在于**：Vercel Dashboard 中的环境变量值还是旧的项目ID (`oxuzepkyeknogqwktgha`)，需要手动更新为新的项目ID (`zntuprdrkpceklptodkp`)。

## 立即修复步骤

### 1. 在 Vercel Dashboard 更新环境变量

1. 访问：https://vercel.com/dashboard
2. 选择项目：`newgamebyvibe`
3. 进入：**Settings** → **Environment Variables**

### 2. 更新 `VITE_SUPABASE_URL`

- 点击 `VITE_SUPABASE_URL` 右侧的 **三个点菜单** → **Edit**
- **删除旧值**：`https://oxuzepkyeknogqwktgha.supabase.co`
- **设置新值**：`https://zntuprdrkpceklptodkp.supabase.co`
- 确保环境选择：**All Environments** (Production, Preview, Development)
- 点击 **Save**

### 3. 更新 `VITE_SUPABASE_PUBLISHABLE_KEY`

**重要**：这个 key 必须是从**新项目** (`zntuprdrkpceklptodkp`) 获取的！

#### 获取正确的 Key：

1. 访问 Supabase Dashboard：
   ```
   https://supabase.com/dashboard/project/zntuprdrkpceklptodkp
   ```

2. 进入：**Settings** → **API**

3. 找到 **Project API keys** 部分

4. 复制 **`anon` `public`** key（**不是** `service_role` secret key）
   - 格式应该是：`sb_publishable_...` 或 `eyJ...`
   - **不要**使用 `sb_secret_` 开头的 key

#### 在 Vercel 中更新：

- 点击 `VITE_SUPABASE_PUBLISHABLE_KEY` 右侧的 **三个点菜单** → **Edit**
- **粘贴新项目的 anon/public key**
- 确保环境选择：**All Environments**
- 点击 **Save**

### 4. 强制重新部署

环境变量更新后，**必须重新部署**才能生效：

1. 在 Environment Variables 页面顶部，你会看到提示：
   > "A new Deployment is required for your changes to take effect."

2. 有两种方式重新部署：

   **方式 A：在 Environment Variables 页面**
   - 点击提示中的 **"Redeploy"** 按钮

   **方式 B：在 Deployments 页面**
   - 进入：**Deployments** 页面
   - 找到最新的部署记录
   - 点击右侧的 **三个点菜单** → **Redeploy**

### 5. 验证修复

部署完成后：

1. 访问网站：https://newgamebyvibe.vercel.app
2. 打开浏览器控制台（F12）
3. 查看日志，应该看到：
   ```
   🔍 Supabase 配置检查:
     - URL: https://zntuprdrkpceklptodkp.supabase.co ✅
     - Key 前缀: sb_publishable_...
     - URL 格式: ✅
     - Key 格式: ✅
   ```
4. **不应该**再出现 401 错误

## 常见问题

### Q: 为什么代码改了但网站还是用旧值？

A: 因为 Vercel 在**构建时**将环境变量编译到代码中。如果你只更新了环境变量但没有重新部署，旧的构建文件仍然在使用。

### Q: 我已经更新了环境变量，但还是不行？

A: 检查以下几点：
1. ✅ 环境变量值是否正确（没有多余的空格）
2. ✅ 是否选择了 **All Environments**（Production, Preview, Development）
3. ✅ 是否点击了 **Save** 保存
4. ✅ 是否**重新部署**了（最关键！）

### Q: 如何确认 Vercel 使用的环境变量值？

A: 在重新部署后，查看网站控制台的日志。代码会打印出实际使用的 URL 和 Key 前缀。

## 代码说明

代码中**没有任何硬编码**的 Supabase URL。所有配置都从环境变量读取：

```typescript
// src/integrations/supabase/client.ts
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
```

所以**必须在 Vercel Dashboard 中手动更新环境变量**，代码无法自动修改 Vercel 的环境变量设置。

## 总结

- ✅ 代码已经修复完成
- ❌ 但必须在 Vercel Dashboard 手动更新环境变量
- ❌ 更新后必须重新部署

**这三个步骤缺一不可！**
