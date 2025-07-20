// 文件路径: apps/server/controllers/fortuneController.js
const db = require('../db');
const { generateNewFortune } = require('../services/fortuneService');

const getFortune = async (req, res) => {
    // Express 会自动处理 async 函数中的异常，并传递给错误处理中间件
    const { nfcUid } = req.query;
    if (!nfcUid) {
        return res.status(400).json({ error: 'nfcUid is required' });
    }

    // 验证 nfcUid 是否有效
    const { rows: [bracelet] } = await db.query("SELECT * FROM bracelets WHERE nfc_uid = $1", [nfcUid]);

    if (!bracelet) {
        console.warn(`检测到无效的 NFC UID 访问: ${nfcUid}`);
        return res.status(403).json({ error: 'Invalid NFC UID. Please use an official tag.' });
    }
    
    // 检查用户是否已注册
    const { rows: [user] } = await db.query("SELECT * FROM users WHERE nfc_uid = $1 AND status = 'active'", [nfcUid]);
    
    if (user) {
        // 已存在用户
        const now = new Date();
        const lastFortuneDate = user.last_fortune_at ? new Date(user.last_fortune_at) : null;
        
        const today8AM = new Date();
        today8AM.setHours(8, 0, 0, 0);

        const needsUpdate = !lastFortuneDate || (now >= today8AM && lastFortuneDate < today8AM);

        if (needsUpdate) {
            const newMessage = await generateNewFortune(user);
            return res.json({ message: newMessage });
        } else {
            console.log(`用户 ${user.id} 在刷新周期内访问，返回缓存消息。`);
            return res.json({ message: user.last_fortune_message });
        }
    } else {
        // 新用户
        return res.status(404).json({ error: 'User not found. Please register.' });
    }
};

module.exports = { getFortune };