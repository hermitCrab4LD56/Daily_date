// File: apps/server/controllers/registerController.js

const db = require('../db');
const { generateNewFortune } = require('../services/fortuneService');

const handleFormRegistration = async (req, res) => {
    const { nfcUid, name, gender, birthdate, wechat_id, bio, is_matchable } = req.body;

    if (!nfcUid || !name || !gender || !wechat_id) {
        return res.status(400).json({ error: '请填写必填项！' });
    }

    try {
        // Step 1: First, create the record in the 'bracelets' table.
        // This ensures the foreign key will exist for the 'users' table.
        await db.query(
            "INSERT INTO bracelets (nfc_uid, status) VALUES ($1, 'active') ON CONFLICT (nfc_uid) DO UPDATE SET status = 'active'",
            [nfcUid]
        );

        // Step 2: Now, create the new user, which references the bracelet.
        const insertUserQuery = `
            INSERT INTO users (name, gender, birthdate, wechat_id, bio, is_matchable, nfc_uid, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')
            RETURNING *;
        `;
        const { rows: [newUser] } = await db.query(insertUserQuery, [
            name, gender, birthdate, wechat_id, bio, is_matchable, nfcUid
        ]);
        
        console.log(`New user ${newUser.name} (NFC: ${nfcUid}) has been registered and activated via form.`);

        // Step 3: Generate the user's first fortune and match.
        const fortuneMessage = await generateNewFortune(newUser);

        // Step 4: Return a successful response.
        res.status(201).json({
            message: "Registration successful!",
            fortune: fortuneMessage
        });

    } catch (error) {
        console.error('Registration failed:', error);
        if (error.code === '23505') { // Unique violation
            return res.status(409).json({ error: '该微信号已被注册过！' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { handleFormRegistration };