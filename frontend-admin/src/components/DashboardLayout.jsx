import React from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Users, FileCheck, CreditCard, Calendar, LogOut, Store, Bell,
    BarChart3, Building, Settings, FileSpreadsheet
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const DashboardLayout = () => {
    const { logout } = useAuth();
    const { unreadCount } = useNotification();
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/analytics', icon: BarChart3, label: 'Analytics' },
        { path: '/vendors', icon: Store, label: 'Vendors' },
        { path: '/users', icon: Users, label: 'Users' },
        { path: '/bookings', icon: Calendar, label: 'Bookings' },
        { path: '/farmhouses', icon: Building, label: 'Moderation' },
        { path: '/earnings', icon: FileCheck, label: 'Earnings' },
        { path: '/payouts', icon: CreditCard, label: 'Payouts' },
        { path: '/reports', icon: FileSpreadsheet, label: 'Reports' },
        { path: '/settings', icon: Settings, label: 'Settings' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="h-screen bg-gray-50 flex overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-100 flex-shrink-0 fixed h-full z-50 hidden md:flex flex-col">
                <div className="h-20 flex items-center px-8 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="bg-emerald-600 p-2 rounded-lg">
                            <Store className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xl font-bold text-gray-800 tracking-tight">Admin</span>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-hide">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/'}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-emerald-50 text-emerald-600 font-semibold shadow-sm'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                }`
                            }
                        >
                            <item.icon className={`h-5 w-5 transition-colors ${location.pathname === item.path ? 'text-emerald-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-gray-500 hover:bg-rose-50 hover:text-rose-600 transition-all duration-200"
                    >
                        <LogOut className="h-5 w-5" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden md:pl-64">
                {/* Header */}
                <header className="bg-white border-b border-gray-100 h-20 flex items-center justify-between px-8 sticky top-0 z-40 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-800">
                        {navItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
                    </h2>
                    <div className="flex items-center gap-4">
                        <div
                            onClick={() => navigate('/notifications')}
                            className="h-10 w-10 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 cursor-pointer transition-all relative"
                        >
                            <span className="sr-only">Notifications</span>
                            <div className="relative">
                                <Bell className="h-5 w-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-white shadow-sm animate-pulse">
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                            A
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-8 scrollbar-hide">
                    <div className="max-w-6xl mx-auto animate-fadeIn">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
