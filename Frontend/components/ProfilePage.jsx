'use client';
import { useAuth } from '@/lib/auth';
import { useState, useEffect, useRef } from 'react';
import { FaUserEdit, FaSave, FaCamera, FaLock, FaUser, FaShieldAlt } from 'react-icons/fa';
import { apiCall, updateProfile, uploadFile } from '@/lib/api';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { useUser } from '@/context/UserContext';
export default function ProfilePage() {
    const { user, updateUser } = useUser();
    const { setTheme } = useTheme();
    const { setLanguage, t } = useLanguage();
    const fileInputRef = useRef(null);
    const [activeTab, setActiveTab] = useState('personal');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [msg, setMsg] = useState({ type: '', text: '' });
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', gender: '', dob: '',
        profile_image: '', employee_id: '', department: '',
        language: 'en', theme: 'light', notifications_enabled: true,
        password: '', old_password: '', two_factor_enabled: false
    });
    useEffect(() => {
        if (user) fetchUserData();
    }, [user]);
    async function fetchUserData() {
        try {
            const res = await apiCall(`/users/${user.id}`);
            const u = res.data;
            setFormData(prev => ({
                ...prev,
                name: u.name || '', email: u.email || '', phone: u.phone || '',
                gender: u.gender || 'Male', dob: u.dob ? u.dob.split('T')[0] : '',
                profile_image: u.profile_image || '',
                employee_id: u.employee_id || '', department: u.department || '',
                language: u.language || 'en', theme: u.theme || 'light',
                notifications_enabled: u.notifications_enabled !== 0 && u.notifications_enabled !== false,
                two_factor_enabled: u.two_factor_enabled === 1 || u.two_factor_enabled === true
            }));
        } catch (err) {
            console.error('Failed to load profile', err);
        } finally {
            setFetchLoading(false);
        }
    }
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        if (name === 'theme') setTheme(value);
        if (name === 'language') setLanguage(value);
    };
    const handleFileSelect = async (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setUploading(true);
            try {
                const res = await uploadFile(file);
                if (res.success) {
                    setFormData(prev => ({ ...prev, profile_image: res.url }));
                    setMsg({ type: 'success', text: 'Image uploaded! Please save changes.' });
                }
            } catch (err) {
                setMsg({ type: 'error', text: 'Upload failed: ' + err.message });
            } finally {
                setUploading(false);
            }
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg({ type: '', text: '' });
        try {
            const payload = { ...formData };
            if (!payload.password) {
                delete payload.password;
                delete payload.old_password;
            }
            const res = await updateProfile(payload);
            setMsg({ type: 'success', text: 'Settings saved successfully' });
            if (res && res.user) updateUser(res.user);
            if (payload.password) setFormData(prev => ({ ...prev, password: '', old_password: '' }));
        } catch (err) {
            setMsg({ type: 'error', text: err.message || 'Failed to update profile' });
        } finally {
            setLoading(false);
        }
    };
    if (fetchLoading) return <div className="p-10 text-center"><div className="spinner"></div></div>;
    if (!user) return null;
    const role = user.role;
    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-enter">
            {}
            <div className="card p-6 flex flex-col md:flex-row items-center gap-6">
                <div className="relative group">
                    <div className="w-24 h-24 bg-navy-50 rounded-full flex items-center justify-center text-primary-600 text-4xl overflow-hidden border-4 border-white shadow-lg relative">
                        {formData.profile_image ? (
                            <img src={formData.profile_image} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <span className="font-black">{formData.name?.charAt(0).toUpperCase()}</span>
                        )}
                        {uploading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs">Loading...</div>}
                    </div>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 bg-gray-700 text-white p-2 rounded-full shadow-lg hover:bg-gray-800 transition-all z-20 cursor-pointer"
                    >
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
                </div>
                <div className="text-center md:text-left flex-1">
                    <h1 className="h2">{formData.name}</h1>
                    <div className="flex items-center justify-center md:justify-start gap-2 text-slate-500 text-sm mt-1">
                        <span className="badge badge-neutral uppercase">{role}</span>
                        <span>•</span>
                        <span>{formData.email}</span>
                    </div>
                </div>
            </div>
            {}
            <div className="flex gap-2 border-b border-navy-100 pb-1">
                <button onClick={() => setActiveTab('personal')} className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'personal' ? 'border-gray-700 text-gray-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                    Personal Info
                </button>
                <button onClick={() => setActiveTab('security')} className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'security' ? 'border-gray-700 text-gray-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                    Security
                </button>
            </div>
            {}
            <form onSubmit={handleSubmit} className="card p-8">
                {msg.text && (
                    <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 font-medium text-sm ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                        {msg.text}
                    </div>
                )}
                {activeTab === 'personal' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-enter">
                        <div className="space-y-2">
                            <label className="label">Full Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} className="input-field" required />
                        </div>
                        <div className="space-y-2">
                            <label className="label">Phone</label>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="input-field" />
                        </div>
                        <div className="space-y-2">
                            <label className="label">Gender</label>
                            <select name="gender" value={formData.gender} onChange={handleChange} className="input-field">
                                <option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="label">Date of Birth</label>
                            <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="input-field" />
                        </div>
                    </div>
                )}
                {activeTab === 'security' && (
                    <div className="space-y-6 animate-enter">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="label">Current Password</label>
                                <input type="password" name="old_password" value={formData.old_password} onChange={handleChange} className="input-field" placeholder="Protected" />
                            </div>
                            <div className="space-y-2">
                                <label className="label">New Password</label>
                                <input type="password" name="password" value={formData.password} onChange={handleChange} className="input-field" placeholder="Min 8 characters" />
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <input type="checkbox" name="two_factor_enabled" checked={formData.two_factor_enabled} onChange={handleChange} className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500" />
                            <div>
                                <h4 className="font-bold text-slate-700 text-sm">Enable Two-Factor Authentication</h4>
                                <p className="text-xs text-slate-500">Require email verification code on login</p>
                            </div>
                        </div>
                    </div>
                )}
                <div className="pt-6 mt-6 border-t border-navy-50 flex justify-end gap-3">
                    <button type="button" onClick={() => window.history.back()} className="btn btn-ghost">Cancel</button>
                    <button type="submit" disabled={loading} className="btn btn-primary">
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}