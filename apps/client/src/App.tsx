// 文件路径: apps/client/src/App.tsx
import React, { useState, useEffect,useCallback } from 'react';
import RegistrationPage from './pages/Registration';
import FortunePage from './pages/Fortune';

function App(): React.JSX.Element {
  const [userStatus, setUserStatus] = useState<'loading' | 'new' | 'existing' | 'invalid'>('loading');
  const [nfcUid, setNfcUid] = useState<string | null>(null);

  // 使用 useCallback 封装状态检查逻辑，方便复用
  const checkUserStatus = useCallback(async (uid: string) => {
    setUserStatus('loading');
    try {
      const response = await fetch(`/api/fortune?nfcUid=${uid}`);

      // Case 1: 用户不存在，后端返回 404
      if (response.status === 404) {
        setUserStatus('new');
        return;
      }

      // Case 2: 其他非成功状态码（例如 500 Internal Server Error）
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }

      // Case 3: 成功，但需要验证响应体是否为 JSON
      // 克隆响应，因为 .json() 会消耗响应体
      const responseClone = response.clone();
      try {
        await responseClone.json(); // 尝试解析
        setUserStatus('existing'); // 解析成功，是老用户
      } catch (jsonError) {
        // 解析失败，说明返回的不是 JSON（可能是 HTML 错误页）
        console.error("API response was not valid JSON.", jsonError);
        setUserStatus('new'); // 将其视为新用户，引导至注册页
      }
    } catch (err) {
      console.error("Failed to fetch user status:", err);
      setUserStatus('new'); // 网络错误等，也引导至注册页
    }
  }, []);

   useEffect(() => {
    const uidFromUrl = new URLSearchParams(window.location.search).get('nfcUid');
    if (uidFromUrl) {
      setNfcUid(uidFromUrl);
      checkUserStatus(uidFromUrl);
    } else {
      setUserStatus('invalid'); // 或显示错误页
    }
  }, [checkUserStatus]);

  // 核心改动：注册成功后的处理函数
  const handleRegistrationSuccess = () => {
    if (nfcUid) {
      checkUserStatus(nfcUid);
    }
  };


  if (userStatus === 'loading') {
    return <div className="text-center p-10">正在加载...</div>;
  }
  
  // 新增：渲染引导/错误页面
  if (userStatus === 'invalid') {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 text-center p-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">访问方式不正确</h1>
          <p className="text-gray-600 mt-2">请通过 NFC 手环触碰来访问此页面。</p>
        </div>
      </div>
    );
  }

  // 将 handleRegistrationSuccess 函数作为 prop 传递下去
  if (userStatus === 'new') {
    return <RegistrationPage nfcUid={nfcUid} onRegistrationSuccess={handleRegistrationSuccess} />;
  }

  return <FortunePage nfcUid={nfcUid} />;
}

export default App;