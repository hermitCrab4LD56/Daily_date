// 文件路径: apps/server/seed.js
// 运行命令: node seed.js
const db = require('./db');
const { generateNewFortune } = require('./services/fortuneService'); // 我们将重构 fortuneService

const initialUsers = [
    // 在这里填入 20 名用户的基本信息 (name, gender, birthdate, wechat_id, bio)
    // 为节省篇幅，这里只示例 4 个
    { name: 'Alice', gender: '女', birthdate: '1995-03-15', wechat_id: 'alice_wx', bio: '爱幻想的画家。' },
    { name: 'Bob', gender: '男', birthdate: '1992-07-22', wechat_id: 'bob_wx', bio: '资深程序员，喜欢徒步。' },
    { name: 'Cathy', gender: '女', birthdate: '1998-11-01', wechat_id: 'cathy_wx', bio: '音乐剧爱好者。' },
    { name: 'David', gender: '男', birthdate: '1994-05-30', wechat_id: 'david_wx', bio: '健身狂人，热爱生活。' },
    { name: 'Eva', gender: '女', birthdate: '1997-09-05', wechat_id: 'eva_wx', bio: '热爱烘焙的甜点师。' },
    { name: 'Frank', gender: '男', birthdate: '1993-02-18', wechat_id: 'frank_wx', bio: '沉迷于黑胶唱片的复古青年。' },
    { name: 'Grace', gender: '女', birthdate: '1999-06-25', wechat_id: 'grace_wx', bio: '一位停不下来的旅行探险家。' },
    { name: 'Henry', gender: '男', birthdate: '1991-12-12', wechat_id: 'henry_wx', bio: '业余的天文摄影师。' },
    { name: 'Ivy', gender: '女', birthdate: '1996-08-20', wechat_id: 'ivy_wx', bio: '梦想开一家猫咪咖啡馆。' },
    { name: 'Jack', gender: '男', birthdate: '1995-10-14', wechat_id: 'jack_wx', bio: '喜欢研究历史的博物馆常客。' },
    { name: 'Lily', gender: '女', birthdate: '2000-01-28', wechat_id: 'lily_wx', bio: '刚刚毕业的插画师。' },
    { name: 'Max', gender: '男', birthdate: '1997-04-03', wechat_id: 'max_wx', bio: '城市滑板爱好者。' },
    { name: 'Nina', gender: '女', birthdate: '1994-07-19', wechat_id: 'nina_wx', bio: '瑜伽教练，相信身心合一。' },
    { name: 'Oscar', gender: '男', birthdate: '1993-09-01', wechat_id: 'oscar_wx', bio: '一位追求极简主义的设计师。' },
    { name: 'Penny', gender: '女', birthdate: '1998-04-17', wechat_id: 'penny_wx', bio: '喜欢在午后读诗。' },
    { name: 'Quinn', gender: '男', birthdate: '1996-03-29', wechat_id: 'quinn_wx', bio: '热衷于解谜和密室逃脱。' },
    { name: 'Ruby', gender: '女', birthdate: '1992-11-23', wechat_id: 'ruby_wx', bio: '经营一家线上花店。' },
    { name: 'Sam', gender: '男', birthdate: '1990-08-07', wechat_id: 'sam_wx', bio: '享受在深夜独自看电影。' },
    { name: 'Tina', gender: '女', birthdate: '1997-02-11', wechat_id: 'tina_wx', bio: '一位充满活力的街舞舞者。' },
    { name: 'Victor', gender: '男', birthdate: '1995-06-06', wechat_id: 'victor_wx', bio: '喜欢自己动手做木工。' }
];

const seedDatabase = async () => {
    console.log('开始填充初始数据...');

    // 1. 插入用户和手环信息
    for (const userData of initialUsers) {
        const nfcUid = `NFC-SEED-${Math.random().toString(16).slice(2)}`;
        
        await db.query("INSERT INTO bracelets (nfc_uid, status) VALUES ($1, 'active')", [nfcUid]);
        
        const { rows: [user] } = await db.query(
            "INSERT INTO users (name, gender, birthdate, wechat_id, bio, nfc_uid, status) VALUES ($1, $2, $3, $4, $5, $6, 'active') RETURNING *",
            [userData.name, userData.gender, userData.birthdate, userData.wechat_id, userData.bio, nfcUid]
        );
        
        console.log(`用户 ${user.name} (NFC: ${nfcUid}) 已创建。`);

        // 2. 为每个用户生成初始运势和匹配
        await generateNewFortune(user);
    }

    console.log('数据填充完毕！');
    process.exit();
};

seedDatabase().catch(err => {
    console.error('填充数据时发生错误:', err);
    process.exit(1);
});