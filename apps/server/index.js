// 文件路径: apps/server/index.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors()); // 允许跨域
app.use(express.json()); // 解析 JSON 请求体
app.use(express.urlencoded({ extended: true }));

// 根路由
app.get('/', (req, res) => {
  res.send('Daily Date Server is running!');
});

// API 路由
app.use('/api', apiRoutes);

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});