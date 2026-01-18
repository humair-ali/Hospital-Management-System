'use client';
import { useState } from 'react';
import { useNavigation } from '@/context/NavigationContext';
import { useUser, hasRole } from '@/context/UserContext';
import { registerDoctor } from '@/lib/api';
import { FaUserMd, FaEnvelope, FaLock, FaStethoscope, FaGraduationCap, FaPhone, FaPlus, FaTimes, FaShieldAlt } from 'react-icons/fa';
export default function NewDoctorPage() {
  const { user, loading: authLoading } = useUser();
  const { navigateTo } = useNavigation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    specialty: '',
    qualifications: '',
    bio: ''
  });
  const specialties = [
    'General Practitioner', 'Cardiology', 'Neurology', 'Orthopedics',
    'Pediatrics', 'Dentistry', 'Psychology', 'Surgery', 'Dermatology', 'Ophthalmology'
  ];
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await registerDoctor(formData);
      toast.success('Doctor Added', { autoClose: 1000 });
      navigateTo('doctors');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
      setLoading(false);
    }
  }
  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto mt-20 p-10 card-elevated bg-white border border-gray-100 text-center space-y-6">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
        </div>
        <div>
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Access Denied</h2>
          <p className="text-gray-500 text-sm mt-2 font-medium">Only system administrators can provision new medical staff accounts.</p>
        </div>
        <button onClick={() => navigateTo('doctors')} className="btn-secondary w-full">Return to Dashboard</button>
      </div>
    );
  }
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      <div className="flex items-center justify-between pb-6 border-b border-gray-200/60">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Register Specialist</h1>
          <p className="text-gray-500 mt-1 text-sm font-medium italic">Provision a new medical staff profile and database record</p>
        </div>
        <button
          onClick={() => router.back()}
          className="icon-btn"
        >
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            {error}
          </div>
        )}
        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl text-sm font-bold flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            {success}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          { }
          <div className="card-elevated p-8 bg-white border border-gray-100 space-y-6">
            <h3 className="text-[11px] font-bold text-primary-600 uppercase tracking-[0.2em] pb-3 border-b border-gray-50 flex items-center gap-2">
              Account Credentials
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Legal Full Name</label>
                <div className="input-with-icon-wrapper group">
                  <div className="input-icon-container">
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Dr. Alexander Wright"
                    required
                    className="input-field input-field-with-icon"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Staff Email</label>
                <div className="input-with-icon-wrapper group">
                  <div className="input-icon-container">
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="alex.wright@hospital.com"
                    required
                    className="input-field input-field-with-icon"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Access Token (Password)</label>
                <div className="input-with-icon-wrapper group">
                  <div className="input-icon-container">
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="input-field input-field-with-icon"
                  />
                </div>
              </div>
            </div>
          </div>
          { }
          <div className="card-elevated p-8 bg-white border border-gray-100 space-y-6">
            <h3 className="text-[11px] font-bold text-primary-600 uppercase tracking-[0.2em] pb-3 border-b border-gray-50 flex items-center gap-2">
              Clinical Profile
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Medical Specialty</label>
                <div className="input-with-icon-wrapper group">
                  <div className="input-icon-container">
                  </div>
                  <select
                    name="specialty"
                    value={formData.specialty}
                    onChange={handleChange}
                    required
                    className="input-field input-field-with-icon bg-white cursor-pointer"
                    style={{ appearance: 'none', backgroundImage: 'none' }}
                  >
                    <option value="">Select Specialization...</option>
                    {specialties.map(spec => <option key={spec} value={spec}>{spec}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Board Qualifications</label>
                <div className="input-with-icon-wrapper group">
                  <div className="input-icon-container">
                  </div>
                  <input
                    type="text"
                    name="qualifications"
                    value={formData.qualifications}
                    onChange={handleChange}
                    placeholder="MBBS, MD Cardiology, FRCP"
                    className="input-field input-field-with-icon"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Clinical Contact</label>
                <div className="input-with-icon-wrapper group">
                  <div className="input-icon-container">
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                    className="input-field input-field-with-icon"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Professional Background & Expertise</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              placeholder="Describe clinical background, research areas, or achievements..."
              className="w-full p-4 bg-white border border-gray-200 rounded-2xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 transition-all outline-none text-sm h-32 font-medium"
            />
          </div>
        </div>
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 btn-primary h-14 shadow-xl shadow-primary-600/20"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-3">
                <div className="loading-spinner h-5 w-5 border-2 border-white/20 border-t-white"></div>
                <span>Provisioning Specialist...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <span>Confirm Registry</span>
              </div>
            )}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 btn-secondary h-14"
          >
            Cancel Enrollment
          </button>
        </div>
      </form>
    </div>
  );
}