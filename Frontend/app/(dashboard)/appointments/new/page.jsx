'use client';
import { useState, useEffect } from 'react';
import { useNavigation } from '@/context/NavigationContext';
import { createAppointment, getPatients, getDoctors } from '@/lib/api';
import { toast } from 'react-toastify';
import {
  FaCalendarAlt, FaUser, FaUserMd, FaClock,
  FaNotesMedical, FaCheckCircle, FaChevronRight,
  FaFilePrescription
} from 'react-icons/fa';
export default function NewAppointmentPage() {
  const { navigateTo } = useNavigation();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    appointment_date: '',
    appointment_time: '',
    reason: '',
    duration_minutes: 30
  });
  useEffect(() => {
    async function loadData() {
      try {
        const [pRes, dRes] = await Promise.all([getPatients({ limit: 100 }), getDoctors({})]);
        setPatients(pRes.data || []);
        setDoctors(dRes.data || []);
      } catch (err) {
        console.error('Core clinical data sync failure:', err);
        toast.error('System Data Retrieval Failure');
      } finally {
        setDataLoading(false);
      }
    }
    loadData();
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.appointment_date || !formData.appointment_time) {
      return toast.error('Temporal parameters required');
    }
    setLoading(true);
    try {
      const scheduled_at = `${formData.appointment_date}T${formData.appointment_time}:00`;
      const payload = {
        patient_id: parseInt(formData.patient_id),
        doctor_id: parseInt(formData.doctor_id),
        scheduled_at,
        duration_minutes: formData.duration_minutes,
        reason: formData.reason
      };
      await createAppointment(payload);
      toast.success('Appointment Added', { autoClose: 1000 });
      navigateTo('appointments');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
      setLoading(false);
    }
  };
  if (dataLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="loading-spinner h-12 w-12"></div>
      <p className="text-sm font-bold text-gray-500 uppercase tracking-widest animate-pulse">Synchronizing Clinical Directories...</p>
    </div>
  );
  return (
    <div className="max-w-4xl mx-auto py-4 animate-in fade-in zoom-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-8 mb-10">
        <div>
          <span className="text-xs font-bold tracking-widest text-primary-600 uppercase mb-1 block">Scheduling Module</span>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center shadow-sm">
            </div>
            Book Appointment
          </h1>
          <p className="text-gray-500 mt-2 text-sm font-medium">Coordinate clinical encounters and practitioner throughput</p>
        </div>
        <button onClick={() => navigateTo('appointments')} className="btn-secondary h-11 px-6 font-bold shadow-sm">
          Cancel Protocol
        </button>
      </div>
      <form onSubmit={handleSubmit} className="card-elevated p-8 bg-white border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="space-y-8">
          { }
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest border-b border-gray-100 pb-3 mb-6 flex items-center gap-2">
              Appointment Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label className="form-label-premium">Patient Name</label>
                <div className="relative group">
                  <select
                    required
                    className="input-field-premium pl-12 bg-white appearance-none"
                    value={formData.patient_id}
                    onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                  >
                    <option value="">Select Patient...</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.name} (MRN)</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label-premium">Doctor</label>
                <div className="relative group">
                  <select
                    required
                    className="input-field-premium pl-12 bg-white appearance-none"
                    value={formData.doctor_id}
                    onChange={(e) => setFormData({ ...formData, doctor_id: e.target.value })}
                  >
                    <option value="">Select Doctor...</option>
                    {doctors.map(d => <option key={d.id} value={d.id}>Dr. {d.name} ({d.specialty})</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>
          { }
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest border-b border-gray-100 pb-3 mb-6 flex items-center gap-2">
              Schedule
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="form-group">
                <label className="form-label-premium">Date</label>
                <div className="relative group">
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="input-field-premium pl-12"
                    value={formData.appointment_date}
                    onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label-premium">Time</label>
                <div className="relative group">
                  <input
                    type="time"
                    required
                    className="input-field-premium pl-12"
                    value={formData.appointment_time}
                    onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label-premium">Duration</label>
                <div className="relative group">
                  <select
                    className="input-field-premium bg-white appearance-none"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                  >
                    <option value={15}>15 Minutes</option>
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes</option>
                    <option value={60}>1 Hour</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          { }
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest border-b border-gray-100 pb-3 mb-6 flex items-center gap-2">
              Reason for Visit
            </h3>
            <textarea
              required
              className="w-full h-32 bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-900 placeholder-gray-400 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 transition-all font-medium text-sm"
              placeholder="Briefly describe the reason for this appointment..."
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            />
          </div>
          <div className="pt-4 flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigateTo('appointments')}
              className="btn-secondary h-12 px-8"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary h-12 px-8 shadow-lg shadow-primary-500/20"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="loading-spinner h-4 w-4 border-2"></div>
                  <span>Booking...</span>
                </div>
              ) : (
                'Confirm Booking'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}