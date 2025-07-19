const db = require('../db');
const { generateNewFortune } = require('../services/fortuneService');

const handleFormRegistration = async (req, res) => {
    // 从请求体中解构出所有表单数据
    const { nfcUid, name, gender, birthdate, wechat_id, bio, is_matchable } = req.body;

    if (!nfcUid || !name || !gender || !wechat_id) {
        return res.status(400).json({ error: 'Required fields are missing.' });
    }

    try {
        // 1. 将新用户信息插入数据库
        const insertUserQuery = `
            INSERT INTO users (name, gender, birthdate, wechat_id, bio, is_matchable, nfc_uid, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')
            RETURNING *;
        `;
        const { rows: [newUser] } = await db.query(insertUserQuery, [
            name, gender, birthdate, wechat_id, bio, is_matchable, nfcUid
        ]);

        // 2. 更新手环状态
        await db.query("INSERT INTO bracelets (nfc_uid, status) VALUES ($1, 'active') ON CONFLICT (nfc_uid) DO UPDATE SET status = 'active'", [nfcUid]);
        console.log(`新用户 ${newUser.name} (NFC: ${nfcUid}) 已通过表单注册并激活。`);

        // 3. 为新用户生成首日运势和匹配
        const fortuneMessage = await generateNewFortune(newUser);

        // 4. 返回成功响应和运势消息
        res.status(201).json({
            message: "注册成功！",
            fortune: fortuneMessage
        });

    } catch (error) {
        console.error('Registration failed:', error);
        // 可能是微信号重复等数据库唯一性约束错误
        if (error.code === '23505') { // Unique violation
            return res.status(409).json({ error: '该微信号已被注册。' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { handleFormRegistration };