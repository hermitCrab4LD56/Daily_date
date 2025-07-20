// 文件路径: apps/server/db.js (最终部署版)
const { Pool } = require('pg');
const config = require('./config');

// 创建一个全局共享的数据库连接池
// Pool 会自动管理连接的创建、复用和释放
const pool = new Pool(config.database);

// 监听并打印连接池中可能发生的后台错误
pool.on('error', (err, client) => {
    console.error('[DB POOL ERROR] Idle client experienced an error', err.stack);
});

// 导出一个简单的 query 函数，它会从池中获取一个连接来执行查询
module.exports = {
  query: (text, params) => pool.query(text, params),
};