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
    // 启用压缩（使用 esbuild，更快，Vite 默认）
    minify: 'esbuild',
    // 优化 chunk 大小警告阈值（提高阈值，避免警告）
    chunkSizeWarningLimit: 1500,
    // 启用源码映射（生产环境可选）
    sourcemap: false,
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    // 让 Vite 自动处理代码分割，避免 React 依赖问题
    rollupOptions: {
      output: {
        // 自动代码分割：所有 node_modules 放在 vendor chunk
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // 将所有依赖放在一个 vendor chunk，避免 React 依赖解析问题
            return 'vendor';
          }
        },
      },
    },
  },
}));
