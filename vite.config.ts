import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // 启用压缩（使用 esbuild，更快，Vite 默认）
    minify: 'esbuild',
    // 优化 chunk 大小警告阈值
    chunkSizeWarningLimit: 1000,
    // 启用源码映射（生产环境可选）
    sourcemap: false,
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    // 优化代码分割策略
    rollupOptions: {
      output: {
        // 精细的代码分割策略
        manualChunks(id) {
          // 将所有 node_modules 的依赖进行分组
          if (id.includes('node_modules')) {
            // React 核心库单独打包
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            
            // Radix UI 组件库单独打包（通常较大）
            if (id.includes('@radix-ui')) {
              return 'radix-ui';
            }
            
            // Supabase 相关
            if (id.includes('@supabase')) {
              return 'supabase';
            }
            
            // UI 工具库
            if (id.includes('lucide-react') || id.includes('sonner') || id.includes('framer-motion')) {
              return 'ui-libs';
            }
            
            // React Query 和状态管理
            if (id.includes('@tanstack') || id.includes('zustand')) {
              return 'state-management';
            }
            
            // i18n 相关
            if (id.includes('i18next') || id.includes('react-i18next')) {
              return 'i18n';
            }
            
            // 其他 node_modules 依赖
            return 'vendor';
          }
          
          // 按路由分割页面代码
          if (id.includes('/src/pages/')) {
            const pageMatch = id.match(/\/src\/pages\/([^/]+)\.tsx?$/);
            if (pageMatch) {
              const pageName = pageMatch[1];
              // 大型页面单独打包
              if (['GameLab', 'CardGame', 'StudioPage', 'InteractiveConsole'].includes(pageName)) {
                return `page-${pageName.toLowerCase()}`;
              }
              // 其他页面可以合并
              return 'pages';
            }
          }
        },
        // 优化 chunk 文件命名
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop()?.replace(/\.[^.]*$/, '')
            : 'chunk';
          return `js/${facadeModuleId}-[hash].js`;
        },
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `images/[name]-[hash][extname]`;
          }
          if (/woff2?|eot|ttf|otf/i.test(ext)) {
            return `fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
      },
    },
    // 启用 Tree Shaking
    treeshake: {
      moduleSideEffects: 'no-external',
      propertyReadSideEffects: false,
      tryCatchDeoptimization: false,
    },
  },
}));
