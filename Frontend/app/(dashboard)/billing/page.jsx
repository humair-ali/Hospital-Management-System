'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { getBills } from '@/lib/api';
import { SPALink } from '@/components/SPALink';
import {
  FaFileInvoiceDollar, FaSearch, FaPlus,
  FaMoneyBillWave, FaArrowRight, FaCalendarAlt,
  FaFileExport, FaCheckCircle
} from 'react-icons/fa';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
export default function BillingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  useEffect(() => {
    if (user && !['admin', 'accountant'].includes(user.role)) {
      router.push(`/dashboard/${user.role}`);
    }
  }, [user, router]);
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await getBills({ search });
        setBills(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [search]);
  const actions = (
    <div className="flex gap-2">
      <SPALink href="billing/new" className="btn-primary flex items-center gap-2">
        <FaPlus size={12} /> New Invoice
      </SPALink>
    </div>
  );
  const totalOutstanding = bills
    ? bills.filter((b) => b.status !== 'paid').reduce((sum, b) => sum + (parseFloat(b.total_amount) || 0), 0)
    : 0;
  const totalPaid = bills
    ? bills.filter((b) => b.status === 'paid').reduce((sum, b) => sum + (parseFloat(b.total_amount) || 0), 0)
    : 0;
  return (
    <div className="h-full flex flex-col gap-10 animate-in fade-in duration-700">
      <PageHeader
        title="Institutional Ledger"
        subtitle="Financial management and billing cycle tracker"
        actions={actions}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard
          title="Total Receivables"
          value={`Rs.${totalOutstanding.toLocaleString()}`}
          icon={FaMoneyBillWave}
          variant="indigo"
          description={`${bills.filter((b) => b.status !== 'paid').length} awaiting settlement`}
          loading={loading || authLoading}
        />
        <StatCard
          title="Settled Funds"
          value={`Rs.${totalPaid.toLocaleString()}`}
          icon={FaFileInvoiceDollar}
          variant="emerald"
          description="Verified revenue"
          loading={loading || authLoading}
        />
        <StatCard
          title="Active Invoices"
          value={bills.length}
          icon={FaSearch}
          variant="blue"
          description="Live billing registry"
          loading={loading || authLoading}
        />
      </div>
      <div className="bg-white rounded-[2.5rem] border border-gray-100 p-1 shadow-2xl shadow-gray-200/50">
        <div className="flex flex-col md:flex-row gap-6 items-center p-2">
          <div className="flex-1 w-full bg-gray-50 rounded-[1.5rem] border border-transparent focus-within:bg-white focus-within:border-primary-100 transition-all p-2">
            <div className="relative flex items-center">
              <FaSearch className="absolute left-6 text-gray-300" size={18} />
              <input
                type="text"
                placeholder="Search registry by Invoice ID or Patient Name..."
                className="w-full h-12 pl-14 pr-6 bg-transparent outline-none text-sm font-black text-gray-700 placeholder:text-gray-300 placeholder:font-bold"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="h-14 px-8 bg-white border border-gray-100 rounded-2xl flex items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
            <FaCheckCircle className="text-emerald-500" /> Fiscal Cycle Active
          </div>
        </div>
      </div>
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="py-8 pl-10 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Invoice Vector</th>
                <th className="py-8 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Patient Principal</th>
                <th className="py-8 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Fiscal Total</th>
                <th className="py-8 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                <th className="py-8 pr-10 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading || authLoading ? (
                <tr>
                  <td colSpan={5}>
                    <LoadingState />
                  </td>
                </tr>
              ) : bills.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <EmptyState title="No Invoices Found" subtitle="Adjust search or generate a new bill." />
                  </td>
                </tr>
              ) : (
                bills.map((bill, idx) => (
                  <tr key={bill.id} className="hover:bg-primary-50/30 group transition-all" style={{ animationDelay: `${idx * 50}ms` }}>
                    <td className="py-10 pl-10">
                      <span className="font-mono text-[10px] font-black text-emerald-600 bg-emerald-50 px-5 py-2 rounded-xl border border-emerald-100 group-hover:bg-white transition-all uppercase tracking-widest shadow-sm">
                        INV-{bill.id.toString().padStart(5, '0')}
                      </span>
                    </td>
                    <td className="py-10">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gray-100 border border-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400 group-hover:bg-white group-hover:shadow-lg group-hover:scale-110 transition-all">
                          {bill.patient_name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="font-black text-gray-900 text-sm leading-tight">{bill.patient_name || 'Anonymous'}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Verified Payer</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-10">
                      <div className="flex flex-col">
                        <p className="font-black text-gray-900 text-lg leading-none tracking-tighter">
                          Rs.{parseFloat(bill.total_amount || 0).toLocaleString()}
                        </p>
                        <p className="text-[9px] font-black text-emerald-500 uppercase mt-2 tracking-widest">Gross Total</p>
                      </div>
                    </td>
                    <td className="py-10 text-center">
                      <span className={`inline-flex px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border-2 shadow-sm transition-all ${bill.status === 'paid'
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        : 'bg-rose-50 text-rose-600 border-rose-100'
                        }`}>
                        {bill.status}
                      </span>
                    </td>
                    <td className="py-10 pr-10 text-right">
                      <SPALink href={`billing/${bill.id}`} className="btn-secondary py-3 px-6 text-[10px] font-black uppercase tracking-widest">
                        Details <FaArrowRight className="ml-2 inline-block opacity-50" />
                      </SPALink>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}