// 文件路径: apps/server/services/fortuneService.js (最终修复版)

const db = require('../db');
const { ZhipuAI } = require('zhipuai');
// 从 undici 库中导入 fetch 函数
const { fetch } = require('undici');

// --- 核心修复点 ---
// 在初始化 ZhipuAI 客户端时，手动传入 fetch 实现
const client = new ZhipuAI({
  apiKey: process.env.ZHIPU_API_KEY,
  fetch: fetch, // 将导入的 fetch 函数注入到 SDK 中
});


// --- 辅助函数 1: 调用 LLM 生成消息 (现在使用修复后的 SDK client) ---
const getFortuneFromLLM = async (user1, user2) => {
    console.log(`[SDK] 正在为 ${user1.name} 和 ${user2.name} 生成专属欢迎语...`);
    
    const prompt = `
      你是一个充满创意和善意的社交 App 智能助手，名叫 DD。
      你的任务是为两位刚刚被系统匹配到的用户生成一段温暖、有趣、且个性化的欢迎语。

      这是两位用户的信息：
      - 主用户 (User 1): { "name": "${user1.name}", "gender": "${user1.gender}", "bio": "${user1.bio}" }
      - 匹配用户 (User 2): { "name": "${user2.name}", "gender": "${user2.gender}", "bio": "${user2.bio}" }

      请严格按照以下要求和格式输出：
      1.  欢迎语必须包含两部分，并用 "|||" 作为唯一分隔符。
      2.  第一部分：直接对主用户 User 1 的问候，必须在问候中提到匹配用户 User 2 的名字。
      3.  第二部分：一段巧妙结合两人 "bio" (自我介绍) 的共同欢迎语，要显得自然、真诚，并鼓励他们开启对话。
      4.  风格要求：温暖、积极、略带文采，避免尴尬和陈词滥调。
      5.  输出格式：严格遵循 "第一部分的问候|||第二部分的共同欢迎语" 的格式，不要添加任何其他无关的文字或解释。
    `;

    try {
        // 使用我们修复后的 client 实例
        const response = await client.chat.completions.create({
            model: "glm-3-turbo",
            messages: [{ "role": "user", "content": prompt }],
        });

        const llmResult = response.choices[0].message.content;
        console.log(`[SDK] 收到模型返回结果: ${llmResult}`);

        if (llmResult && llmResult.includes('|||')) {
            const parts = llmResult.split('|||');
            return `${parts[0].trim()}\n\n${parts[1].trim()}`;
        } else {
            throw new Error('LLM response format is invalid.');
        }
    } catch (error) {
        console.error("[SDK] 调用智谱 AI API 失败:", error);
        // Fallback
        const greeting = `你好，${user1.name}！今天为你匹配到同样热爱生活的 ${user2.name}。`;
        const welcome = `“${user1.bio}”\n与\n“${user2.bio}”\n\n你们的相遇，如同代码与诗篇的碰撞，愿你们都能从中发现新的乐趣。`;
        return `${greeting}\n\n${welcome}`;
    }
};

// --- 辅助函数 2: 查找匹配用户 (包含最新算法) ---
const findMatchForUser = async (user) => {
  const query = `
    SELECT u.id, u.name, u.gender, u.bio
    FROM users u
    WHERE
      u.id != $1
      AND u.status = 'active'
      AND u.is_matchable = true
      AND u.id NOT IN (
        SELECT user2_id FROM matches WHERE user1_id = $1 AND matched_at > NOW() - INTERVAL '14 days'
        UNION
        SELECT user1_id FROM matches WHERE user2_id = $1 AND matched_at > NOW() - INTERVAL '14 days'
      )
    ORDER BY
      CASE
        WHEN u.gender != $2 THEN 1
        ELSE 2
      END,
      RANDOM()
    LIMIT 1;
  `;
  const { rows } = await db.query(query, [user.id, user.gender]);
  return rows[0];
};

// --- 辅助函数 3: 在 matches 表中记录一次新的匹配 ---
const recordMatch = async (userId1, userId2) => {
    const [u1, u2] = [userId1, userId2].sort((a, b) => a - b);
    
    const query = `
        INSERT INTO matches (user1_id, user2_id, matched_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT (user1_id, user2_id) DO UPDATE
        SET matched_at = NOW();
    `;
    await db.query(query, [u1, u2]);
    console.log(`已记录用户 ${userId1} 和 ${userId2} 的新匹配。`);
};

// --- 主函数：生成新的匹配和运势消息 (唯一需要导出的函数) ---
const generateNewFortune = async (user) => {
    console.log(`为用户 ${user.id} (${user.name}) 生成新运势...`);
    const match = await findMatchForUser(user);
    
    if (!match) {
        console.log(`未找到用户 ${user.id} 的匹配。`);
        const soloMessage = `你好，${user.name}。今日的世界静悄悄，适合与自己对话，期待明日的缘分吧。`;
        await db.query("UPDATE users SET last_fortune_message = $1, last_fortune_at = NOW() WHERE id = $2", [soloMessage, user.id]);
        return soloMessage;
    }

    // 记录本次匹配，替代了旧的 setUsersCooldown
    await recordMatch(user.id, match.id);
    
    // 调用 LLM 生成欢迎语
    const fortuneMessage = await getFortuneFromLLM(user, match);
    
    // 将生成的消息和时间存入数据库
    await db.query("UPDATE users SET last_fortune_message = $1, last_fortune_at = NOW() WHERE id = $2", [fortuneMessage, user.id]);
    
    console.log(`为用户 ${user.id} 生成新消息完毕。`);
    return fortuneMessage;
};

module.exports = { generateNewFortune };