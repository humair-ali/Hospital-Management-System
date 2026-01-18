'use client';
import { useState, useEffect, createContext, useContext } from 'react';
import { useUser } from '@/context/UserContext';
import AdminDashboard from './admin/page';
import DoctorDashboard from './doctor/page';
import NurseDashboard from './nurse/page';
import ReceptionistDashboard from './receptionist/page';
import AccountantDashboard from './accountant/page';
import PatientDashboard from './patient/page';
const NavigationContext = createContext(null);
export function useInstantNav() {
    return useContext(NavigationContext);
}
export default function DashboardSPA() {
    const { user } = useUser();
    const [currentView, setCurrentView] = useState(() => {
        if (typeof window !== 'undefined') {
            const path = window.location.pathname;
            if (path.includes('/dashboard/admin')) return 'admin';
            if (path.includes('/dashboard/doctor')) return 'doctor';
            if (path.includes('/dashboard/nurse')) return 'nurse';
            if (path.includes('/dashboard/receptionist')) return 'receptionist';
            if (path.includes('/dashboard/accountant')) return 'accountant';
            if (path.includes('/dashboard/patient')) return 'patient';
        }
        return user?.role || 'admin';
    });
    const navigateTo = (view) => {
        setCurrentView(view);
        if (typeof window !== 'undefined') {
            window.history.pushState({}, '', `/dashboard/${view}`);
        }
    };
    const renderDashboard = () => {
        switch (currentView) {
            case 'admin':
                return <AdminDashboard />;
            case 'doctor':
                return <DoctorDashboard />;
            case 'nurse':
                return <NurseDashboard />;
            case 'receptionist':
                return <ReceptionistDashboard />;
            case 'accountant':
                return <AccountantDashboard />;
            case 'patient':
                return <PatientDashboard />;
            default:
                return <AdminDashboard />;
        }
    };
    return (
        <NavigationContext.Provider value={{ currentView, navigateTo }}>
            <div className="instant-spa-container">
                {renderDashboard()}
            </div>
        </NavigationContext.Provider>
    );
}