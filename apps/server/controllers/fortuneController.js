// 文件路径: apps/server/controllers/fortuneController.js
const db = require('../db');
const { generateNewFortune } = require('../services/fortuneService');

const getFortune = async (req, res) => {
    const { nfcUid } = req.query;
    if (!nfcUid) return res.status(400).json({ error: 'nfcUid is required' });

    // 分支2：nfcUid 在数据库中
    const { rows: [user] } = await db.query("SELECT * FROM users WHERE nfc_uid = $1 AND status = 'active'", [nfcUid]);
    if (user) {
        const now = new Date();
        const lastFortuneDate = new Date(user.last_fortune_at);
        const hoursDiff = (now - lastFortuneDate) / (1000 * 60 * 60);

        // a) 24小时内，返回缓存内容
        if (user.last_fortune_message && hoursDiff < 24) {
            console.log(`用户 ${user.id} 在24小时内访问，返回缓存消息。`);
            return res.json({ message: user.last_fortune_message });
        }
        // b) 超过24小时，生成新内容
        else {
            const newMessage = await generateNewFortune(user);
            return res.json({ message: newMessage });
        }
    }
    
    // 分支1：nfcUid 不在数据库中 -> 告诉前端该用户是新人
    else {
        return res.status(404).json({ error: 'User not found. Please register.' });
    }
};

module.exports = { getFortune };