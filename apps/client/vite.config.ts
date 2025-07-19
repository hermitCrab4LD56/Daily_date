import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 将所有以 /api 开头的请求，代理到后端的 3001 端口
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        // (可选) 如果后端 API 路径没有 /api 前缀，可以重写路径
        // rewrite: (path) => path.replace(/^\/api/, '') 
      }
    }
  }
})