// 文件路径: apps/server/config.js
require('dotenv').config();

module.exports = {
  database: {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT, 10),
  },
  server: {
    port: process.env.PORT || 3001,
  },
  zhipu: {
    apiKey: process.env.ZHIPU_API_KEY,
  }
};