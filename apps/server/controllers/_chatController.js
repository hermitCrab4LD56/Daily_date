// 文件路径: apps/server/controllers/chatController.js
const db = require('../db');
const { generateFirstFortune } = require('../services/fortuneService');

// 注册流程的问题和步骤定义
const registrationFlow = {
  start: {
    question: "你好！很高兴认识你。为了更好地为你匹配，我需要了解你的一些信息。\n\n首先，你的名字是？",
    nextStep: "awaiting_name"
  },
  awaiting_name: {
    nextQuestion: "收到了！你的性别是？(男/女)",
    nextStep: "awaiting_gender",
    column: "name"
  },
  awaiting_gender: {
    nextQuestion: "好的。你的生日是？(格式：YYYY-MM-DD)",
    nextStep: "awaiting_birthdate",
    column: "gender"
  },
  awaiting_birthdate: {
    nextQuestion: "嗯，记住你的生日了。你的微信ID是？(方便福缘联系你)",
    nextStep: "awaiting_wechat_id",
    column: "birthdate"
  },
  awaiting_wechat_id: {
    nextQuestion: "最后一步，请用三句以内的话介绍一下自己吧！(这将作为你的福缘名片展示)",
    nextStep: "awaiting_bio",
    column: "wechat_id"
  },
  awaiting_bio: {
    nextQuestion: null, // 最后一步，没有下一个问题
    nextStep: "completed",
    column: "bio"
  }
};

// 激活用户并关联 nfcUid
const activateUser = async (userId, nfcUid) => {
    // 1. 将用户信息与手环 nfcUid 绑定
    //    注意：我们将 ::jsonb 移到了 SQL 字符串内部
    await db.query('UPDATE users SET nfc_uid = $1, status = $2, chat_state = $3::jsonb WHERE id = $4', [nfcUid, 'active', '{}', userId]);
    // 2. 更新手环状态为已激活
    await db.query("UPDATE bracelets SET status = 'active' WHERE nfc_uid = $1", [nfcUid]);
    console.log(`用户 ${userId} 已成功激活，并绑定到 NFC UID: ${nfcUid}`);
    // 3. 返回完整的用户信息
    const { rows } = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
    return rows[0];
};

const handleChat = async (req, res) => {
  const { nfcUid, text } = req.body;

  if (!nfcUid) {
    return res.status(400).json({ error: 'nfcUid is required' });
  }

  // 1. 查找或创建与 nfcUid 关联的用户记录
  //    这里简化处理：假设手环记录已存在，我们查找或创建 user 记录
  let { rows: [user] } = await db.query('SELECT * FROM users WHERE nfc_uid = $1', [nfcUid]);

  // 如果用户已激活，直接返回提示
  if (user && user.status === 'active') {
      return res.json({ text: "你已经激活过了，请期待明天的日运吧！", done: true });
  }
  
  // 如果用户记录不存在，则创建一个临时的
  if (!user) {
      const { rows: [newUser] } = await db.query(
        "INSERT INTO users (chat_state) VALUES ($1) RETURNING *",
        [{ step: 'awaiting_start' }]
      );
      user = newUser;
  }
  
  // ----------------- 分支逻辑开始 -----------------

  // 分支①：处理邀请码 (简化逻辑)
  if (text.startsWith("INVITE_")) {
    console.log(`收到邀请码 ${text}，开始验证...`);
    // 在真实项目中，这里会有一套复杂的邀请码验证逻辑
    // 此处简化为：只要是 INVITE_ 开头就认为成功
    const activatedUser = await activateUser(user.id, nfcUid);
    const fortuneResponse = await generateFirstFortune(activatedUser);
    return res.json(fortuneResponse);
  }

  // 分支②：处理注册问答流程
  const currentStep = user.chat_state.step;

  // 用户回复“没有”，开始注册
  if (currentStep === 'awaiting_start' && text.toLowerCase().includes('没有')) {
    const firstQuestion = registrationFlow.start;
    await db.query('UPDATE users SET chat_state = $1 WHERE id = $2', [{ step: firstQuestion.nextStep }, user.id]);
    return res.json({ text: firstQuestion.question, done: false });
  }

  // 处理问答流程中的每一步
  const stepConfig = registrationFlow[currentStep];
  if (stepConfig && stepConfig.nextStep) {
    // a. 保存用户的回答
    const columnToUpdate = stepConfig.column;
    if (columnToUpdate) {
        await db.query(`UPDATE users SET ${columnToUpdate} = $1 WHERE id = $2`, [text, user.id]);
    }

    // b. 检查是否是最后一步
    if (stepConfig.nextStep === "completed") {
        console.log("注册信息收集完毕，开始激活...");
        const activatedUser = await activateUser(user.id, nfcUid);
        const fortuneResponse = await generateFirstFortune(activatedUser);
        return res.json(fortuneResponse);
    } else {
        // c. 不是最后一步，更新状态并提出下一个问题
        await db.query('UPDATE users SET chat_state = $1 WHERE id = $2', [{ step: stepConfig.nextStep }, user.id]);
        return res.json({ text: stepConfig.nextQuestion, done: false });
    }
  }

  // 默认回复
  res.json({ text: "嗯？我不太明白你的意思，可以再说一遍吗？", done: false });
};

module.exports = { handleChat };