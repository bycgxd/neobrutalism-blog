import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:3001/api/auth/login', { username, password });
      localStorage.setItem('adminToken', res.data.token);
      navigate('/admin/dashboard');
    } catch (err: any) {
      if (err.response?.status === 401) {
        // Try to setup if no admin exists (for demo purposes)
        try {
          await axios.post('http://localhost:3001/api/auth/setup', { username, password });
          const res = await axios.post('http://localhost:3001/api/auth/login', { username, password });
          localStorage.setItem('adminToken', res.data.token);
          navigate('/admin/dashboard');
          return;
        } catch (setupErr) {
          setError('登录失败，请检查账号密码');
        }
      }
      setError('登录失败，请检查账号密码');
    }
  };

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 halftone-bg opacity-10 pointer-events-none" />
      
      <div className="comic-panel bg-white p-8 w-full max-w-md relative z-10 rotate-1">
        <h2 className="text-4xl font-comic italic uppercase mb-8 text-center">
          后台<span className="text-comic-red">管理</span>
        </h2>
        
        {error && (
          <div className="bg-comic-red text-white p-3 mb-6 font-bold border-4 border-black rotate-[-1deg]">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block font-black text-xl mb-2 uppercase">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border-4 border-black p-3 font-bold focus:outline-none focus:ring-4 focus:ring-comic-blue"
              required
            />
          </div>
          <div>
            <label className="block font-black text-xl mb-2 uppercase">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-4 border-black p-3 font-bold focus:outline-none focus:ring-4 focus:ring-comic-blue"
              required
            />
          </div>
          
          <button type="submit" className="comic-button w-full bg-comic-blue text-white mt-4 text-xl">
            登录系统
          </button>
        </form>
        <p className="mt-4 text-sm font-bold text-gray-500 text-center">首次登录将自动创建该账号作为管理员</p>
      </div>
    </div>
  );
}