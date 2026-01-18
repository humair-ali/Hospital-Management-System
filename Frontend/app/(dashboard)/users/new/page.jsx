'use client';

import { useState } from 'react';
import { useNavigation } from '@/context/NavigationContext';
import { createUser } from '@/lib/api';
import {
  FaUser, FaEnvelope, FaLock, FaPhone,
  FaBriefcase, FaStethoscope, FaUserShield,
  FaUserNurse, FaUserTie, FaUsers
} from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function NewUserPage() {
  const { navigateTo } = useNavigation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'doctor',
    phone: '',
    specialty: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        throw new Error('Please enter a valid email address');
      }
      await createUser(formData);
      toast.success('Personnel successfully integrated into system');
      navigateTo('users');
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Onboarding failed';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-8 border-b border-slate-100">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">System Onboarding</h1>
          <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-2xl">
            Provision new administrative or clinical personnel accounts with delegated authority.
          </p>
        </div>
        <button
          onClick={() => navigateTo('users')}
          className="btn-secondary h-11 px-8 rounded-xl font-bold uppercase tracking-widest text-[11px] shadow-sm hover:bg-white hover:border-red-200 hover:text-red-600 transition-all active:scale-95"
        >
          Cancel Operation
        </button>
      </div>

      <div className="grid grid-cols-1">
        <form onSubmit={handleSubmit} className="bg-white p-12 rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 space-y-10 relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 relative z-10">
            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-700 uppercase tracking-[0.2em] ml-1 block">Full Legal Identity</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <FaUser className="text-gray-300 group-focus-within:text-primary-500 transition-colors" />
                </div>
                <input
                  type="text"
                  required
                  className="w-full h-16 pl-14 pr-6 rounded-2xl border-2 border-slate-100 focus:border-primary-500 bg-slate-50/30 focus:bg-white transition-all text-base font-bold text-slate-900 placeholder:text-slate-500 outline-none"
                  placeholder="e.g. Alexander Pierce"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-700 uppercase tracking-[0.2em] ml-1 block">Institutional Role</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <FaBriefcase className="text-gray-300 group-focus-within:text-primary-500 transition-colors" />
                </div>
                <select
                  className="w-full h-16 pl-14 pr-6 rounded-2xl border-2 border-slate-100 focus:border-primary-500 bg-slate-50/30 focus:bg-white transition-all text-base font-bold text-slate-900 appearance-none cursor-pointer outline-none"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="doctor">Doctor</option>
                  <option value="nurse">Nurse</option>
                  <option value="receptionist">Receptionist</option>
                  <option value="accountant">Accountant</option>
                  <option value="patient">Patient</option>
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-700 uppercase tracking-[0.2em] ml-1 block">Corporate Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <FaEnvelope className="text-gray-300 group-focus-within:text-primary-500 transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  className="w-full h-16 pl-14 pr-6 rounded-2xl border-2 border-slate-100 focus:border-primary-500 bg-slate-50/30 focus:bg-white transition-all text-base font-bold text-slate-900 placeholder:text-slate-500 outline-none"
                  placeholder="identity@hospital.org"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-700 uppercase tracking-[0.2em] ml-1 block">Secure Credential</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <FaLock className="text-gray-300 group-focus-within:text-primary-500 transition-colors" />
                </div>
                <input
                  type="password"
                  required
                  className="w-full h-16 pl-14 pr-6 rounded-2xl border-2 border-slate-100 focus:border-primary-500 bg-slate-50/30 focus:bg-white transition-all text-base font-bold text-slate-900 placeholder:text-slate-500 outline-none"
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-700 uppercase tracking-[0.2em] ml-1 block">Verified Contact</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <FaPhone className="text-gray-300 group-focus-within:text-primary-500 transition-colors" />
                </div>
                <input
                  type="tel"
                  className="w-full h-16 pl-14 pr-6 rounded-2xl border-2 border-slate-100 focus:border-primary-500 bg-slate-50/30 focus:bg-white transition-all text-base font-bold text-slate-900 placeholder:text-slate-500 outline-none"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-700 uppercase tracking-[0.2em] ml-1 block">Clinical Focus</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <FaStethoscope className="text-gray-300 group-focus-within:text-primary-500 transition-colors" />
                </div>
                <input
                  type="text"
                  className="w-full h-16 pl-14 pr-6 rounded-2xl border-2 border-slate-100 focus:border-primary-500 bg-slate-50/30 focus:bg-white transition-all text-base font-bold text-slate-900 placeholder:text-slate-500 outline-none"
                  placeholder="e.g. Neuro-Ophthalmology"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="pt-10 border-t border-slate-100 flex flex-col md:flex-row gap-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] btn-primary h-16 rounded-2xl text-[13px] font-black uppercase tracking-[0.3em] shadow-xl shadow-primary-500/20 active:scale-[0.98] transition-all hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Provisioning...
                </div>
              ) : (
                'Finalize Personnel Onboarding'
              )}
            </button>
            <button
              type="button"
              onClick={() => navigateTo('users')}
              className="flex-1 btn-secondary h-16 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-slate-50 transition-all shadow-sm active:scale-[0.98]"
            >
              Abort Operation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}