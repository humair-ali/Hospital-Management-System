'use client'; import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'; import { useRouter } from 'next/navigation'; import { login as apiLogin, registerPatient as apiRegisterPatient } from '@/lib/api'; const UserContext = createContext(undefined); export function UserProvider({ children }) {
    const [user, setUserState] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter(); const setUser = useCallback((newUser) => { setUserState(newUser); if (newUser) { localStorage.setItem('user', JSON.stringify(newUser)); const token = localStorage.getItem('token'); if (token) { document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax`; } } else { localStorage.removeItem('user'); localStorage.removeItem('token'); document.cookie = 'token=; path=/; max-age=0;'; } }, []); const updateUser = useCallback((updates) => { setUserState(prev => { if (!prev) return prev; const updated = { ...prev, ...updates }; localStorage.setItem('user', JSON.stringify(updated)); return updated; }); }, []); const updateProfileImage = useCallback((imageUrl) => { setUserState(prev => { if (!prev) return prev; const updated = { ...prev, profile_image: imageUrl }; localStorage.setItem('user', JSON.stringify(updated)); return updated; }); }, []); const refreshUser = useCallback(() => { const userData = localStorage.getItem('user'); if (userData) { try { setUserState(JSON.parse(userData)); } catch { } } }, []); const login = useCallback(async (email, pass, role) => { try { const response = await apiLogin(email, pass); if (response.success && response.user) { if (role && response.user.role !== role) { return { success: false, error: `Role mismatch is ${response.user.role}, not ${role}` }; } setUser(response.user); localStorage.setItem('token', response.token); document.cookie = `token=${response.token}; path=/; max-age=86400; SameSite=Lax`; return response; } return response; } catch (error) { return { success: false, error: error.message || 'Login failed' }; } }, [setUser]); const registerPatient = useCallback(async (data) => {
        try { return await apiRegisterPatient(data); } catch (error) {
            return { success: false, error: error.message || 'Registration failed' };
        }
    }, []); const logout = useCallback(() => { localStorage.removeItem('token'); localStorage.removeItem('user'); document.cookie = 'token=; path=/; max-age=0;'; setUserState(null); window.location.href = '/'; }, [router]); useEffect(() => {
        const initUser = () => {
            const userData = localStorage.getItem('user');
            if (userData) {
                try {
                    setUserState(JSON.parse(userData));
                } catch (err) {
                    console.error('Failed to parse user from storage');
                }
            }
            setLoading(false);
        };
        initUser();
    }, []);
    useEffect(() => { const handleStorageChange = (e) => { if (e.key === 'user') { if (e.newValue) { try { setUserState(JSON.parse(e.newValue)); } catch { } } else { setUserState(null); } } }; window.addEventListener('storage', handleStorageChange); return () => window.removeEventListener('storage', handleStorageChange); }, []); const contextValue = useMemo(() => ({ user, loading, setUser, updateProfileImage, updateUser, logout, refreshUser, login, registerPatient }), [user, loading, setUser, updateProfileImage, updateUser, logout, refreshUser, login, registerPatient]); return (<UserContext.Provider value={contextValue}>            {children}        </UserContext.Provider>);
} export function useUser() { const context = useContext(UserContext); if (context === undefined) { throw new Error('useUser must be used within a UserProvider'); } return context; } export function hasRole(userRole, allowedRoles) { if (!userRole) return false; if (!Array.isArray(allowedRoles)) { allowedRoles = [allowedRoles]; } return allowedRoles.includes(userRole); }