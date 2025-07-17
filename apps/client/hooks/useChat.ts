// 文件路径: apps/client/src/hooks/useChat.ts

import { useState, useCallback } from 'react';

// 定义消息对象的接口
export interface Message {
  role: 'user' | 'bot';
  text: string;
}

// 定义 useChat 钩子返回值的接口
export interface UseChatReturn {
  msgs: Message[];
  send: (text: string) => Promise<void>;
  isLoading: boolean;
  setMsgs: React.Dispatch<React.SetStateAction<Message[]>>;
}

export function useChat(nfcUid: string | null): UseChatReturn {
  // 1. 状态管理：从 localStorage 初始化，实现持久化
  const [msgs, setMsgs] = useState<Message[]>(() => {
    try {
      const savedState = localStorage.getItem('chat_state');
      return savedState ? JSON.parse(savedState) : [];
    } catch (error) {
      console.error("Failed to parse chat_state from localStorage", error);
      return [];
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  // 2. 发送消息函数
  const send = useCallback(async (text: string) => {
    if (!text.trim()) return;

    // a. 乐观更新用户消息
    const userMessage: Message = { role: 'user', text };
    const updatedMsgs = [...msgs, userMessage];
    setMsgs(updatedMsgs);
    localStorage.setItem('chat_state', JSON.stringify(updatedMsgs));
    setIsLoading(true);

    try {
      // b. 调用后端 API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nfcUid, text }), // 携带 nfcUid 和用户输入
      });

      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
      }

      const resData = await response.json(); // 例如 { text: "...", done: false }

      // c. 更新机器人回复
      const botMessage: Message = { role: 'bot', text: resData.text };
      const finalMsgs = [...updatedMsgs, botMessage];
      setMsgs(finalMsgs);
      localStorage.setItem('chat_state', JSON.stringify(finalMsgs));

      // d. 如果流程结束，清空本地存储
      if (resData.done) {
        setTimeout(() => localStorage.removeItem('chat_state'), 1000);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage: Message = { role: 'bot', text: '抱歉，网络出了一点小问题，请稍后再试。' };
      const msgsWithError = [...updatedMsgs, errorMessage];
      setMsgs(msgsWithError);
      localStorage.setItem('chat_state', JSON.stringify(msgsWithError));
    } finally {
      setIsLoading(false);
    }
  }, [msgs, nfcUid]);

  return { msgs, send, isLoading, setMsgs };
}