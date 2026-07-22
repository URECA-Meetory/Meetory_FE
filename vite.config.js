import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Spring Boot 백엔드는 기본적으로 8080 포트에서 실행됩니다.
// 프론트(5173)에서 /api 로 보내는 요청은 아래 proxy 설정을 통해
// 백엔드로 그대로 전달되므로, 백엔드에 별도 CORS 설정을 추가하지 않아도 됩니다.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_TARGET || 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
