import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '@/contexts/authContext';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';

export default function AdminLogin() {
  const { setIsAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // 模拟管理员登录 - 实际项目中应该有真实的认证
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 模拟登录验证 (实际项目中应该连接后端API)
    if (username === 'admin' && password === 'admin123') {
      setIsAuthenticated(true);
      navigate('/admin');
    } else {
      setError('用户名或密码不正确');
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transform transition-all duration-500 hover:shadow-2xl ${theme === 'night' ? 'border border-blue-900/50' : ''}`}>
          <div className="p-6 md:p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/50 mb-4">
                <i className="fa-solid fa-user-secret text-2xl text-blue-600 dark:text-blue-400"></i>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">管理员登录</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">请输入管理员账号和密码</p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  用户名
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fa-solid fa-user text-gray-400"></i>
                  </div>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                    placeholder="输入管理员用户名"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  密码
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fa-solid fa-lock text-gray-400"></i>
                  </div>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                    placeholder="输入管理员密码"
                    required
                  />
                </div>
              </div>
              
              <div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center"
                >
                  <i className="fa-solid fa-sign-in-alt mr-2"></i>
                  登录
                </button>
              </div>
            </form>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <Link
                to="/"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
              >
                <i className="fa-solid fa-arrow-left mr-1"></i> 返回首页
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
