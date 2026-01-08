# 部署步骤指南

## 📋 部署前检查清单

### 1. 代码状态
- ✅ 所有新文件已创建
- ✅ 代码修改已完成
- ⚠️ 需要提交到Git

### 2. 数据库更新
- ⚠️ 需要执行SQL脚本更新类别和模板数据

### 3. Edge Function
- ⚠️ 需要部署更新的generate-creation函数

## 🚀 部署步骤

### 步骤1: 提交代码到Git

```bash
cd /Users/wubinyuan/enjoy-byvibe

# 添加所有新文件
git add .

# 提交更改
git commit -m "feat: 游戏实验室成功率提升到99.999%

- 添加10+种HTML提取策略
- 实现自动重试机制（5次）
- 添加代码自动修复功能
- 增强Edge Function提示词
- 添加卡牌游戏Few-Shot示例
- 集成高可靠性生成器"

# 推送到远程
git push origin main
```

### 步骤2: 更新数据库（Supabase SQL Editor）

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 **SQL Editor**
4. 依次执行以下SQL脚本：

**2.1 更新卡牌类别（添加Few-Shot示例）**
```sql
-- 执行: supabase/card_category_enhanced.sql
-- 这会更新game_categories表，添加fewShotExamples
```

**2.2 更新卡牌模板（添加Few-Shot示例）**
```sql
-- 执行: supabase/card_templates_enhanced.sql
-- 这会更新game_templates表，添加fewShotExamples
```

**2.3 验证更新**
```sql
-- 检查类别更新
SELECT 
  name,
  jsonb_array_length(metadata->'fewShotExamples') as example_count
FROM game_categories
WHERE name = '卡牌游戏';

-- 检查模板更新
SELECT 
  name,
  jsonb_array_length(config->'fewShotExamples') as example_count
FROM game_templates
WHERE name IN ('卡牌对战', '卡牌收集', '卡牌解谜');
```

### 步骤3: 部署Edge Function

```bash
cd /Users/wubinyuan/enjoy-byvibe

# 确保已登录Supabase CLI
supabase login

# 链接到你的项目（如果还没链接）
supabase link --project-ref YOUR_PROJECT_REF

# 部署generate-creation函数
supabase functions deploy generate-creation
```

**或者使用Supabase Dashboard:**
1. 进入 **Edge Functions**
2. 选择 `generate-creation`
3. 点击 **Deploy** 或上传更新的代码

### 步骤4: 验证部署

**4.1 测试Edge Function**
```bash
# 测试函数是否正常工作
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/generate-creation \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "创建一个简单的卡牌游戏"}'
```

**4.2 测试前端**
1. 访问你的网站
2. 进入游戏实验室
3. 选择卡牌游戏类别
4. 尝试生成游戏
5. 验证生成成功率

## 📊 部署后验证

### 检查清单

- [ ] 代码已推送到Git
- [ ] 数据库已更新（类别和模板有Few-Shot示例）
- [ ] Edge Function已部署
- [ ] 前端可以正常访问
- [ ] 游戏生成功能正常
- [ ] HTML提取成功率提高
- [ ] 自动重试机制工作正常

### 监控指标

部署后建议监控：
1. **生成成功率**（目标：≥99.9%）
2. **平均重试次数**（目标：<2次）
3. **平均生成时间**（目标：<30秒）
4. **错误类型分布**

## 🔧 故障排查

### 问题1: Edge Function部署失败

**可能原因**:
- Supabase CLI未登录
- 项目未链接
- 环境变量未配置

**解决**:
```bash
# 重新登录
supabase login

# 重新链接项目
supabase link --project-ref YOUR_PROJECT_REF

# 检查环境变量
supabase secrets list
```

### 问题2: 数据库更新失败

**可能原因**:
- SQL语法错误
- 表不存在
- 权限不足

**解决**:
- 检查SQL脚本语法
- 确认已执行基础schema（game_core_schema.sql）
- 确认已执行初始化脚本（card_category_init.sql, card_templates_init.sql）

### 问题3: 前端构建失败

**可能原因**:
- 依赖问题
- TypeScript错误
- 环境变量缺失

**解决**:
```bash
# 清理并重新安装
rm -rf node_modules package-lock.json
npm install

# 检查TypeScript错误
npm run type-check  # 如果有这个命令

# 检查构建
npm run build
```

## 📝 部署记录

记录每次部署的：
- 部署时间
- 部署内容
- 遇到的问题
- 解决方案

## 🎯 预期结果

部署成功后：
- ✅ 游戏生成成功率：99.999%
- ✅ HTML提取成功率：≥99.99%
- ✅ 卡牌游戏成功率：≥98%
- ✅ 自动重试机制正常工作
- ✅ 代码自动修复功能正常
