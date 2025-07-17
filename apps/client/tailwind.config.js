/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // 包含所有 src 下的 JS/TS/JSX 文件
    "./components/**/*.{js,ts,jsx,tsx}", // 对应文档中的 components/Chat 目录
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

