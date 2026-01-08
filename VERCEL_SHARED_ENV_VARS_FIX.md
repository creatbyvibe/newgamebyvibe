# Vercel Shared Environment Variables 修复指南

## 问题说明

如果你使用 **"Link Shared Environment Variables"** 功能，环境变量是在**团队级别**设置的，然后在项目中链接使用。

## 关键区别

### Shared Environment Variables vs Project Environment Variables

| 类型 | 设置位置 | 更新位置 | 适用场景 |
|------|---------|---------|---------|
| **Shared** | 团队设置 | 团队级别 | 多个项目共享相同配置 |
| **Project** | 项目设置 | 项目级别 | 项目特定的配置 |

**问题**：如果在团队级别的 Shared Environment Variables 中设置了旧的项目ID，所有链接的项目都会使用旧值。

## 修复步骤

### 步骤 1：检查团队级别的共享环境变量

1. 访问 Vercel Dashboard：https://vercel.com/dashboard
2. 点击左侧的 **团队名称**（不是项目名称）
3. 进入：**Settings** → **Environment Variables**
4. 查看 **"Shared Environment Variables"** 部分

### 步骤 2：更新共享环境变量

找到以下共享环境变量并更新：

#### 1. 更新 `VITE_SUPABASE_URL`

- 找到 `VITE_SUPABASE_URL` 的共享环境变量
- 点击右侧的 **三个点菜单** → **Edit**
- **检查当前值**：
  - ❌ 如果是：`https://oxuzepkyeknogqwktgha.supabase.co`（旧项目）
  - ✅ 应该改为：`https://zntuprdrkpceklptodkp.supabase.co`（新项目）
- 确保环境选择：**All Environments** (Production, Preview, Development)
- 点击 **Save**

#### 2. 更新 `VITE_SUPABASE_PUBLISHABLE_KEY`

**重要**：这个 key 必须是从**新项目** (`zntuprdrkpceklptodkp`) 获取的！

1. 获取新项目的 Key：
   - 访问：https://supabase.com/dashboard/project/zntuprdrkpceklptodkp
   - 进入：**Settings** → **API**
   - 复制 **`anon` `public`** key（不是 `service_role` secret key）
   - 格式应该是：`sb_publishable_...` 或 `eyJ...`

2. 更新共享环境变量：
   - 找到 `VITE_SUPABASE_PUBLISHABLE_KEY` 的共享环境变量
   - 点击右侧的 **三个点菜单** → **Edit**
   - **删除旧项目的 key**
   - **粘贴新项目的 anon/public key**
   - 确保环境选择：**All Environments**
   - 点击 **Save**

### 步骤 3：确认项目链接状态

1. 回到项目页面：选择 `newgamebyvibe` 项目
2. 进入：**Settings** → **Environment Variables**
3. 查看 **"Link Shared Environment Variables"** 部分

确认以下事项：
- ✅ `VITE_SUPABASE_URL` 已链接
- ✅ `VITE_SUPABASE_PUBLISHABLE_KEY` 已链接
- ✅ 如果看到 "No ids provided" 错误，说明链接失败，需要重新链接

### 步骤 4：重新链接（如果需要）

如果链接状态不正确：

1. 在 "Link Shared Environment Variables" 部分
2. 点击 **"Link Shared Environment Variables"** 按钮
3. 在搜索框中输入：`VITE_SUPABASE_URL`
4. 选择正确的共享环境变量
5. 确保环境选择：**All Environments**
6. 点击 **"Link"** 按钮
7. 重复步骤 3-6 链接 `VITE_SUPABASE_PUBLISHABLE_KEY`

### 步骤 5：检查项目级别的环境变量冲突

**重要**：项目级别的环境变量会**覆盖**共享环境变量！

1. 在项目的 Environment Variables 页面
2. 查看 **"Current Environment Variables"** 列表
3. 检查是否有：
   - `VITE_SUPABASE_URL`（项目级别）
   - `VITE_SUPABASE_PUBLISHABLE_KEY`（项目级别）

如果存在项目级别的同名变量：
- **选项 A**：删除项目级别的变量，使用共享变量
- **选项 B**：更新项目级别的变量值为新项目ID

**建议**：如果使用 Shared Environment Variables，应该删除项目级别的同名变量，避免冲突。

### 步骤 6：强制重新部署

环境变量更新后，**必须重新部署**才能生效：

1. 在 Environment Variables 页面顶部，你会看到提示：
   > "A new Deployment is required for your changes to take effect."

2. 点击 **"Redeploy"** 按钮

或者：

1. 进入：**Deployments** 页面
2. 找到最新的部署记录
3. 点击右侧的 **三个点菜单** → **Redeploy**

### 步骤 7：验证修复

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

### Q: 为什么链接的共享环境变量还是旧值？

A: 可能的原因：
1. ❌ 团队级别的共享环境变量值还是旧的
2. ❌ 项目级别的环境变量覆盖了共享变量
3. ❌ 没有重新部署

**解决方案**：在团队级别更新共享环境变量，删除项目级别的同名变量，然后重新部署。

### Q: Shared Environment Variables 和 Project Environment Variables 哪个优先？

A: **项目级别的环境变量优先**！如果项目中有同名变量，会覆盖共享变量。

**建议**：
- 如果多个项目共享相同配置 → 使用 Shared Environment Variables
- 如果项目有特定配置 → 使用 Project Environment Variables

### Q: 如何确认使用的是共享变量还是项目变量？

A: 在项目的 Environment Variables 页面：
- 如果变量显示 "Linked" → 使用的是共享变量
- 如果变量显示变量值 → 使用的是项目级别变量

### Q: 更新共享环境变量后，需要重新链接吗？

A: **不需要**！只需要：
1. ✅ 在团队级别更新共享环境变量的值
2. ✅ 在项目中重新部署

链接关系不会因为更新值而断开，但**必须重新部署**才能使用新值。

## 快速检查清单

- [ ] 在团队级别更新了 `VITE_SUPABASE_URL` = `https://zntuprdrkpceklptodkp.supabase.co`
- [ ] 在团队级别更新了 `VITE_SUPABASE_PUBLISHABLE_KEY` = 新项目的 anon/public key
- [ ] 确认项目已链接这两个共享环境变量
- [ ] 确认项目级别没有同名的环境变量（会覆盖共享变量）
- [ ] 已点击 **Redeploy** 重新部署
- [ ] 部署完成后，控制台显示新的项目ID

## 总结

**关键点**：
1. ✅ 共享环境变量在**团队级别**设置
2. ✅ 更新共享环境变量后，**所有链接的项目**都会使用新值
3. ✅ 项目级别的环境变量会**覆盖**共享变量
4. ✅ **必须重新部署**才能使用新的环境变量值
