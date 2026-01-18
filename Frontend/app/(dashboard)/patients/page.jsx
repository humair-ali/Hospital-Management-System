'use client';
import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { useNavigation } from '@/context/NavigationContext';
import { getPatients, deletePatient } from '@/lib/api';
import { SPALink } from '@/components/SPALink';
import { toast } from 'react-toastify';
import { FaUserInjured, FaSearch, FaPhoneAlt, FaMapMarkerAlt, FaPlus, FaTrash } from 'react-icons/fa';
export default function PatientsPage() {
  const { user, loading: authLoading } = useUser();
  const { navigateTo } = useNavigation();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  useEffect(() => {
    if (user && ['accountant', 'patient'].includes(user.role)) {
      navigateTo(`dashboard/${user.role}`);
    }
  }, [user, navigateTo]);
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await getPatients({ search });
        setPatients(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [search]);
  async function handleDeletePatient(id) {
    if (confirm('Are you sure you want to delete this patient record?')) {
      try {
        await deletePatient(id);
        toast.success('Patient record deleted');
        const res = await getPatients({ search });
        setPatients(res.data || []);
      } catch (err) {
        toast.error('Failed to delete patient');
      }
    }
  }
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200/60">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Patients Registry</h1>
          <p className="text-gray-500 mt-1 text-sm font-medium">Manage patient records, admissions, and history</p>
        </div>
        {user && ['admin', 'receptionist'].includes(user.role) && (
          <div className="flex gap-3">
            <SPALink href="patients/new" className="btn-primary flex items-center gap-2">
              <FaPlus size={12} /> New Patient
            </SPALink>
          </div>
        )}
      </div>
      <div className="card-elevated p-4 bg-white border border-gray-100 flex flex-col md:flex-row items-stretch md:items-center gap-4">
        <div className="input-with-icon-wrapper flex-1 group">
          <div className="input-icon-container">
            <FaSearch className="text-gray-400 group-focus-within:text-primary-500 transition-colors" size={16} />
          </div>
          <input
            type="text"
            placeholder="Search by name, phone number, or ID..."
            className="input-field input-field-with-icon h-12 bg-gray-50/50 focus:bg-white border-transparent focus:border-primary-500 text-base w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-6 py-3 rounded-2xl border border-gray-100 italic">
          Identity Vector Lock Active
        </div>
      </div>
      <div className="card-elevated overflow-hidden ring-1 ring-gray-950/5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-200/80">
                <th className="py-5 pl-8 text-left text-xs font-extrabold text-gray-400 uppercase tracking-widest w-[30%]">Patient Identity</th>
                <th className="py-5 text-left text-xs font-extrabold text-gray-400 uppercase tracking-widest">Gender & Age</th>
                <th className="py-5 text-left text-xs font-extrabold text-gray-400 uppercase tracking-widest">Contact Info</th>
                <th className="py-5 text-left text-xs font-extrabold text-gray-400 uppercase tracking-widest">Address</th>
                <th className="py-5 pr-8 text-right text-xs font-extrabold text-gray-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="table-cell text-center py-24">
                    <div className="flex flex-col items-center gap-4">
                      <div className="loading-spinner h-8 w-8"></div>
                      <span className="text-gray-500 font-semibold text-sm">Loading records...</span>
                    </div>
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="table-cell py-24 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-2">
                        <FaUserInjured size={40} />
                      </div>
                      <div>
                        <span className="text-xl font-bold text-gray-900 block">No Patients Found</span>
                        <span className="text-sm mt-1 block">Try adjusting your search or add a new patient.</span>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                patients.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/80 transition-all group cursor-default">
                    <td className="table-cell py-5 pl-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-primary-500/20 group-hover:scale-105 transition-transform duration-300">
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-gray-900 text-base group-hover:text-primary-700 transition-colors block">{p.name}</span>
                          <span className="text-xs text-gray-400 font-black tracking-widest uppercase">MRN: {p.id.toString().padStart(6, '0')}</span>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${p.gender === 'male' ? 'badge-info' : p.gender === 'female' ? 'badge-purple' : 'badge-neutral'} capitalize`}>
                        {p.gender || 'Unknown'}
                      </span>
                    </td>
                    <td className="table-cell">
                      {p.phone ? (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-gray-700 font-medium text-sm">
                            <FaPhoneAlt size={10} className="text-gray-400" />
                            <span>{p.phone}</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic text-sm">No contact info</span>
                      )}
                    </td>
                    <td className="table-cell">
                      {p.address ? (
                        <div className="flex items-center gap-2 text-gray-600 max-w-[200px]">
                          <FaMapMarkerAlt size={10} className="text-gray-400 shrink-0" />
                          <span className="truncate text-sm">{p.address}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="table-cell pr-8 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <SPALink href={`patients/${p.id}`} className="btn-secondary py-2 px-4 text-xs font-bold">
                          View Profile
                        </SPALink>
                        {user && user.role === 'admin' && (
                          <button
                            onClick={() => handleDeletePatient(p.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                            title="Delete Patient"
                          >
                            <FaTrash size={14} />
                          </button>
                        )}
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