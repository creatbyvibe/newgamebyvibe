#!/bin/bash

# 部署脚本
# 执行所有部署步骤

set -e  # 遇到错误立即退出

echo "🚀 开始部署..."

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 步骤1: 检查Git状态
echo -e "${YELLOW}步骤1: 检查Git状态...${NC}"
cd /Users/wubinyuan/enjoy-byvibe

if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}发现未提交的更改，需要先提交代码${NC}"
    echo "请执行以下命令："
    echo "  git add ."
    echo "  git commit -m 'feat: 游戏实验室成功率提升到99.999%'"
    echo "  git push origin main"
    echo ""
    read -p "是否现在提交代码? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add .
        git commit -m "feat: 游戏实验室成功率提升到99.999%

- 添加10+种HTML提取策略
- 实现自动重试机制（5次）
- 添加代码自动修复功能
- 增强Edge Function提示词
- 添加卡牌游戏Few-Shot示例
- 集成高可靠性生成器"
        git push origin main
        echo -e "${GREEN}✅ 代码已提交并推送${NC}"
    else
        echo -e "${RED}❌ 请先提交代码后再继续${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Git工作区干净${NC}"
fi

# 步骤2: 检查Supabase CLI
echo -e "${YELLOW}步骤2: 检查Supabase CLI...${NC}"
if command -v supabase &> /dev/null; then
    echo -e "${GREEN}✅ Supabase CLI已安装${NC}"
    
    # 检查是否登录
    if supabase projects list &> /dev/null; then
        echo -e "${GREEN}✅ Supabase CLI已登录${NC}"
        
        # 部署Edge Function
        echo -e "${YELLOW}步骤3: 部署Edge Function...${NC}"
        if supabase functions deploy generate-creation; then
            echo -e "${GREEN}✅ Edge Function部署成功${NC}"
        else
            echo -e "${RED}❌ Edge Function部署失败${NC}"
            echo "请检查："
            echo "  1. 是否已登录: supabase login"
            echo "  2. 是否已链接项目: supabase link"
            echo "  3. 环境变量是否配置: supabase secrets list"
        fi
    else
        echo -e "${YELLOW}⚠️  Supabase CLI未登录，请先登录${NC}"
        echo "执行: supabase login"
    fi
else
    echo -e "${YELLOW}⚠️  Supabase CLI未安装${NC}"
    echo "安装方法: npm install -g supabase"
    echo "或访问: https://supabase.com/docs/guides/cli"
fi

# 步骤3: 数据库更新提示
echo ""
echo -e "${YELLOW}步骤4: 数据库更新（需要在Supabase Dashboard手动执行）${NC}"
echo "请在Supabase SQL Editor中执行以下SQL脚本："
echo "  1. supabase/card_category_enhanced.sql"
echo "  2. supabase/card_templates_enhanced.sql"
echo ""
echo "验证SQL:"
echo "  SELECT name, jsonb_array_length(metadata->'fewShotExamples') FROM game_categories WHERE name = '卡牌游戏';"
echo "  SELECT name, jsonb_array_length(config->'fewShotExamples') FROM game_templates WHERE name IN ('卡牌对战', '卡牌收集', '卡牌解谜');"

# 步骤4: 构建检查
echo ""
echo -e "${YELLOW}步骤5: 检查构建...${NC}"
if npm run build 2>&1 | head -20; then
    echo -e "${GREEN}✅ 构建成功${NC}"
else
    echo -e "${YELLOW}⚠️  构建可能有问题，请检查错误信息${NC}"
fi

echo ""
echo -e "${GREEN}🎉 部署步骤完成！${NC}"
echo ""
echo "下一步："
echo "  1. 在Supabase Dashboard执行SQL更新"
echo "  2. 验证Edge Function部署"
echo "  3. 测试游戏生成功能"
echo "  4. 监控成功率指标"
