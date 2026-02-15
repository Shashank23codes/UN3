import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkLoggedIn = async () => {
            const token = localStorage.getItem('vendorToken');
            if (token) {
                try {
                    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/vendors/me`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setUser(res.data);
                } catch (error) {
                    console.error('Auth check failed:', error);
                    localStorage.removeItem('vendorToken');
                    setUser(null);
                }
            }
            setLoading(false);
        };

        checkLoggedIn();
    }, []);

    const login = (userData) => {
        localStorage.setItem('vendorToken', userData.token);
        // We don't store the whole user object in local storage anymore
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('vendorToken');
        localStorage.removeItem('vendorInfo'); // Clean up old data if present
        setUser(null);
    };

    const updateUser = (updatedData) => {
        setUser(updatedData);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
