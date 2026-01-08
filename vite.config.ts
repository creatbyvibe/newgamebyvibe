import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // 将 node_modules 中的依赖包分离
          if (id.includes('node_modules')) {
            // React 核心库（确保 react 和 react-dom 在同一 chunk，避免 createContext 错误）
            if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/react/jsx-runtime')) {
              return 'react-vendor';
            }
            // React Router（与 React 分离）
            if (id.includes('react-router')) {
              return 'react-router-vendor';
            }
            // UI 组件库
            if (id.includes('@radix-ui')) {
              return 'ui-vendor';
            }
            // Supabase
            if (id.includes('@supabase')) {
              return 'supabase-vendor';
            }
            // i18n
            if (id.includes('i18next') || id.includes('react-i18next')) {
              return 'i18n-vendor';
            }
            // 其他工具库
            if (id.includes('@tanstack/react-query') || id.includes('date-fns') || id.includes('zustand')) {
              return 'utils-vendor';
            }
            // 其他 node_modules
            return 'vendor';
          }
        },
      },
    },
    // 启用压缩（使用 esbuild，更快，Vite 默认）
    minify: 'esbuild',
    // 优化 chunk 大小警告阈值（提高阈值，避免警告）
    chunkSizeWarningLimit: 1500,
    // 启用源码映射（生产环境可选）
    sourcemap: false,
    // 启用 CSS 代码分割
    cssCodeSplit: true,
  },
}));
