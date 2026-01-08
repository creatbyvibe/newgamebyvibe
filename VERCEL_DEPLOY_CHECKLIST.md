# Vercel 部署检查清单

## ✅ 环境变量已配置

根据你的截图，环境变量已经正确配置：

- ✅ `VITE_SUPABASE_URL` = `https://zntuprdrkpceklptodkp.supabase.co`
- ✅ `VITE_SUPABASE_PUBLISHABLE_KEY` = `sb_publishable_tIE5GfrweEaKZ9RlaixM1Q_eA7ic8nn`

## 🔄 必须重新部署

**重要**：配置环境变量后，必须重新部署才能使配置生效！

### 重新部署步骤：

1. **在 Vercel Dashboard 中重新部署**：
   - 进入项目 → **Deployments**
   - 找到最新的部署记录
   - 点击右侧的三个点（⋯）
   - 选择 **Redeploy**
   - 确认重新部署

2. **或者通过 Git 推送触发自动部署**：
   - 推送任何代码变更到 GitHub
   - Vercel 会自动检测并重新部署

## 🔍 验证配置是否生效

部署完成后，在浏览器中测试：

1. **打开网站**：访问你的 Vercel 域名（如 `newgamebyvibe.vercel.app`）

2. **打开浏览器控制台**（F12 或 Cmd+Option+I）

3. **运行以下命令检查环境变量**：
   ```javascript
   console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
   console.log('Key:', import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.substring(0, 30) + '...');
   ```

4. **期望的输出**：
   - URL 应该是：`https://zntuprdrkpceklptodkp.supabase.co`
   - Key 应该以 `sb_publishable_` 开头

5. **测试注册功能**：
   - 点击"注册"按钮
   - 填写邮箱和密码
   - 点击"创建账户"
   - 应该不再显示 "Invalid API key" 错误

## ⚠️ 常见问题

### Q: 重新部署后还是显示错误？
A: 检查：
1. 环境变量是否选择了正确的环境（Production/Preview/Development）
2. Key 是否完整（没有截断）
3. URL 格式是否正确（以 https:// 开头）
4. 等待几分钟让部署完全完成

### Q: 如何确认 Key 是否完整？
A: 在 Supabase Dashboard 中：
1. 访问：https://supabase.com/dashboard/project/zntuprdrkpceklptodkp
2. 进入 Settings → API
3. 查看 Project API keys → `anon` `public`
4. 复制完整的 key（通常很长，以 `sb_publishable_` 开头）

### Q: 本地开发环境需要配置吗？
A: 如果需要本地开发，在项目根目录创建 `.env` 文件：
```
VITE_SUPABASE_URL=https://zntuprdrkpceklptodkp.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_tIE5GfrweEaKZ9RlaixM1Q_eA7ic8nn
```

## 📝 检查清单

- [ ] 环境变量已配置（URL 和 Key）
- [ ] 选择了正确的环境（Production/Preview/Development）
- [ ] 已经重新部署项目
- [ ] 等待部署完成（通常 1-3 分钟）
- [ ] 在浏览器控制台验证环境变量
- [ ] 测试注册功能

完成以上步骤后，注册功能应该可以正常工作了！
