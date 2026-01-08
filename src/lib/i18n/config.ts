import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import zhCN from './locales/zh-CN.json';
import enUS from './locales/en-US.json';

i18n
  // 检测用户语言
  .use(LanguageDetector)
  // 传入 react-i18next
  .use(initReactI18next)
  // 初始化 i18next
  .init({
    resources: {
      'zh-CN': {
        translation: zhCN,
      },
      'en-US': {
        translation: enUS,
      },
    },
    fallbackLng: 'zh-CN', // 默认语言
    debug: false,

    interpolation: {
      escapeValue: false, // React 已经转义了
    },

    detection: {
      // 检测顺序
      order: ['localStorage', 'navigator', 'htmlTag'],
      // 缓存用户选择的语言
      caches: ['localStorage'],
    },
  });

export default i18n;
