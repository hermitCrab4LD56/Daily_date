// 文件路径: apps/client/src/components/Chat/index.tsx

import React, { useEffect, useRef } from 'react';
import type { Message } from '../../hooks/useChat'; // 复用 Message 类型
import { motion } from 'framer-motion'; // 引入 Framer Motion

// 定义组件 Props 类型
interface ChatProps {
  msgs: Message[];
  send: (text: string) => void;
  isLoading: boolean;
}

// 消息气泡子组件
const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
  const isUser = message.role === 'user';
  // 使用 TailwindCSS 定义样式
  const bubbleClasses = isUser
    ? 'bg-blue-500 text-white self-end'
    : 'bg-gray-200 text-gray-800 self-start';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`max-w-xs md:max-w-md w-fit p-3 rounded-lg my-1 shadow-sm ${bubbleClasses}`}
    >
      {/* 使用 pre-wrap 来保留换行符 */}
      <p className="text-left" style={{ whiteSpace: 'pre-wrap' }}>{message.text}</p>
    </motion.div>
  );
};

// Chat 主组件
export const Chat: React.FC<ChatProps> = ({ msgs, send, isLoading }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 每次消息列表更新时，自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = e.currentTarget.message as HTMLInputElement;
    const text = input.value;
    if (text) {
      send(text);
      input.value = ''; // 发送后清空输入框
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 font-sans">
      {/* 消息列表区域 */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col space-y-2">
        {msgs.map((msg, index) => (
          <MessageBubble key={index} message={msg} />
        ))}
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="text-gray-500 self-start p-3">正在输入...</div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入框区域 */}
      <div className="p-4 border-t bg-white shadow-inner">
        <form onSubmit={handleSubmit} className="flex items-center space-x-3">
          <input
            name="message"
            type="text"
            placeholder="输入消息..."
            disabled={isLoading}
            autoComplete="off"
            className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow disabled:bg-gray-200"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {/* 发送图标 (SVG) */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};