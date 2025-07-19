// 文件路径: apps/client/src/pages/Fortune.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// 只读消息气泡
const ReadOnlyBubble: React.FC<{ text: string }> = ({ text }) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white p-4 rounded-lg shadow-md my-2"
    >
        {/* <-- 改动：为 p 标签添加文字颜色 */}
        <p className="text-gray-800" style={{ whiteSpace: 'pre-wrap' }}>{text}</p>
    </motion.div>
);

const FortunePage: React.FC<{ nfcUid: string | null }> = ({ nfcUid }) => {
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (nfcUid) {
            setIsLoading(true);
            setError('');
            fetch(`/api/fortune?nfcUid=${nfcUid}`)
                .then(async (res) => {
                    if (!res.ok) {
                        throw new Error(`无法获取运势，服务器状态: ${res.status}`);
                    }
                    // 尝试解析 JSON，如果失败则进入 .catch
                    return await res.json();
                })
                .then(data => {
                    if (data && data.message) {
                        setMessage(data.message);
                    } else {
                        throw new Error("收到的数据格式不正确。");
                    }
                })
                .catch(err => {
                    console.error("Error fetching fortune:", err);
                    setError(err.message || '加载您的专属消息时出错。');
                })
                .finally(() => setIsLoading(false));
        }
    }, [nfcUid]);

    // 根据不同状态显示不同内容
    let content;
    if (isLoading) {
        content = <p className="text-center text-gray-500">正在获取你的今日运势...</p>;
    } else if (error) {
        content = <ReadOnlyBubble text={`加载失败: ${error}`} />;
    } else {
        content = <ReadOnlyBubble text={message} />;
    }

    return (
        // --- CORE FIX: Added a container to constrain width and center the content ---
        <div className="max-w-sm mx-auto bg-gray-100 min-h-screen flex flex-col">
            <div className="flex-1 p-4">
                {content}
            </div>
            <div className="p-4">
                <div className="p-3 text-center text-gray-500 bg-gray-200 rounded-full">
                    对话功能暂未开放，敬请期待~
                </div>
            </div>
        </div>
    );
};

export default FortunePage;