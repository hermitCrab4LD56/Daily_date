// 文件路径: apps/client/src/App.tsx

import React, { useEffect, useState } from 'react';
import { Chat } from '../components/Chat';
import { useChat } from '../hooks/useChat';

function App(): React.JSX.Element {
  // 使用一个 state 来存储从 URL 获取的 nfcUid
  const [nfcUid, setNfcUid] = useState<string | null>(null);

  // 直接在顶层组件使用钩子，管理所有状态和逻辑
  const { msgs, send, isLoading, setMsgs } = useChat(nfcUid);

  // 使用 useEffect 来处理 URL 参数和触发欢迎消息的副作用
  useEffect(() => {
    // 1. 从 URLSearchParams 解析 nfcUid
    const uidFromUrl = new URLSearchParams(window.location.search).get('nfcUid');

    if (uidFromUrl) {
      setNfcUid(uidFromUrl); // 设置 nfcUid，以便后续 send 函数可以携带它

      // 2. 检查本地是否已有聊天记录，如果没有，则发送欢迎消息
      const existingState = localStorage.getItem('chat_state');
      const hasHistory = existingState && JSON.parse(existingState).length > 0;
      
      if (!hasHistory) {
        // 3. 使用从钩子中获取的 setMsgs 来添加第一条 bot 消息
        setMsgs([
          {
            role: 'bot',
            text: '有邀请码就发，没有我来问几个问题～'
          }
        ]);
      }
    }
  // 空依赖数组 [] 确保这个 effect 只在组件首次挂载时运行一次
  }, [setMsgs]);

  return (
    // 将状态和方法作为 props 传递给纯 UI 的 Chat 组件
    <Chat 
      msgs={msgs} 
      send={send} 
      isLoading={isLoading} 
    />
  );
}

export default App;