'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { useLanguage } from '@/context/LanguageContext';
import { NavigationProvider, useNavigation } from '@/context/NavigationContext';
import {
  FaUserMd, FaUsers, FaCalendarAlt, FaFileInvoiceDollar, FaChartLine,
  FaSignOutAlt, FaTachometerAlt,
  FaUserInjured, FaClipboardList, FaNotesMedical, FaUserEdit,
  FaBell, FaBriefcaseMedical, FaCheckCircle, FaBars, FaTimes, FaSearch,
  FaCamera
} from 'react-icons/fa';
import { GlobalSearch } from '@/components/dashboard/GlobalSearch';
import DashboardSPAContainer from './DashboardSPAContainer';
import { uploadFile, updateProfile } from '@/lib/api';
import { toast } from 'react-toastify';
function DashboardShell() {
  const router = useRouter();
  const { user, logout, updateUser } = useUser();
  const { navigateTo, currentView } = useNavigation();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [notifications] = useState([
    { id: 1, title: 'System Synchronized', message: 'Hospital clinical registry is up to date.', time: 'Just now', type: 'success' },
    { id: 2, title: 'Welcome to CareFlow', message: 'You have logged as ' + user?.role + '.', time: '5m ago', type: 'info' }
  ]);
  const [hasUnread, setHasUnread] = useState(false); 

  const handleProfileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error('File size must be under 5MB');

    setIsUploading(true);
    const toastId = toast.loading('Uploading profile image...');
    try {
      const { url } = await uploadFile(file);
      await updateProfile({ profile_image: url });
      updateUser({ profile_image: url });
      toast.update(toastId, { render: 'Profile identity updated', type: 'success', isLoading: false, autoClose: 3000 });
    } catch (err) {
      toast.update(toastId, { render: err.message || 'Upload failed', type: 'error', isLoading: false, autoClose: 3000 });
    } finally {
      setIsUploading(false);
    }
  };
  const handleLogout = () => {
    logout();
  };
  const role = (user?.role && user.role !== 'undefined') ? user.role : 'admin';
  const getSidebarLinks = (role) => {
    const common = [
      { group: 'Overview', items: [{ view: `dashboard/${role}`, label: 'Dashboard', icon: FaTachometerAlt }] }
    ];
    switch (role) {
      case 'admin':
        return [
          ...common,
          {
            group: 'Institutional Control', items: [
              { view: 'users', label: 'Staff Management', icon: FaUsers },
              { view: 'patients', label: 'Patient Registry', icon: FaUserInjured },
              { view: 'doctors', label: 'Clinical Personnel', icon: FaUserMd },
            ]
          },
          {
            group: 'Operational Logic', items: [
              { view: 'appointments', label: 'Schedule Manager', icon: FaCalendarAlt },
              { view: 'medical-records', label: 'Clinical Records', icon: FaNotesMedical },
            ]
          },
          {
            group: 'Fiscal Governance', items: [
              { view: 'billing', label: 'Billing & Payments', icon: FaFileInvoiceDollar },
              { view: 'reports', label: 'Executive Analytics', icon: FaChartLine },
            ]
          },
        ];
      case 'doctor':
        return [
          ...common,
          {
            group: 'Clinical Console', items: [
              { view: 'patients', label: 'Assigned Patients', icon: FaUserInjured },
              { view: 'appointments', label: 'Clinical Schedule', icon: FaCalendarAlt },
              { view: 'medical-records', label: 'Treatment Records', icon: FaNotesMedical },
            ]
          },
          {
            group: 'Reports & Fiscal', items: [
              { view: 'reports', label: 'Clinical Reports', icon: FaChartLine },
              { view: 'billing/my-bills', label: 'Patient Billing (View)', icon: FaFileInvoiceDollar },
            ]
          }
        ];
      case 'nurse':
        return [
          ...common,
          {
            group: 'Nursing Care', items: [
              { view: 'patients', label: 'My Patients', icon: FaUserInjured },
              { view: 'appointments', label: 'Care Schedule', icon: FaCalendarAlt },
              { view: 'medical-records', label: 'Care Notes', icon: FaNotesMedical },
            ]
          }
        ];
      case 'receptionist':
        return [
          ...common,
          {
            group: 'Front Desk', items: [
              { view: 'patients', label: 'Registration', icon: FaUserInjured },
              { view: 'appointments', label: 'Scheduling', icon: FaCalendarAlt },
            ]
          }
        ];
      case 'accountant':
        return [
          ...common,
          {
            group: 'Fiscal Control', items: [
              { view: 'billing', label: 'Invoices & Payments', icon: FaFileInvoiceDollar },
              { view: 'reports', label: 'Financial Reports', icon: FaChartLine },
            ]
          }
        ];
      case 'patient':
        return [
          ...common,
          {
            group: 'Self Service', items: [
              { view: 'appointments', label: 'My Appointments', icon: FaCalendarAlt },
              { view: 'medical-records', label: 'My Reports', icon: FaNotesMedical },
              { view: 'billing/my-bills', label: 'My Billing', icon: FaFileInvoiceDollar },
            ]
          }
        ];
      default:
        return common;
    }
  };
  const links = useMemo(() => getSidebarLinks(role), [role]);
  const isLinkActive = (view) => currentView === view || currentView?.startsWith(`${view}/`);
  return (
    <div className="h-screen w-full flex overflow-hidden bg-gray-50 font-sans">
      <div
        className={`fixed inset-0 z-40 md:hidden bg-gray-900/50 backdrop-blur-sm ${isSidebarOpen ? 'block' : 'hidden'}`}
        onClick={() => setIsSidebarOpen(false)}
      />
      <aside className={`
        fixed md:relative inset-y-0 left-0 z-50 w-64 h-full bg-white flex flex-col shrink-0 border-r border-gray-200/60 shadow-xl md:shadow-lg md:shadow-gray-200/20
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100/50 bg-white">
          <button
            onClick={() => navigateTo(`dashboard/${role}`)}
            className="flex items-center gap-3 group"
          >
            <div className="bg-gradient-to-br from-primary-600 to-primary-700 text-white w-9 h-9 flex items-center justify-center rounded-lg shadow-lg shadow-primary-500/30">
              <FaBriefcaseMedical />
            </div>
            <span className="font-bold text-lg text-gray-900 tracking-tight group-hover:text-primary-800">
              CareFlow
            </span>
          </button>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-gray-900">
            <FaTimes />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin">
          {links.map((group, idx) => (
            <div key={idx} className="mb-8 last:mb-0">
              <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">
                {group.group}
              </p>
              <div className="space-y-1">
                {group.items.map((link, linkIdx) => {
                  const active = isLinkActive(link.view);
                  const Icon = link.icon;
                  return (
                    <button
                      key={linkIdx}
                      onClick={() => {
                        navigateTo(link.view);
                        if (window.innerWidth < 768) setIsSidebarOpen(false);
                      }}
                      className={`sidebar-link group w-full text-left ${active ? 'sidebar-link-active' : ''}`}
                    >
                      <Icon className={`w-4 h-4 mr-3 ${active ? 'text-white' : 'text-gray-400 group-hover:text-primary-600'}`} />
                      <span className={`font-semibold text-sm ${active ? 'text-white' : 'text-gray-600 group-hover:text-gray-900'}`}>{link.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="p-4 bg-gray-50/30 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md cursor-pointer group" onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}>
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary-600 to-primary-700 text-white flex items-center justify-center text-xs font-bold shadow-sm ring-2 ring-white">
              {user?.profile_image ? (
                <img src={user.profile_image} className="h-full w-full object-cover rounded-full" alt="Profile" />
              ) : (
                <span>{user?.role === 'admin' ? 'A' : (user?.name?.charAt(0).toUpperCase() || 'U')}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate group-hover:text-primary-700">{user?.name || 'User'}</p>
              <p className="text-[10px] font-bold text-primary-600 uppercase tracking-wider bg-primary-50 w-fit px-2 py-0.5 rounded-full mt-0.5">{user?.role || 'System Access'}</p>
            </div>
          </div>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-16 bg-white border-b border-gray-200/60 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden -ml-2 p-2 text-gray-500 hover:text-primary-600"
            >
              <FaBars size={20} />
            </button>
            <GlobalSearch />
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  setIsUserMenuOpen(false);
                  setHasUnread(false);
                }}
                className="icon-btn w-9 h-9 rounded-full bg-white border border-gray-100 shadow-sm text-gray-500 hover:text-primary-600 hover:border-primary-200 relative active:scale-95 cursor-pointer z-50 focus:outline-none focus:ring-2 focus:ring-primary-500/20 flex items-center justify-center transition-all"
              >
                <FaBell size={14} />
              </button>
              {isNotificationsOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)}></div>
                  <div className="absolute right-0 top-full mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden origin-top-right">
                    <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                      <p className="font-black text-gray-900 text-xs uppercase tracking-widest">Clinical Alerts</p>
                      <span className="text-[10px] font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">Live Vector</span>
                    </div>
                    <div className="max-h-[350px] overflow-y-auto">
                      {notifications.map((n) => (
                        <div key={n.id} className="p-4 border-b border-gray-50 hover:bg-gray-50 cursor-default group">
                          <div className="flex gap-3">
                            <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${n.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                              {n.type === 'success' ? <FaCheckCircle size={14} /> : <FaBriefcaseMedical size={14} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-bold text-gray-900 leading-tight">{n.title}</h4>
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{n.message}</p>
                              <p className="text-[10px] font-medium text-gray-400 mt-1.5 uppercase tracking-wider">{n.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 bg-gray-50/50 text-center border-t border-gray-50">
                      <button className="text-[10px] font-black text-primary-600 uppercase tracking-widest hover:text-primary-700">Clear All Notifications</button>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="w-px h-6 bg-gray-200 mx-1"></div>
            <div className="relative">
              <button
                onClick={() => {
                  setIsUserMenuOpen(!isUserMenuOpen);
                  setIsNotificationsOpen(false);
                }}
                className="flex items-center gap-2 group outline-none cursor-pointer"
              >
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary-600 to-primary-700 text-white flex items-center justify-center text-[13px] font-black shadow-md ring-2 ring-white group-hover:ring-primary-100 cursor-pointer overflow-hidden active:scale-95 transition-all">
                  {user?.profile_image ? (
                    <img src={user.profile_image} className="h-full w-full object-cover" alt="Profile" />
                  ) : (
                    <span className="leading-none">{user?.role === 'admin' ? 'A' : (user?.name?.charAt(0).toUpperCase() || 'U')}</span>
                  )}
                </div>
              </button>
              {isUserMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)}></div>
                  <div className="absolute right-0 top-full mt-3 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden origin-top-right">
                    <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/30">
                      <p className="font-bold text-gray-900 text-sm truncate">{user?.name}</p>
                      <p className="text-xs font-medium text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <div className="p-1.5">
                      <label className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer w-full text-left transition-colors">
                        <FaCamera size={14} className="text-gray-400" />
                        <span>Update Photo</span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleProfileUpload}
                          disabled={isUploading}
                        />
                      </label>
                      <button
                        onClick={() => {
                          navigateTo(`dashboard/${role}/profile`);
                          setIsUserMenuOpen(false);
                        }}
                        className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer w-full text-left"
                      >
                        <FaUserEdit size={14} className="text-gray-400" /> My Profile
                      </button>
                      <div className="h-px bg-gray-100 my-1 mx-2"></div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          logout();
                        }}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-red-50 rounded-lg group w-full text-left"
                      >
                        <FaSignOutAlt size={14} className="text-gray-400 group-hover:text-red-500" /> Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-8 scrollbar-thin relative z-0 bg-gray-50/50">
          <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-primary-100/20 rounded-full blur-[120px] -z-10 pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
          <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-violet-100/20 rounded-full blur-[100px] -z-10 pointer-events-none -translate-x-1/4 translate-y-1/4"></div>
          <div className="max-w-[1600px] mx-auto pb-10 relative z-10">
            <DashboardSPAContainer />
          </div>
        </main>
      </div>
    </div>
  );
}
export default function DashboardLayout({ children }) {
  const { user } = useUser();
  const role = (user?.role && user.role !== 'undefined') ? user.role : 'admin';
  const initialView = (() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const dashboardMatch = path.match(/\/dashboard\/(admin|doctor|nurse|receptionist|accountant|patient)/);
      if (dashboardMatch) return `dashboard/${dashboardMatch[1]}`;
      const featureMatch = path.match(/\/(users|patients|doctors|appointments|medical-records|billing|reports)/);
      if (featureMatch) {
        const subPath = path.startsWith('/') ? path.substring(1) : path;
        
        return subPath.replace(/^dashboard\//, '');
      }
      return `dashboard/${role}`;
    }
    return `dashboard/${role}`;
  })();
  return (
    <NavigationProvider initialView={initialView}>
      <DashboardShell />
    </NavigationProvider>
  );
}