// 文件路径: apps/server/generate_uids.js
// 运行命令: node generate_uids.js
const db = require('./db');
const { randomBytes } = require('crypto');

const TOTAL_UIDS_TO_GENERATE = 900;

// 生成一个更随机、更唯一的字符串
const generateUniqueUid = () => {
    return 'NFC-' + randomBytes(8).toString('hex').toUpperCase();
};

const populateUids = async () => {
    console.log(`开始生成并插入 ${TOTAL_UIDS_TO_GENERATE} 个唯一的 NFC UIDs...`);
    const uids = new Set();
    while (uids.size < TOTAL_UIDS_TO_GENERATE) {
        uids.add(generateUniqueUid());
    }

    const client = await db.query('SELECT 1').then(() => db);

    let insertedCount = 0;
    for (const uid of uids) {
        try {
            // 将每个UID插入到 bracelets 表，状态默认为 'new'
            await client.query("INSERT INTO bracelets (nfc_uid, status) VALUES ($1, 'new')", [uid]);
            insertedCount++;
        } catch (error) {
            // 忽略可能因极低概率重复而导致的错误
            if (error.code !== '23505') { 
                console.error(`插入 UID ${uid} 时发生错误:`, error);
            }
        }
    }

    console.log(`成功插入 ${insertedCount} / ${TOTAL_UIDS_TO_GENERATE} 个 UIDs 到 bracelets 表。`);
    process.exit();
};

populateUids().catch(err => {
    console.error('脚本执行失败:', err);
    process.exit(1);
});