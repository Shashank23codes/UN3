import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAdmin(res.data);
            } catch (error) {
                console.error('Auth check failed:', error);
                localStorage.removeItem('adminToken');
            }
        }
        setLoading(false);
    };

    const login = async (email, password, secretKey) => {
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/login`, {
            email,
            password,
            secretKey
        });
        localStorage.setItem('adminToken', res.data.token);
        setAdmin(res.data);
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem('adminToken');
        setAdmin(null);
    };

    const value = {
        admin,
        loading,
        login,
        logout,
        isAuthenticated: !!admin,
        token: localStorage.getItem('adminToken')
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
