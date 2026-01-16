'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { getAppointments, updateAppointmentStatus } from '@/lib/api';
import { SPALink } from '@/components/SPALink';
import { FaCalendarCheck, FaSearch, FaCheck, FaTimes, FaPlus, FaClock, FaUserInjured, FaUserMd } from 'react-icons/fa';
import { toast } from 'react-toastify';
export default function AppointmentsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  useEffect(() => {
    if (user && user.role === 'accountant') {
      router.push(`/dashboard/${user.role}`);
    }
  }, [user, router]);
  useEffect(() => {
    fetchData();
  }, [search]);
  async function fetchData() {
    try {
      const res = await getAppointments({ search });
      setAppointments(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }
  const handleStatusUpdate = async (id, status) => {
    try {
      await updateAppointmentStatus(id, status);
      toast.success('Appointment updated');
      fetchData();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };
  const filteredAppointments = appointments.filter((a) =>
    filter === 'all' ? true : a.status.toLowerCase() === filter
  );
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200/60">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Appointments</h1>
          <p className="text-gray-500 mt-1 text-sm font-medium">Manage patient schedules, visits, and follow-ups</p>
        </div>
        <SPALink href="appointments/new" className="btn-primary shadow-lg shadow-primary-500/20 ring-2 ring-primary-500/20 ring-offset-1 flex items-center gap-2">
          <FaPlus size={12} /> Schedule Visit
        </SPALink>
      </div>
      <div className="card-elevated p-4 bg-white border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex bg-gray-100/80 p-1.5 rounded-xl w-full md:w-auto overflow-x-auto">
          {['all', 'scheduled', 'completed', 'cancelled'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all duration-200 ${filter === f
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="input-with-icon-wrapper w-full md:w-80 group">
          <div className="input-icon-container">
            <FaSearch className="text-gray-400 group-focus-within:text-primary-500 transition-colors" size={14} />
          </div>
          <input
            type="text"
            placeholder="Search appointments..."
            className="input-field input-field-with-icon h-11 bg-gray-50/50 focus:bg-white border-transparent focus:border-primary-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="card-elevated overflow-hidden ring-1 ring-gray-950/5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-200/80">
                <th className="py-5 pl-8 text-left text-xs font-extrabold text-gray-400 uppercase tracking-widest">Patient Identity</th>
                <th className="py-5 text-left text-xs font-extrabold text-gray-400 uppercase tracking-widest">Assigned Doctor</th>
                <th className="py-5 text-left text-xs font-extrabold text-gray-400 uppercase tracking-widest">Date & Time</th>
                <th className="py-5 text-center text-xs font-extrabold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="py-5 pr-8 text-right text-xs font-extrabold text-gray-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="table-cell text-center py-20">
                    <div className="flex flex-col items-center gap-3">
                      <div className="loading-spinner"></div>
                      <span className="text-gray-500 font-medium text-sm">Syncing schedule...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="table-cell text-center py-24 text-gray-500">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-2">
                        <FaCalendarCheck size={40} />
                      </div>
                      <div>
                        <span className="text-xl font-bold text-gray-900 block">No Appointments</span>
                        <span className="text-sm mt-1 block">Check active filters or schedule a new one.</span>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-gray-50/80 transition-all group cursor-default border-t border-gray-50">
                    <td className="table-cell py-5 pl-8">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0">
                          <FaUserInjured size={14} />
                        </div>
                        <span className="font-bold text-gray-900">{apt.patient_name || 'Registry Error'}</span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2 text-gray-700">
                        <FaUserMd className="text-gray-400" size={14} />
                        <span className="font-medium">{apt.doctor_name || 'Pending Assignment'}</span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex flex-col">
                        <span className="text-gray-900 font-bold text-sm">
                          {apt.scheduled_at ? new Date(apt.scheduled_at).toLocaleDateString() : 'N/A'}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1 font-medium bg-gray-50 w-fit px-2 py-0.5 rounded">
                          <FaClock size={10} /> {apt.scheduled_at ? new Date(apt.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                        </div>
                      </div>
                    </td>
                    <td className="table-cell text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold capitalize border ${apt.status === 'scheduled' || apt.status === 'confirmed'
                        ? 'bg-blue-50 text-blue-700 border-blue-100'
                        : apt.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          : 'bg-red-50 text-red-700 border-red-100'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-2 ${apt.status === 'scheduled' || apt.status === 'confirmed' ? 'bg-blue-500' :
                          apt.status === 'completed' ? 'bg-emerald-500' : 'bg-red-500'
                          }`}></span>
                        {apt.status}
                      </span>
                    </td>
                    <td className="table-cell pr-8 text-right">
                      <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        {apt.status === 'scheduled' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(apt.id, 'completed')}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 transition-colors tooltip"
                              title="Mark Completed"
                            >
                              <FaCheck size={14} />
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(apt.id, 'cancelled')}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors tooltip"
                              title="Cancel Appointment"
                            >
                              <FaTimes size={14} />
                            </button>
                          </>
                        )}
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                          <span className="font-bold text-xs">...</span>
                        </button>
                      </div>
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