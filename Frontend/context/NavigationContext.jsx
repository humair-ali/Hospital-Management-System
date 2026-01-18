'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from './UserContext';
const NavigationContext = createContext(undefined);
export function NavigationProvider({ children, initialView = 'dashboard/admin' }) {
    const [currentView, setCurrentView] = useState(initialView);
    const { user } = useUser();
    useEffect(() => {
        const handlePopState = () => {
            const path = window.location.pathname;
            if (path.includes('/dashboard/')) {
                const parts = path.split('/dashboard/')[1];
                if (parts) {
                    setCurrentView(parts);
                    return;
                }
            }
            const featureMatch = path.match(/\/dashboard\/(users|patients|doctors|appointments|medical-records|billing|reports)(.*)$/);
            if (featureMatch) {
                const subPath = featureMatch[1] + (featureMatch[2] || '');
                setCurrentView(subPath);
                return;
            }
            const role = (user?.role && user.role !== 'undefined') ? user.role : 'admin';
            setCurrentView(`dashboard/${role}`);
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [user]);
    const navigateTo = (view) => {
        if (!view || view === 'undefined' || view.includes('/undefined')) {
            console.warn('Prevented navigation to undefined view:', view);
            view = 'dashboard/admin';
        }
        setCurrentView(view);
        if (typeof window !== 'undefined') {
            
            let url;
            if (view.startsWith('dashboard/')) {
                url = `/${view}`;
            } else if (view === 'users' || view === 'patients' || view === 'doctors' || view === 'appointments' || view === 'medical-records' || view === 'billing' || view === 'reports' || view.startsWith('users/') || view.startsWith('patients/') || view.startsWith('doctors/') || view.startsWith('appointments/') || view.startsWith('medical-records/') || view.startsWith('billing/') || view.startsWith('reports/')) {
                url = `/dashboard/${view}`;
            } else if (view.startsWith('/')) {
                url = view;
            } else {
                url = `/dashboard/${view}`;
            }
            window.history.pushState({}, '', url);
        }
    };
    return (
        <NavigationContext.Provider value={{ currentView, navigateTo }}>
            {children}
        </NavigationContext.Provider>
    );
}
export function useNavigation() {
    const context = useContext(NavigationContext);
    if (context === undefined) {
        throw new Error('useNavigation must be used within a NavigationProvider');
    }
    return context;
}