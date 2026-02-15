import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const userInfo = localStorage.getItem('userInfo');
        return userInfo ? JSON.parse(userInfo) : null;
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('userToken');
            const userInfo = localStorage.getItem('userInfo');

            if (token) {
                try {
                    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/me`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const userData = { ...res.data, token };
                    setUser(prev => {
                        const isDifferent = JSON.stringify(prev) !== JSON.stringify(userData);
                        return isDifferent ? userData : prev;
                    });
                    localStorage.setItem('userInfo', JSON.stringify(userData));
                } catch (error) {
                    console.error('Error fetching user profile:', error);
                    if (userInfo && !user) {
                        setUser(JSON.parse(userInfo));
                    }
                }
            }
            setLoading(false);
        };

        fetchUser();
    }, []);

    const login = (userData) => {
        localStorage.setItem('userToken', userData.token);
        localStorage.setItem('userInfo', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userInfo');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
