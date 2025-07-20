// 文件路径: apps/server/index.js (最终版)
const express = require('express');
const cors = require('cors');
const config = require('./config'); // 引入中央配置

const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Daily Date Server is running!');
});

// 使用外部路由文件处理所有 /api 路径的请求
app.use('/api', apiRoutes);

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});