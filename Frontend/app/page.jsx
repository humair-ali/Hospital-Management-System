'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/api';
import { toast } from 'react-toastify';
import { useUser } from '@/context/UserContext';
import { FaBriefcaseMedical, FaEnvelope, FaLock, FaCheckCircle } from 'react-icons/fa';
export default function HomePage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login: performLogin } = useUser();
  const router = useRouter();

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const result = await performLogin(email, password);
      if (result.success && result.user) {
        toast.success(`Successfully Login`, { autoClose: 1000 });
        router.push('/dashboard');
      } else {
        toast.error(result.error || 'Login failed');
        setLoading(false);
      }
    } catch (error) {
      toast.error(error.message || 'An error occurred during login');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] relative overflow-hidden font-sans">
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-[#f1f5f9] to-transparent"></div>
      <div className="w-full max-w-[440px] relative z-10 px-6 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3.5 bg-white rounded-3xl shadow-xl border border-gray-100 mb-6 transition-all hover:translate-y-[-4px] duration-500">
            <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-primary-600/30">
              <FaBriefcaseMedical className="text-white text-2xl" />
            </div>
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter leading-tight uppercase flex flex-col">
            <span className="text-primary-600 text-sm tracking-[0.4em] mb-2">Hospital Internal</span>
            HMS Enterprise
          </h1>
          <p className="text-gray-400 font-bold text-[10px] mt-4 tracking-[0.3em] uppercase opacity-70">Secured Clinical Portal • Node 01-HMS</p>
        </div>

        <div className="card-elevated p-8 md:p-10 border-t-[8px] border-t-primary-600 !border !border-primary-600/20 relative overflow-hidden bg-white">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2 opacity-50"></div>

          <div className="mb-10 text-center relative z-10">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Authentication</h2>
            <div className="h-1.5 w-12 bg-primary-600 mx-auto mt-3 rounded-full"></div>
            <p className="text-gray-400 text-[9px] font-black uppercase tracking-[0.3em] mt-4">Secure Personnel Portal</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6 relative z-10">
            <div className="space-y-6">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Email</label>
              <div className="input-with-icon-wrapper group">
                <div className="input-icon-container">
                  <FaEnvelope className="text-gray-400 group-focus-within:text-primary-600" />
                </div>
                <input
                  type="email"
                  className="input-field input-field-with-icon !h-14 bg-gray-50/50 focus:bg-white rounded-2xl border-gray-100"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="space-y-6">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Password</label>
              <div className="input-with-icon-wrapper group">
                <div className="input-icon-container">
                  <FaLock className="text-gray-400 group-focus-within:text-primary-600" />
                </div>
                <input
                  type="password"
                  className="input-field input-field-with-icon !h-14 bg-gray-50/50 focus:bg-white rounded-2xl border-gray-100"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary w-full !h-16 shadow-2xl shadow-primary-600/30 group overflow-hidden relative mt-4"
              disabled={loading}
            >
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-[3px] border-white/20 border-t-white"></div>
                  <span className="text-sm uppercase tracking-[0.2em] font-black">Connecting...</span>
                </div>
              ) : (
                <div className="flex items-center gap-4 relative z-10">
                  <span className="text-sm uppercase tracking-[0.2em] font-black">Login</span>
                </div>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}