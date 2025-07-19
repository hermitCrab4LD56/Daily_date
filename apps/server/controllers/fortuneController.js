// 文件路径: apps/server/controllers/fortuneController.js
const db = require('../db');
const { generateNewFortune } = require('../services/fortuneService');

const getFortune = async (req, res) => {
    const { nfcUid } = req.query;
    if (!nfcUid) return res.status(400).json({ error: 'nfcUid is required' });

    const { rows: [user] } = await db.query("SELECT * FROM users WHERE nfc_uid = $1 AND status = 'active'", [nfcUid]);
    
    if (user) {
        const now = new Date();
        const lastFortuneDate = user.last_fortune_at ? new Date(user.last_fortune_at) : null;

        // 计算今天和昨天的早上8点
        const today8AM = new Date();
        today8AM.setHours(8, 0, 0, 0);
        const yesterday8AM = new Date(today8AM);
        yesterday8AM.setDate(today8AM.getDate() - 1);

        // 判断是否需要生成新消息的条件：
        // 1. 从未生成过消息 (lastFortuneDate is null)
        // 2. 当前时间已过今天8点，但上次生成是在今天8点之前
        const needsUpdate = !lastFortuneDate || (now >= today8AM && lastFortuneDate < today8AM);

        if (needsUpdate) {
            // b) 需要更新，生成新内容
            const newMessage = await generateNewFortune(user);
            return res.json({ message: newMessage });
        } else {
            // a) 不需要更新，返回缓存内容
            console.log(`用户 ${user.id} 在刷新周期内访问，返回缓存消息。`);
            return res.json({ message: user.last_fortune_message });
        }

    } else {
        return res.status(404).json({ error: 'User not found. Please register.' });
    }
};

module.exports = { getFortune };