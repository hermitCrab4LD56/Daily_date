// 文件路径: apps/server/services/fortuneService.js
const db = require('../db');

// 模拟调用 LLM
const getFortuneFromLLM = async (user1, user2) => {
    console.log(`正在为 ${user1.name} 和 ${user2.name} 生成专属欢迎语...`);
    // TODO: 实际项目中，这里是调用 LLM API 的地方
    const greetingForUser1 = `你好，${user1.name}！今天为你匹配到同样热爱生活的 ${user2.name}。`;
    const sharedWelcome = `“${user1.bio}”\n与\n“${user2.bio}”\n\n你们的相遇，如同代码与诗篇的碰撞，愿你们都能从中发现新的乐趣。`;
    return `${greetingForUser1}\n\n${sharedWelcome}`;
};

// 新代码 - 优化后的匹配算法
const findMatchForUser = async (user) => {
  const query = `
    SELECT id, name, gender, bio
    FROM users
    WHERE 
      id != $1 -- 排除用户本人
      AND (cooled_until IS NULL OR cooled_until < NOW()) -- 排除正在冷却期的用户
      AND status = 'active' -- 只匹配活跃用户
      AND is_matchable = true -- 核心改动：只从同意被推荐的用户中匹配
    ORDER BY
      CASE
        WHEN gender != $2 THEN 1 -- 异性，优先级最高
        ELSE 2 -- 同性，优先级次之
      END,
      RANDOM() -- 在每个优先级内部，进行随机排序
    LIMIT 1; -- 只取最终排序结果的第一个
  `;
  // 注意：参数现在有两个，id 和 gender
  const { rows } = await db.query(query, [user.id, user.gender]);
  return rows[0];
};

const setUsersCooldown = async (userId1, userId2) => {
    const cooledUntil = new Date();
    cooledUntil.setDate(cooledUntil.getDate() + 14);
    await db.query("UPDATE users SET cooled_until = $1 WHERE id = $2 OR id = $3", [cooledUntil, userId1, userId2]);
};

// 核心函数：为指定用户生成新的匹配和运势消息
const generateNewFortune = async (user) => {
    console.log(`为用户 ${user.id} 生成新运势...`);
    const match = await findMatchForUser(user);
    if (!match) {
        console.log(`未找到用户 ${user.id} 的匹配。`);
        const soloMessage = `你好，${user.name}。今日的世界静悄悄，适合与自己对话，期待明日的缘分吧。`;
        await db.query("UPDATE users SET last_fortune_message = $1, last_fortune_at = NOW() WHERE id = $2", [soloMessage, user.id]);
        return soloMessage;
    }

    await setUsersCooldown(user.id, match.id);
    const fortuneMessage = await getFortuneFromLLM(user, match);
    
    // 将生成的消息和时间存入数据库
    await db.query("UPDATE users SET last_fortune_message = $1, last_fortune_at = NOW() WHERE id = $2", [fortuneMessage, user.id]);
    
    console.log(`为用户 ${user.id} 生成新消息完毕。`);
    return fortuneMessage;
};

module.exports = { generateNewFortune };