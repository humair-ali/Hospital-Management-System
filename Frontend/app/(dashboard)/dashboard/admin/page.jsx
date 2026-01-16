'use client';
import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { getAdminStats, getBills, getMedicalRecords } from '@/lib/api';
import {
  FaUserInjured, FaCalendarCheck, FaFileInvoiceDollar, FaChartLine,
  FaUserMd, FaArrowRight, FaClock, FaUsers,
  FaClipboardList, FaPrescriptionBottle, FaArrowUp,
  FaUserPlus, FaCalendarPlus, FaNotesMedical, FaMoneyBillWave, FaUsersCog,
  FaBed, FaCheckCircle
} from 'react-icons/fa';
import { SPALink } from '@/components/SPALink';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
export default function AdminDashboard() {
  const { user } = useUser();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [realtimeMetrics, setRealtimeMetrics] = useState(null);
  const [recentMedicalActivity, setRecentMedicalActivity] = useState([]);
  const [financialData, setFinancialData] = useState(null);
  useEffect(() => {
    let mounted = true;
    async function fetchAllData() {
      try {
        const [statsRes, billsRes, medicalRes] = await Promise.all([
          getAdminStats(),
          getBills({ limit: 100 }),
          getMedicalRecords({ limit: 5 })
        ]);
        if (!mounted) return;
        if (statsRes?.success) setStats(statsRes.data);
        if (billsRes?.success) {
          const bills = billsRes.data || [];
          const today = new Date().toISOString().split('T')[0];
          const todaysBills = bills.filter((b) => b.date?.startsWith(today));
          const todaysRevenue = todaysBills.reduce((sum, b) => sum + (parseFloat(b.total_amount) || 0), 0);
          const pendingBills = bills.filter((b) => b.payment_status !== 'paid');
          const pendingAmount = pendingBills.reduce((sum, b) => sum + (parseFloat(b.total_amount) - parseFloat(b.paid_amount || 0)), 0);
          const paidBills = bills.filter((b) => b.payment_status === 'paid').length;
          const collectionRate = bills.length > 0 ? ((paidBills / bills.length) * 100).toFixed(1) : 0;
          setFinancialData({ todaysRevenue, pendingBills: pendingBills.length, pendingAmount, collectionRate });
        }
        if (medicalRes?.success) setRecentMedicalActivity(medicalRes.data || []);
        setRealtimeMetrics({
          personnelActive: statsRes?.data?.staff_on_duty || 0,
          todaysAppointments: statsRes?.data?.appointments_count || 0,
          averageWaitTime: 'Auto-Sync',
          bedOccupancy: '78%',
          criticalAlerts: 0,
          systemStatus: 'Operational'
        });
      } catch (err) {
        console.warn('Dashboard data sync failed');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchAllData();
    const interval = setInterval(fetchAllData, 60000);
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
        subtitle="Institutional Command Center • Live Health Vector v4.0"
        actions={actions}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard
          title="Hospital Personnel"
          value={stats?.users_count || 0}
          icon={FaUsers}
          trend="+4 this month"
          color="blue"
        />
        <StatCard
          title="Active Patients"
          value={stats?.patients_count || 0}
          icon={FaUserInjured}
          trend="+12 since yesterday"
          color="indigo"
        />
        <StatCard
          title="Medical Practitioners"
          value={stats?.doctors_count || 0}
          icon={FaUserMd}
          trend="92% active"
          color="violet"
        />
        <StatCard
          title="Service Catalog"
          value={24}
          icon={FaClipboardList}
          trend="Operational"
          color="amber"
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
                <MetricBox icon={FaChartLine} color="pink" label="Network Vector" value="Optimum" textValue arrow />
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-2xl shadow-gray-200/50 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-[10px] font-black text-violet-600 uppercase tracking-[0.2em] mb-1">Clinical Feed</p>
              <h3 className="text-lg font-black text-gray-900 tracking-tight">Medical Activity</h3>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-violet-50 rounded-lg border border-violet-100">
              <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-pulse"></span>
              <span className="text-[9px] font-black text-violet-600 uppercase tracking-widest">Live Flow</span>
            </div>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto scrollbar-thin max-h-[450px] pr-2">
            {recentMedicalActivity.map((record, idx) => (
              <SPALink key={record.id} href={`medical-records/${record.id}`} className="block p-4 rounded-3xl border border-gray-50 hover:bg-gray-50 transition-all group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-[1rem] bg-gradient-to-br from-violet-500 to-indigo-600 text-white flex items-center justify-center text-sm font-black shrink-0 shadow-lg shadow-violet-500/20">{record.patient_name?.charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black text-gray-900 group-hover:text-violet-600 truncate">{record.patient_name}</h4>
                      <span className="text-[10px] font-bold text-gray-400">Just now</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{record.diagnosis || 'General Clinical Observation'}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-[9px] font-black text-violet-600 bg-violet-50 px-2 py-0.5 rounded-md uppercase tracking-wider">Dr. {record.doctor_name?.split(' ')[0]}</span>
                      <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-wider">Verified</span>
                    </div>
                  </div>
                </div>
              </SPALink>
            ))}
            {recentMedicalActivity.length === 0 && (
              <div className="py-10 text-center">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">No Recent Patient Activity</p>
              </div>
            )}
          </div>
          <SPALink href="medical-records" className="mt-6 w-full py-4 text-center border-t border-gray-50 hover:bg-gray-50 transition-colors">
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Access Full Clinical Repository</span>
          </SPALink>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-gradient-to-br from-white via-violet-50/30 to-white rounded-[2.5rem] border border-violet-100 p-10 shadow-2xl shadow-violet-100/50 relative overflow-hidden lg:col-span-1 flex flex-col">
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-200 rounded-full blur-[120px] opacity-30 -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10 flex-1">
            <div className="mb-8"><p className="text-[10px] font-black text-violet-600 uppercase tracking-[0.2em] mb-2">Command Center</p><h3 className="text-2xl font-black text-gray-900 tracking-tight">Governance</h3></div>
            <div className="grid grid-cols-2 gap-4">
              <ActionButton href="users/new" icon={FaUserPlus} color="blue" label="Onboard Staff" />
              <ActionButton href="appointments/new" icon={FaCalendarPlus} color="violet" label="Schedule Visit" />
              <ActionButton href="medical-records/new" icon={FaNotesMedical} color="emerald" label="Update Registry" />
              <ActionButton href="billing/new" icon={FaMoneyBillWave} color="amber" label="Generate Bill" />
            </div>
            <div className="mt-8 pt-8 border-t border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Personnel</span>
                <span className="text-[10px] font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">Secure Node</span>
              </div>
              <div className="flex -space-x-3 overflow-hidden">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="inline-block h-10 w-10 rounded-2xl ring-4 ring-white bg-gray-100 flex items-center justify-center text-[10px] font-black">{String.fromCharCode(64 + i)}</div>
                ))}
                <div className="inline-block h-10 w-10 rounded-2xl ring-4 ring-white bg-primary-600 text-white flex items-center justify-center text-[10px] font-black">+12</div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl lg:col-span-2">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-[150px] opacity-10 -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="mb-10 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-emerald-200 uppercase tracking-[0.2em] mb-2">Fiscal Intelligence</p>
                <h3 className="text-2xl font-black tracking-tight uppercase">Institutional P&L</h3>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Cycle-2026</p>
                <p className="text-xs font-black text-emerald-300">Target: 102%</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FinancialRow label="Today's Revenue" value={`$${financialData?.todaysRevenue?.toLocaleString() || 0}`} sub="Settled funds" live />
              <FinancialRow label="A/R Portfolio" value={`$${financialData?.pendingAmount?.toLocaleString() || 0}`} sub={`${financialData?.pendingBills || 0} Open Invoices`} good />
              <div className="md:col-span-2">
                <FinancialRow label="Collection Efficiency" value={`${financialData?.collectionRate || 0}%`} icon={FaChartLine} sub="Target exceedance +2.4%" />
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
    blue: 'hover:from-blue-500 hover:to-blue-600 text-blue-500',
    violet: 'hover:from-violet-500 hover:to-violet-600 text-violet-500',
    emerald: 'hover:from-emerald-500 hover:to-emerald-600 text-emerald-500',
    amber: 'hover:from-amber-500 hover:to-amber-600 text-amber-500',
    indigo: 'hover:from-indigo-500 hover:to-indigo-600 text-indigo-500',
    pink: 'hover:from-pink-500 hover:to-pink-600 text-pink-500',
  };
  const t = themes[color];
  return (
    <SPALink href={href} className={`flex flex-col items-center justify-center p-6 bg-white border border-gray-100 rounded-3xl transition-all hover:bg-gradient-to-br group shadow-sm hover:shadow-xl hover:-translate-y-1 ${t}`}>
      <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-4 group-hover:bg-white/20 transition-colors">
        <Icon size={20} className="group-hover:text-white transition-colors" />
      </div>
      <p className="text-sm font-black text-gray-900 group-hover:text-white">{label}</p>
    </SPALink>
  );
}
function FinancialRow({ label, value, sub, icon: Icon, live, good }) {
  return (
    <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
      <p className="text-[10px] font-bold text-white/70 uppercase tracking-wider mb-3">{label}</p>
      <div className="flex items-end justify-between">
        <div><p className="text-3xl font-black">{value}</p>{sub && <p className="text-sm font-medium text-white/60 mt-1">{sub}</p>}</div>
        {live && <div className="flex items-center gap-1 text-emerald-200"><span className="text-sm font-black">Live</span></div>}
        {good && <div className="flex items-center gap-1 text-emerald-200"><span className="text-xs font-bold">Good</span></div>}
        {Icon && <Icon className="text-white/20" size={24} />}
      </div>
    </div>
  );
}