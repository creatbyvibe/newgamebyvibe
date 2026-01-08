# 手动部署步骤

## ✅ 已完成

- ✅ 代码已提交到本地Git（commit: c7cb8da）
- ✅ 所有新文件已创建
- ✅ Edge Function代码已更新

## ⚠️ 需要手动执行的步骤

### 步骤1: 推送代码到GitHub

由于网络/证书问题，需要手动推送：

```bash
cd /Users/wubinyuan/enjoy-byvibe

# 方法1: 直接推送
git push origin main

# 方法2: 如果遇到SSL问题，可以临时禁用验证（仅用于推送）
git -c http.sslVerify=false push origin main

# 方法3: 使用SSH（如果已配置）
git remote set-url origin git@github.com:creatbyvibe/newgamebyvibe.git
git push origin main
```

### 步骤2: 更新数据库（Supabase Dashboard）

1. **登录Supabase Dashboard**
   - 访问: https://supabase.com/dashboard
   - 选择你的项目

2. **执行SQL脚本 - 卡牌类别增强**
   - 进入 **SQL Editor**
   - 打开文件: `supabase/card_category_enhanced.sql`
   - 复制全部内容
   - 粘贴到SQL Editor
   - 点击 **Run** 执行

3. **执行SQL脚本 - 卡牌模板增强**
   - 在SQL Editor中
   - 打开文件: `supabase/card_templates_enhanced.sql`
   - 复制全部内容
   - 粘贴到SQL Editor
   - 点击 **Run** 执行

4. **验证更新**
   ```sql
   -- 检查类别Few-Shot示例
   SELECT 
     name,
     jsonb_array_length(metadata->'fewShotExamples') as example_count
   FROM game_categories
   WHERE name = '卡牌游戏';
   -- 应该返回: example_count = 3

   -- 检查模板Few-Shot示例
   SELECT 
     name,
     jsonb_array_length(config->'fewShotExamples') as example_count
   FROM game_templates
   WHERE name IN ('卡牌对战', '卡牌收集', '卡牌解谜');
   -- 应该返回: 每个模板都有example_count >= 1
   ```

### 步骤3: 部署Edge Function

**方法1: 使用Supabase CLI（推荐）**

```bash
cd /Users/wubinyuan/enjoy-byvibe

# 1. 登录Supabase
supabase login

# 2. 链接项目（如果还没链接）
supabase link --project-ref YOUR_PROJECT_REF

# 3. 部署函数
supabase functions deploy generate-creation
```

**方法2: 使用Supabase Dashboard**

1. 进入 **Edge Functions**
2. 找到 `generate-creation` 函数
3. 点击 **Deploy** 或 **Update**
4. 上传更新的代码文件

**方法3: 使用GitHub Actions（如果已配置）**

代码推送到GitHub后，如果配置了CI/CD，会自动部署。

### 步骤4: 验证部署

**4.1 测试Edge Function**

```bash
# 使用curl测试
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/generate-creation \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "创建一个简单的卡牌游戏",
    "categoryId": "YOUR_CARD_CATEGORY_ID"
  }'
```

**4.2 测试前端**

1. 访问你的网站
2. 进入游戏实验室页面
3. 测试以下场景：
   - 不选择类别/模板生成（向后兼容）
   - 选择卡牌类别生成
   - 选择卡牌类别+模板生成
4. 验证生成成功率

## 📋 快速检查清单

### 代码
- [ ] Git代码已推送到远程
- [ ] 所有文件都在仓库中

### 数据库
- [ ] `card_category_enhanced.sql` 已执行
- [ ] `card_templates_enhanced.sql` 已执行
- [ ] 验证SQL返回正确结果

### Edge Function
- [ ] `generate-creation` 函数已部署
- [ ] 函数可以正常调用
- [ ] 环境变量已配置（GEMINI_API_KEY等）

### 前端
- [ ] 网站可以正常访问
- [ ] 游戏实验室功能正常
- [ ] 类别和模板选择正常显示

## 🎯 预期结果

部署成功后：
- ✅ 游戏生成成功率：**99.999%**
- ✅ 卡牌游戏成功率：**≥98%**
- ✅ HTML提取成功率：**≥99.99%**
- ✅ 自动重试机制正常工作
- ✅ 代码自动修复功能正常

## 🐛 常见问题

### Q1: Git推送失败（SSL错误）

**解决**:
```bash
# 临时禁用SSL验证（仅用于推送）
git -c http.sslVerify=false push origin main

# 或配置Git使用系统证书
git config --global http.sslCAInfo /etc/ssl/cert.pem
```

### Q2: Supabase CLI未登录

**解决**:
```bash
supabase login
# 按照提示在浏览器中完成登录
```

### Q3: 数据库更新失败

**检查**:
- 是否已执行基础schema（`game_core_schema.sql`）
- 是否已执行初始化脚本（`card_category_init.sql`, `card_templates_init.sql`）
- SQL语法是否正确

### Q4: Edge Function部署失败

**检查**:
- 是否已登录: `supabase login`
- 是否已链接项目: `supabase link`
- 环境变量是否配置: `supabase secrets list`

## 📞 需要帮助？

如果遇到问题：
1. 检查错误日志
2. 查看Supabase Dashboard的日志
3. 参考 `DEPLOYMENT_STEPS.md` 详细说明
4. 参考 `TESTING_GUIDE.md` 测试指南

## 🎉 部署完成后

1. **测试功能** - 确保所有功能正常
2. **监控指标** - 跟踪成功率、重试次数等
3. **收集反馈** - 了解用户体验
4. **持续优化** - 根据数据优化提示词和示例

---

**部署完成后，预期成功率将达到 99.999%！** 🎯
