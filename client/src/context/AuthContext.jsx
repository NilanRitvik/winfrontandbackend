import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showExpiryModal, setShowExpiryModal] = useState(false);

    // Timer reference to clear on logout
    useEffect(() => {
        return () => {
            if (window.sessionTimer) clearTimeout(window.sessionTimer);
        };
    }, []);

    const loadUser = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['x-auth-token'] = token;
            try {
                const res = await axios.get(`${API_BASE_URL}/auth/me`);
                setUser(res.data);
                checkSubscriptionStatus(res.data);
            } catch (error) {
                console.error("Load user failed", error);
                localStorage.removeItem('token');
                setUser(null);
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        loadUser();
    }, []);

    const checkSubscriptionStatus = (userData) => {
        if (!userData || userData.role === 'admin') return;

        if (userData.subscriptionEnd) {
            const now = new Date();
            const end = new Date(userData.subscriptionEnd);

            if (end > now) {
                // Active
                const timeLeft = end - now;
                // console.log(`Subscription active. Time left: ${timeLeft}ms`);
                startSessionTimer(timeLeft);
                setShowExpiryModal(false);
            } else {
                // Expired
                const currentPath = window.location.pathname;
                if (currentPath !== '/paywall' && currentPath !== '/login') {
                    setShowExpiryModal(true);
                }
            }
        } else {
            // No subscription
            // If strictly enforcing, maybe show modal or redirect? 
            // For now, let components handle redirect to paywall.
        }
    };

    const startSessionTimer = (duration) => {
        if (window.sessionTimer) clearTimeout(window.sessionTimer);

        // Max 32-bit integer for setTimeout (~24.8 days)
        if (duration > 2147483647) {
            return;
        }

        window.sessionTimer = setTimeout(() => {
            setShowExpiryModal(true);
            // Optionally force logout or re-check
        }, duration);
    };

    const login = (token, userData) => {
        localStorage.setItem('token', token);
        axios.defaults.headers.common['x-auth-token'] = token;
        setUser(userData);
        setShowExpiryModal(false);
        checkSubscriptionStatus(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['x-auth-token'];
        setUser(null);
        if (window.sessionTimer) clearTimeout(window.sessionTimer);
        setShowExpiryModal(false);
    };

    const refreshUser = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/auth/me`);
            setUser(res.data);
            checkSubscriptionStatus(res.data);
            return res.data;
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            logout,
            refreshUser,
            showExpiryModal,
            setShowExpiryModal
        }}>
            {children}
        </AuthContext.Provider>
    );
};
