// 文件路径: apps/server/check_uid.js
require('dotenv').config(); // 确保环境变量被加载
const { query, pool } = require('./db');

// 把您确认存在于数据库中的 UID 粘贴到这里
const uidToTest = 'NFC-172EC546C514C5D9';

const check = async () => {
    console.log(`[Check Script] 正在使用数据库: ${process.env.DB_DATABASE}, 用户: ${process.env.DB_USER}`);
    console.log(`[Check Script] 正在查询 UID: "${uidToTest}"...`);
    try {
        const { rows } = await query('SELECT * FROM bracelets WHERE nfc_uid = $1', [uidToTest]);

        if (rows.length > 0) {
            console.log('\n✅✅✅ 成功! Node.js 应用找到了这条 UID 记录! ✅✅✅');
            console.log(rows[0]);
        } else {
            console.log('\n❌❌❌ 失败! Node.js 应用依然找不到这条 UID 记录。❌❌❌');
        }
    } catch (err) {
        console.error('查询过程中发生错误:', err);
    } finally {
        // 关闭数据库连接池，让脚本可以正常退出
        await pool.end();
    }
};

check();