// 文件路径: apps/server/db.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// 导出查询方法，方便其他模块使用
module.exports = {
  query: (text, params) => pool.query(text, params),
};