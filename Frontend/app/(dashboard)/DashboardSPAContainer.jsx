'use client';
import dynamic from 'next/dynamic';
import { useNavigation } from '@/context/NavigationContext';
import { useUser } from '@/context/UserContext';
import { LoadingState } from '@/components/ui/LoadingState';


import AdminDashboard from './dashboard/admin/page';
import DoctorDashboard from './dashboard/doctor/page';
import NurseDashboard from './dashboard/nurse/page';
import ReceptionistDashboard from './dashboard/receptionist/page';
import AccountantDashboard from './dashboard/accountant/page';
import PatientDashboard from './dashboard/patient/page';

import UsersPage from './users/page';
import PatientsPage from './patients/page';
import DoctorsPage from './doctors/page';
import AppointmentsPage from './appointments/page';
import MedicalRecordsPage from './medical-records/page';
import BillingPage from './billing/page';
import ReportsPage from './reports/page';


const dynamicPage = (importFn) => dynamic(importFn, {
    loading: () => <LoadingState message="Accelerating Interface..." />,
    ssr: false
});


const NewUserPage = dynamicPage(() => import('./users/new/page'));
const EditUserPage = dynamicPage(() => import('./users/[id]/edit/page'));
const NewPatientPage = dynamicPage(() => import('./patients/new/page'));
const PatientDetailPage = dynamicPage(() => import('./patients/[id]/page'));
const NewAppointmentPage = dynamicPage(() => import('./appointments/new/page'));
const NewMedicalRecordPage = dynamicPage(() => import('./medical-records/new/page'));
const EditMedicalRecordPage = dynamicPage(() => import('./medical-records/[id]/edit/page'));
const NewBillPage = dynamicPage(() => import('./billing/new/page'));
const BillDetailPage = dynamicPage(() => import('./billing/[id]/page'));
const MyBillsPage = dynamicPage(() => import('./billing/my-bills/page'));

const PERMISSIONS = {
    'dashboard/admin': ['admin'],
    'dashboard/doctor': ['admin', 'doctor'],
    'dashboard/nurse': ['admin', 'nurse'],
    'dashboard/receptionist': ['admin', 'receptionist'],
    'dashboard/accountant': ['admin', 'accountant'],
    'dashboard/patient': ['admin', 'patient'],
    'users': ['admin'],
    'patients': ['admin', 'doctor', 'nurse', 'receptionist'],
    'patients/new': ['admin', 'receptionist'],
    'doctors': ['admin', 'doctor', 'nurse', 'receptionist'], 
    'appointments': ['admin', 'doctor', 'nurse', 'receptionist', 'patient'],
    'appointments/new': ['admin', 'receptionist', 'patient'],
    'medical-records': ['admin', 'doctor', 'nurse', 'patient'],
    'medical-records/new': ['admin', 'doctor'],
    'billing': ['admin', 'accountant'], 
    'billing/my-bills': ['doctor', 'patient'], 
    'billing/new': ['admin', 'accountant'],
    'reports': ['admin', 'accountant', 'doctor']
};

const AccessForbidden = ({ role }) => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 animate-in zoom-in duration-300">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0 0v2m0-2h2m-2 0H10m11 3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Forbidden</h1>
        <p className="text-gray-600 max-w-md mx-auto mb-8">
            Your current role (<span className="font-semibold text-red-600 uppercase italic">{role}</span>) is not authorized
            to access this module. If you believe this is an error, contact System Administration.
        </p>
        <button
            onClick={() => window.location.href = `/dashboard`}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200"
        >
            Return to Authorized Dashboard
        </button>
    </div>
);

export default function DashboardSPAContainer() {
    const { currentView: rawView } = useNavigation();
    const { user, loading: authLoading } = useUser();

    if (authLoading) {
        return <LoadingState message="Authenticating Session..." />;
    }

    
    const currentView = rawView.replace(/^dashboard\/(users|patients|doctors|appointments|medical-records|billing|reports|profile)/, '$1');

    const renderView = () => {
        const userRole = user?.role || 'patient';

        
        const baseView = currentView.split('?')[0]; 
        const allowedRoles = PERMISSIONS[baseView];

        
        const getPermissionBase = (view) => {
            if (view.startsWith('users/')) return 'users';
            if (view.startsWith('patients/')) return 'patients';
            if (view.startsWith('medical-records/')) return 'medical-records';
            if (view.startsWith('billing/')) return 'billing';
            return view;
        };

        const effectiveBase = allowedRoles ? baseView : getPermissionBase(baseView);
        const finalAllowed = PERMISSIONS[effectiveBase];

        if (finalAllowed && !finalAllowed.includes(userRole)) {
            return <AccessForbidden role={userRole} />;
        }

        switch (currentView) {
            case 'dashboard/admin': return <AdminDashboard />;
            case 'dashboard/doctor': return <DoctorDashboard />;
            case 'dashboard/nurse': return <NurseDashboard />;
            case 'dashboard/receptionist': return <ReceptionistDashboard />;
            case 'dashboard/accountant': return <AccountantDashboard />;
            case 'dashboard/patient': return <PatientDashboard />;
            case 'users': return <UsersPage />;
            case 'patients': return <PatientsPage />;
            case 'doctors': return <DoctorsPage />;
            case 'appointments': return <AppointmentsPage />;
            case 'medical-records': return <MedicalRecordsPage />;
            case 'billing': return <BillingPage />;
            case 'billing/my-bills': return <MyBillsPage />;
            case 'reports': return <ReportsPage />;
            case 'users/new': return <NewUserPage />;
            case 'patients/new': return <NewPatientPage />;
            case 'appointments/new': return <NewAppointmentPage />;
            case 'medical-records/new': return <NewMedicalRecordPage />;
            case 'billing/new': return <NewBillPage />;
        }

        let match;
        match = currentView.match(/^users\/([^\/]+)\/edit$/);
        if (match) return <EditUserPage id={match[1]} />;

        match = currentView.match(/^medical-records\/([^\/]+)\/edit$/);
        if (match) return <EditMedicalRecordPage id={match[1]} />;

        match = currentView.match(/^patients\/([^\/\?]+)$/);
        if (match && match[1] !== 'new') return <PatientDetailPage id={match[1]} />;

        match = currentView.match(/^billing\/([^\/\?]+)$/);
        if (match && match[1] !== 'new') return <BillDetailPage id={match[1]} />;

        if (currentView.startsWith('medical-records/new')) {
            const urlParams = new URLSearchParams(currentView.split('?')[1] || '');
            return <NewMedicalRecordPage patientId={urlParams.get('patient_id')} />;
        }

        const role = user?.role || 'admin';
        switch (role) {
            case 'admin': return <AdminDashboard />;
            case 'doctor': return <DoctorDashboard />;
            case 'nurse': return <NurseDashboard />;
            case 'receptionist': return <ReceptionistDashboard />;
            case 'accountant': return <AccountantDashboard />;
            case 'patient': return <PatientDashboard />;
            default: return <AdminDashboard />;
        }
    };

    return (
        <div className="dashboard-spa-content animate-in fade-in duration-200">
            {renderView()}
        </div>
    );
}