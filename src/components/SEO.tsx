import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  type?: 'website' | 'article';
}

/**
 * SEO 组件
 * 动态更新页面的 meta 标签和 Open Graph 标签
 */
export const SEO = ({
  title = 'ByVibe - AI 游戏创作平台',
  description = '用 AI 将你的想法变成可玩的游戏和实用工具。无需编程，立即开始。',
  image = '/og-image.png',
  type = 'website',
}: SEOProps) => {
  const location = useLocation();

  useEffect(() => {
    // 更新 title
    document.title = title;

    // 更新或创建 meta 标签
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;

      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }

      element.setAttribute('content', content);
    };

    // 基础 meta 标签
    updateMetaTag('description', description);
    updateMetaTag('keywords', 'AI, 游戏创作, 代码生成, 工具, 创意');

    // Open Graph 标签
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', image, true);
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:url', window.location.href, true);

    // Twitter Card 标签
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);

    // 结构化数据 (JSON-LD)
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'ByVibe',
      description: description,
      url: window.location.origin,
      applicationCategory: 'GameApplication',
      operatingSystem: 'Web',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    };

    // 移除旧的 structured data
    const oldScript = document.querySelector('script[type="application/ld+json"]');
    if (oldScript) {
      oldScript.remove();
    }

    // 添加新的 structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);
  }, [location.pathname, title, description, image, type]);

  return null;
};
