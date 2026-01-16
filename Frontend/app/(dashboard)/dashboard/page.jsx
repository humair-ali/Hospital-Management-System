'use client';
import { FaBriefcaseMedical, FaArrowRight, FaShieldAlt, FaCircle } from 'react-icons/fa';
import { SPALink } from '@/components/SPALink';
import { useUser } from '@/context/UserContext';
export default function DashboardPage() {
  const { user } = useUser();
  const role = user?.role || 'admin';
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 animate-in fade-in zoom-in duration-700">
      <div className="card-elevated p-10 bg-white border border-gray-100 overflow-hidden relative rounded-[3rem]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50/40 rounded-full blur-[100px] -mr-32 -mt-32"></div>
        <div className="text-center space-y-6 relative z-10">
          <div className="inline-flex items-center justify-center p-4 bg-primary-50 rounded-2xl shadow-sm border border-primary-100/50">
            <FaBriefcaseMedical className="text-primary-600" size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">
              Welcome to <span className="text-primary-600">CareFlow HMS</span>
            </h1>
            <p className="text-gray-500 mt-4 text-lg font-medium max-w-lg mx-auto leading-relaxed">
              Your comprehensive infrastructure for modern clinical management and patient excellence.
            </p>
          </div>
        </div>
        <div className="mt-12 pt-10 border-t border-gray-100 relative z-10">
          <div className="flex flex-col sm:flex-row items-center gap-6 justify-between bg-gray-50/50 p-8 rounded-3xl border border-gray-100">
            <div className="flex items-center gap-6">
              <div className="h-20 w-20 rounded-[2rem] bg-gradient-to-br from-primary-600 to-primary-700 text-white flex items-center justify-center text-3xl font-bold shadow-xl shadow-primary-500/20 ring-4 ring-white transition-transform hover:rotate-3">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em] mb-1.5 flex items-center gap-2">
                  <FaShieldAlt size={10} /> Authorized Access
                </p>
                <p className="text-2xl font-black text-gray-900 leading-none">{user?.name || 'Authorized User'}</p>
                <div className="flex items-center gap-3 mt-3">
                  <span className="px-4 py-1.5 bg-white border border-gray-200 rounded-xl text-[10px] font-black text-gray-500 uppercase tracking-widest shadow-sm">
                    {role}
                  </span>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100 text-[9px] font-black uppercase tracking-widest">
                    <FaCircle size={6} className="animate-pulse" /> Live Now
                  </div>
                </div>
              </div>
            </div>
            <SPALink href={`dashboard/${role}`}>
              <button className="btn-primary h-14 px-8 shadow-xl shadow-primary-500/20 flex items-center gap-3 group">
                Enter Dashboard <FaArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </SPALink>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center gap-8 opacity-40">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
          Enterprise Infrastructure
        </p>
        <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
          HIPAA Secure Protocol
        </p>
        <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
          Vector Audit v2.4
        </p>
      </div>
    </div>
  );
}