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

// 在 useChat 函数定义中，增加一个 apiUrl 参数
export function useChat(nfcUid: string | null, apiUrl: string): UseChatReturn {
  const [msgs, setMsgs] = useState<Message[]>([]); // 注册流程不从 localStorage 加载

  const [isLoading, setIsLoading] = useState(false);

  const send = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = { role: 'user', text };
    const updatedMsgs = [...msgs, userMessage];
    setMsgs(updatedMsgs);
    setIsLoading(true);

    try {
      // 使用传入的 apiUrl 参数
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nfcUid, text }),
      });

      if (!response.ok) throw new Error('API request failed');

      const resData = await response.json();
      const botMessage: Message = { role: 'bot', text: resData.text }; // 假设后端返回 text 字段
      setMsgs(prev => [...prev, botMessage]);

      if (resData.done) {
        // 注册完成后的处理，例如跳转
        console.log('Registration complete!');
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage: Message = { role: 'bot', text: '抱歉，网络出了一点小问题，请稍后再试。' };
      setMsgs(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [msgs, nfcUid, apiUrl, setMsgs]);

  return { msgs, send, isLoading, setMsgs };
}