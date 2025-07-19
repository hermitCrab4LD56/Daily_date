// 文件路径: apps/client/src/pages/Registration.tsx
import React, { useState  } from 'react';
import { motion } from 'framer-motion';

interface RegistrationPageProps {
  nfcUid: string | null;
    // 当注册成功后，调用此函数通知 App.tsx 切换视图
  onRegistrationSuccess: () => void;
}

const RegistrationPage: React.FC<RegistrationPageProps> = ({ nfcUid, onRegistrationSuccess }) => {
  // 使用 state 管理所有表单字段
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'男' | '女' | ''>('');
  const [birthdate, setBirthdate] = useState('');
  const [wechatId, setWechatId] = useState('');
  const [bio, setBio] = useState('');
  const [isMatchable, setIsMatchable] = useState(true); // 默认为 true
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !gender || !wechatId || !nfcUid) {
      setError('姓名、性别和微信号为必填项。');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nfcUid,
          name,
          gender,
          birthdate,
          wechat_id: wechatId,
          bio,
          is_matchable: isMatchable,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || '注册失败，请稍后再试。');
      }
      
      // 注册成功
      alert('注册成功！即将为你展示今日运势。');
      onRegistrationSuccess();

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 样式（与您的示意图对齐）
  const inputClass = "w-full p-3 border border-gray-300 rounded-full text-center focus:ring-2 focus:ring-blue-400 focus:outline-none";
  const buttonClass = "p-3 border rounded-full w-24 text-gray-700";
  const selectedButtonClass = "bg-gray-800 text-white border-gray-800";

  return (
    <div className="p-6 max-w-sm mx-auto bg-white font-sans">
      <div className="text-center mb-8">
        <p className="text-lg text-gray-800">嘿，我是DD，可以让我更了解你嘛！这样我可以为你打开一个有趣的世界哦～</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 表单项 */}
        <div><input type="text" placeholder="姓名" value={name} onChange={e => setName(e.target.value)} className={inputClass} /></div>
        
        <div className="flex justify-center space-x-4">
          <button type="button" onClick={() => setGender('男')} className={`${buttonClass} ${gender === '男' && selectedButtonClass}`}>男</button>
          <button type="button" onClick={() => setGender('女')} className={`${buttonClass} ${gender === '女' && selectedButtonClass}`}>女</button>
        </div>
        
        {/* 生日选择器，此处用 input[type=date] 简化 */}
        <div><input type="date" placeholder="生日" value={birthdate} onChange={e => setBirthdate(e.target.value)} className={inputClass} /></div>
        <div><input type="text" placeholder="微信号" value={wechatId} onChange={e => setWechatId(e.target.value)} className={inputClass} /></div>
        <div><textarea placeholder="三句话自我介绍" value={bio} onChange={e => setBio(e.target.value)} className="w-full p-4 border border-gray-300 rounded-3xl text-center h-32 resize-none focus:ring-2 focus:ring-blue-400 focus:outline-none"></textarea></div>

        {/* 推荐选项 */}
        <div className="flex items-center justify-center cursor-pointer" onClick={() => setIsMatchable(!isMatchable)}>
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-2 ${isMatchable ? 'border-green-500 bg-green-500' : 'border-gray-400'}`}>
            {isMatchable && <span className="text-white">✔</span>}
          </div>
          <span className="text-gray-600">可以把你推荐给其他小伙伴</span>
        </div>
        
        {error && <p className="text-red-500 text-center">{error}</p>}

        {/* 提交按钮 */}
        <motion.button 
          whileTap={{ scale: 0.95 }}
          type="submit" 
          disabled={isLoading}
          className="w-full p-3 border-2 border-cyan-400 text-cyan-400 bg-white rounded-full font-bold text-lg hover:bg-cyan-50 disabled:bg-gray-200"
        >
          {isLoading ? '提交中...' : '确认提交'}
        </motion.button>
      </form>
    </div>
  );
};

export default RegistrationPage;