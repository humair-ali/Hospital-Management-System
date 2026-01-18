'use client';
import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { getAdminStats, getBills, getMedicalRecords } from '@/lib/api';
import {
  FaUserInjured, FaCalendarCheck, FaFileInvoiceDollar, FaChartLine,
  FaUserMd, FaArrowRight, FaClock, FaUsers,
  FaClipboardList, FaPrescriptionBottle, FaArrowUp,
  FaUserPlus, FaCalendarPlus, FaNotesMedical, FaMoneyBillWave, FaUsersCog,
  FaBed, FaCheckCircle, FaUserNurse
} from 'react-icons/fa';
import { SPALink } from '@/components/SPALink';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
export default function AdminDashboard() {
  const { user } = useUser();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [realtimeMetrics, setRealtimeMetrics] = useState(null);
  const [recentMedicalActivity, setRecentMedicalActivity] = useState([]);
  const [financialData, setFinancialData] = useState(null);
  useEffect(() => {
    let mounted = true;
    async function fetchStats() {
      try {
        const res = await getAdminStats();
        if (!mounted || !res.success) return;
        setStats(res.data);
        setRealtimeMetrics(prev => ({
          ...prev,
          personnelActive: res.data.doctors_count || 0,
          todaysAppointments: res.data.appointments_count || 0,
        }));
      } catch (err) { console.warn('Stats fetch failed'); }
    }

    async function fetchFinancials() {
      try {
        const res = await getBills({ limit: 100 });
        if (!mounted || !res.success) return;
        const bills = res.data || [];
        const today = new Date().toISOString().split('T')[0];
        const todaysBills = bills.filter((b) => (b.issued_at || b.created_at)?.startsWith(today));
        const todaysRevenue = todaysBills.reduce((sum, b) => sum + (parseFloat(b.total_amount) || 0), 0);
        const pendingBills = bills.filter((b) => b.status !== 'paid');
        const pendingAmount = pendingBills.reduce((sum, b) => sum + (parseFloat(b.total_amount) - parseFloat(b.total_paid || 0)), 0);
        const paidBills = bills.filter((b) => b.status === 'paid').length;
        const collectionRate = bills.length > 0 ? ((paidBills / bills.length) * 100).toFixed(1) : 0;
        setFinancialData({ todaysRevenue, pendingBills: pendingBills.length, pendingAmount, collectionRate });
      } catch (err) { console.warn('Financials fetch failed'); }
    }

    async function fetchMedical() {
      try {
        const res = await getMedicalRecords({ limit: 5 });
        if (!mounted || !res.success) return;
        setRecentMedicalActivity(res.data || []);
      } catch (err) { console.warn('Medical activity fetch failed'); }
    }

    async function initDashboard() {
      setLoading(true);
      
      await fetchStats();
      setLoading(false); 

      
      fetchFinancials();
      fetchMedical();

      setRealtimeMetrics(prev => ({
        ...prev,
        averageWaitTime: '00',
        bedOccupancy: '00%',
        criticalAlerts: 0,
        systemStatus: 'Ready'
      }));
    }

    initDashboard();
    const interval = setInterval(initDashboard, 60000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);
  const actions = (
    <div className="flex gap-4">
      <SPALink href="users" className="btn-secondary">Manage Staff</SPALink>
      <SPALink href="reports" className="btn-primary">View Analytics</SPALink>
    </div>
  );
  return (
    <div className="space-y-10 pb-10">
      <PageHeader
        title={`Welcome, ${user?.name || 'Administrator'}`}
        subtitle="Here You Can Manage All the Hospital System"
        actions={actions}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Personnel"
          value={stats?.doctors_count || 0}
          icon={FaUsers}
          variant="indigo"
          description="Personnel actively on duty"
        />
        <StatCard
          title="Hospital Patients"
          value={stats?.patients_count || 0}
          icon={FaCheckCircle}
          variant="emerald"
          description="In-patient registry status"
        />
        <StatCard
          title="Medical Practitioners"
          value={stats?.doctors_count || 0}
          icon={FaUserMd}
          trend="On-Call"
          variant="primary"
        />
        <StatCard
          title="Service Catalog"
          value={0}
          icon={FaClipboardList}
          trend="Operational"
          variant="indigo"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl border border-white/10">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <p className="text-[10px] font-black text-violet-400 uppercase tracking-[0.2em] mb-2">Live Monitoring</p>
                  <h3 className="text-2xl font-black tracking-tight">Real-Time Analytics</h3>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                  <span className="relative flex h-2 w-2">
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Live</span>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <MetricBox icon={FaUsersCog} color="blue" label="Personnel Active" value={realtimeMetrics?.personnelActive} pulse />
                <MetricBox icon={FaCalendarPlus} color="violet" label="Today's Caseload" value={realtimeMetrics?.todaysAppointments} />
                <MetricBox icon={FaClock} color="amber" label="Avg Patient Triage" value={realtimeMetrics?.averageWaitTime} textValue />
                <MetricBox icon={FaBed} color="cyan" label="Bed Occupancy" value={realtimeMetrics?.bedOccupancy} textValue />
                <MetricBox icon={FaCheckCircle} color="emerald" label="System Integrity" value={realtimeMetrics?.systemStatus} textValue />
                <MetricBox icon={FaChartLine} color="pink" label="Network Vector" value="00" textValue arrow />
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-white via-indigo-50/30 to-white rounded-[2.5rem] border border-indigo-100/50 p-8 shadow-2xl shadow-indigo-200/20 flex flex-col overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-200 rounded-full blur-[80px] opacity-20 pointer-events-none transition-transform group-hover:scale-125"></div>
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <p className="text-[10px] font-black text-violet-600 uppercase tracking-[0.2em] mb-1">Clinical Feed</p>
              <h3 className="text-lg font-black text-gray-900 tracking-tight">Medical Activity</h3>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-violet-50 rounded-lg border border-violet-100">
              <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-pulse"></span>
              <span className="text-[9px] font-black text-violet-600 uppercase tracking-widest">Live Flow</span>
            </div>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto scrollbar-thin max-h-[450px] pr-2 relative z-10">
            {recentMedicalActivity.length > 0 ? (
              recentMedicalActivity.map((record, idx) => (
                <SPALink key={record.id} href={`medical-records/${record.id}`} className="block p-4 rounded-3xl border border-gray-50 bg-white shadow-sm hover:shadow-md hover:border-violet-100 transition-all group">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-[1rem] bg-gradient-to-br from-violet-500 to-indigo-600 text-white flex items-center justify-center text-sm font-black shrink-0 shadow-lg shadow-violet-500/20">{record.patient_name?.charAt(0)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-black text-gray-900 group-hover:text-violet-600 truncate">{record.patient_name}</h4>
                        <span className="text-[10px] font-bold text-gray-400">Just now</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">{record.diagnosis || 'General Clinical Observation'}</p>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-[9px] font-black text-violet-600 bg-violet-50 px-2 py-0.5 rounded-md uppercase tracking-wider border border-violet-100/50">Dr. {record.doctor_name?.split(' ')[0]}</span>
                        <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-wider">Verified</span>
                      </div>
                    </div>
                  </div>
                </SPALink>
              ))
            ) : (
              <div className="py-20 flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-3xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-300">
                  <FaNotesMedical size={24} />
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-xs font-black uppercase tracking-[0.2em]">No Recent Activity</p>
                  <p className="text-[10px] text-gray-300 font-bold uppercase mt-1">Registry synchronize complete</p>
                </div>
              </div>
            )}
          </div>
          <SPALink href="medical-records" className="mt-6 w-full py-4 text-center border-t border-gray-50 hover:bg-violet-50/50 transition-colors group relative z-10">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-violet-600">Access Full Clinical Repository</span>
          </SPALink>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-gradient-to-br from-white via-violet-50/30 to-white rounded-[2.5rem] border border-violet-100 p-10 shadow-2xl shadow-violet-100/50 relative overflow-hidden lg:col-span-1 flex flex-col">
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-200 rounded-full blur-[120px] opacity-30 -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10 flex-1">
            <div className="mb-8"><p className="text-[10px] font-black text-violet-600 uppercase tracking-[0.2em] mb-2">Command Center</p><h3 className="text-2xl font-black text-gray-900 tracking-tight">Governance</h3></div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <ActionButton href="users/new?role=doctor" icon={FaUserMd} color="blue" label="Register Doctor" />
              <ActionButton href="users/new?role=nurse" icon={FaUserNurse} color="emerald" label="Register Nurse" />
              <ActionButton href="users/new?role=receptionist" icon={FaUsers} color="violet" label="Register Staff" />
              <ActionButton href="billing/new" icon={FaMoneyBillWave} color="amber" label="Issue Invoice" />
            </div>
            <div className="mt-8 pt-8 border-t border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Personnel</span>
                <span className="text-[10px] font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">Secure Node</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-primary-600 text-white flex items-center justify-center text-[10px] font-black shadow-lg shadow-primary-500/20">
                  +{Math.max(0, (stats?.patients || 0))}
                </div>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Registry Nodes Active</span>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-gray-900 via-slate-950 to-black rounded-[3rem] p-10 text-white relative overflow-hidden shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] lg:col-span-2 border border-white/5 group">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500 rounded-full blur-[150px] opacity-10 -translate-y-1/2 translate-x-1/2 transition-transform duration-1000 group-hover:scale-110"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-600 rounded-full blur-[120px] opacity-10 translate-y-1/2 -translate-x-1/2 group-hover:animate-pulse"></div>
          <div className="relative z-10">
            <div className="mb-10 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-2 drop-shadow-sm">Fiscal Intelligence</p>
                <h3 className="text-3xl font-black tracking-tighter uppercase leading-none">Institutional P&L</h3>
              </div>
              <div className="text-right bg-white/5 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/5 shadow-inner">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Fiscal Year 2026</p>
                <p className="text-sm font-black text-emerald-400 tracking-tighter">Yield: 102% <FaArrowUp className="inline ml-1" size={10} /></p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FinancialRow label="Today's Revenue" value={`PKR ${financialData?.todaysRevenue?.toLocaleString() || 0}`} sub="Total settled funds" live />
              <FinancialRow label="A/R Portfolio" value={`PKR ${financialData?.pendingAmount?.toLocaleString() || 0}`} sub={`${financialData?.pendingBills || 0} Open Invoices`} good />
              <div className="md:col-span-2">
                <FinancialRow label="Collection Efficiency" value={`${financialData?.collectionRate || 0}%`} icon={FaChartLine} sub="Standard Institutional Target" />
              </div>
            </div>
            <SPALink href="billing" className="mt-8 block w-full py-4 text-center border-t border-white/10 hover:bg-white/5 transition-colors">
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Open Enterprise Ledger</span>
            </SPALink>
          </div>
        </div>
      </div>
    </div>
  );
}
function MetricBox({ icon: Icon, color, label, value, pulse, arrow, textValue }) {
  const colors = {
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', pulse: 'bg-blue-500', hover: 'group-hover:text-blue-300' },
    violet: { bg: 'bg-violet-500/10', text: 'text-violet-400', pulse: 'bg-violet-500', hover: 'group-hover:text-violet-300' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', pulse: 'bg-amber-500', hover: 'group-hover:text-amber-300' },
    cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', pulse: 'bg-cyan-500', hover: 'group-hover:text-cyan-300' },
    pink: { bg: 'bg-pink-500/10', text: 'text-pink-400', pulse: 'bg-pink-500', hover: 'group-hover:text-pink-300' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', pulse: 'bg-emerald-500', hover: 'group-hover:text-emerald-300' },
  };
  const c = colors[color] || colors.blue;
  return (
    <div className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:bg-white/10 group">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl ${c.bg} ${c.text} flex items-center justify-center`}>
          <Icon size={18} />
        </div>
        {pulse && <div className={`w-2 h-2 rounded-full ${c.pulse} animate-pulse`}></div>}
        {arrow && <FaArrowUp className="text-emerald-400 ml-auto" size={10} />}
      </div>
      <p className="text-[10px] font-bold text-white/50 uppercase tracking-wider mb-2">{label}</p>
      <p className={`${textValue ? 'text-2xl' : 'text-3xl'} font-black text-white ${c.hover} transition-colors`}>{value || (textValue ? 'N/A' : 0)}</p>
    </div>
  );
}
function ActionButton({ href, icon: Icon, color, label }) {
  const themes = {
    blue: 'hover:from-blue-500 hover:to-blue-600 text-blue-600',
    violet: 'hover:from-violet-500 hover:to-violet-600 text-violet-600',
    emerald: 'hover:from-emerald-500 hover:to-emerald-600 text-emerald-600',
    amber: 'hover:from-amber-500 hover:to-amber-600 text-amber-600',
    indigo: 'hover:from-indigo-500 hover:to-indigo-600 text-indigo-600',
    pink: 'hover:from-pink-500 hover:to-pink-600 text-pink-600',
  };
  const t = themes[color];
  return (
    <SPALink href={href} className={`flex flex-col items-center justify-center p-6 bg-gray-50 border border-gray-200 rounded-3xl transition-all hover:bg-gradient-to-br group shadow-sm hover:shadow-xl hover:-translate-y-1 ${t}`}>
      <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-4 group-hover:bg-white/20 transition-colors">
        <Icon size={20} className="group-hover:text-white transition-colors" />
      </div>
      <p className="text-sm font-black text-gray-800 group-hover:text-white">{label}</p>
    </SPALink>
  );
}
function FinancialRow({ label, value, sub, icon: Icon, live, good }) {
  return (
    <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 shadow-inner group/row hover:bg-white/10 transition-all">
      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3 group-hover/row:text-white/60 transition-colors">{label}</p>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-black text-white tracking-tighter">{value}</p>
          {sub && <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-2">{sub}</p>}
        </div>
        <div className="flex flex-col items-end gap-2">
          {live && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
              <span className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse"></span>
              <span className="text-[9px] font-black text-emerald-400 uppercase tracking-tighter">Live</span>
            </div>
          )}
          {good && <div className="text-[9px] font-black text-emerald-400/60 uppercase tracking-widest">Target Met</div>}
          {Icon && <Icon className="text-white/10 group-hover/row:text-white/20 transition-colors" size={24} />}
        </div>
      </div>
    </div>
  );
}