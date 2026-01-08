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
        manualChunks: {
          // 将 React 相关库打包到单独的 chunk
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // 将 UI 组件库打包到单独的 chunk
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
          ],
          // 将 Supabase 相关库打包到单独的 chunk
          'supabase-vendor': ['@supabase/supabase-js'],
          // 将工具库打包到单独的 chunk
          'utils-vendor': ['@tanstack/react-query', 'date-fns'],
        },
      },
    },
    // 启用压缩
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // 生产环境移除 console
        drop_debugger: true,
      },
    },
    // 优化 chunk 大小警告阈值
    chunkSizeWarningLimit: 1000,
  },
}));
