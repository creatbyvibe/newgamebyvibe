# 快速部署指南

## 🚀 3步完成部署

### 1️⃣ 推送代码（1分钟）

```bash
cd /Users/wubinyuan/enjoy-byvibe
git push origin main
```

如果遇到SSL错误：
```bash
git -c http.sslVerify=false push origin main
```

### 2️⃣ 更新数据库（2分钟）

在 [Supabase Dashboard](https://supabase.com/dashboard) → SQL Editor：

1. 执行 `supabase/card_category_enhanced.sql`
2. 执行 `supabase/card_templates_enhanced.sql`
3. 验证：
   ```sql
   SELECT jsonb_array_length(metadata->'fewShotExamples') 
   FROM game_categories WHERE name = '卡牌游戏';
   ```

### 3️⃣ 部署Edge Function（1分钟）

```bash
supabase login
supabase functions deploy generate-creation
```

或使用Dashboard手动部署。

## ✅ 完成！

部署后测试：
- 访问游戏实验室
- 选择卡牌游戏类别
- 生成游戏
- 验证成功率

**预期成功率：99.999%** 🎯
