'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { getDoctors } from '@/lib/api';
import { SPALink } from '@/components/SPALink';
import { FaUserMd, FaSearch, FaEnvelope, FaPhone, FaPlus, FaStethoscope, FaChevronRight } from 'react-icons/fa';
export default function DoctorsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push(`/dashboard/${user.role}`);
    }
  }, [user, router]);
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await getDoctors({ search });
        setDoctors(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [search]);
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200/60 transition-all">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Medical Staff</h1>
          <p className="text-gray-500 mt-1 text-sm font-medium">Manage doctors, specialists, and medical personnel</p>
        </div>
        <SPALink href="users/new" className="btn-primary flex items-center gap-2 px-6">
          <FaPlus size={14} /> Add Specialist
        </SPALink>
      </div>
      <div className="card-elevated p-4 bg-white border border-gray-100 flex flex-col md:flex-row items-stretch md:items-center gap-4">
        <div className="input-with-icon-wrapper flex-1 group">
          <div className="input-icon-container">
            <FaSearch className="text-gray-400 group-focus-within:text-primary-500 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search by name, specialty, or email..."
            className="input-field input-field-with-icon h-12 bg-gray-50/50 focus:bg-white border-transparent focus:border-primary-500 text-base w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary h-12 px-6 shadow-sm hidden sm:flex">Filter Results</button>
        </div>
      </div>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm animate-pulse h-72 flex flex-col items-center justify-center gap-4">
              <div className="w-24 h-24 bg-gray-100 rounded-full"></div>
              <div className="h-4 bg-gray-100 w-3/4 rounded"></div>
              <div className="h-3 bg-gray-100 w-1/2 rounded"></div>
            </div>
          ))}
        </div>
      ) : doctors.length === 0 ? (
        <div className="card-elevated py-24 text-center text-gray-500 flex flex-col items-center gap-4">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-2">
            <FaUserMd size={40} />
          </div>
          <div>
            <span className="text-xl font-bold text-gray-900 block">No Specialists Found</span>
            <span className="text-sm mt-1 block">Try adjusting your search or recruit a new doctor.</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 font-sans">
          {doctors.map((doc) => (
            <div key={doc.id} className="card-elevated group hover:-translate-y-1 hover:shadow-xl transition-all duration-300 overflow-hidden relative border-gray-100 bg-white">
              <div className="h-16 bg-gradient-to-r from-primary-50 to-primary-100/50 relative">
              </div>
              <div className="px-6 pb-6 relative">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-10">
                  <div className="w-20 h-20 rounded-2xl bg-white p-1.5 shadow-xl group-hover:scale-105 transition-transform duration-300">
                    <div className="w-full h-full rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-white text-3xl font-bold shadow-inner border border-primary-500">
                      {doc.name?.charAt(0)?.toUpperCase() || 'D'}
                    </div>
                  </div>
                </div>
                <div className="mt-14 text-center">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-700 transition-colors truncate">{doc.name || 'Unknown'}</h3>
                  <div className="flex items-center justify-center gap-1.5 mt-4 text-primary-600 font-bold text-[11px] uppercase tracking-wider bg-primary-50/80 py-1.5 px-4 rounded-full w-fit mx-auto border border-primary-100">
                    <FaStethoscope size={10} />
                    <span>{doc.specialty || 'General Practice'}</span>
                  </div>
                  <div className="mt-6 flex flex-col gap-2.5">
                    {doc.email && (
                      <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-gray-400 shadow-sm">
                          <FaEnvelope size={12} />
                        </div>
                        <span className="truncate flex-1 text-left">{doc.email}</span>
                      </div>
                    )}
                    {doc.phone && (
                      <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-gray-400 shadow-sm">
                          <FaPhone size={12} />
                        </div>
                        <span className="truncate flex-1 text-left">{doc.phone}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <SPALink href={`users/${doc.id}/edit`} className="text-primary-600 font-bold text-xs hover:text-primary-800 flex items-center justify-center gap-2 group/link">
                      View Full Profile <FaChevronRight size={10} className="group-hover/link:translate-x-1 transition-transform" />
                    </SPALink>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}