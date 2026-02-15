import React, { useState } from 'react';
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Home,
    Calendar,
    DollarSign,
    User,
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
    Search,
    PlusCircle,
    Shield,
    FileText,
    BarChart3,
    CalendarDays
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';

const DashboardLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        toast.info('Logged out successfully');
        navigate('/login');
    };

    const navItems = [
        { name: 'Overview', icon: LayoutDashboard, path: '/dashboard' },
        { name: 'Analytics', icon: BarChart3, path: '/dashboard/analytics' },
        { name: 'My Farmhouses', icon: Home, path: '/dashboard/farmhouses' },
        { name: 'Bookings', icon: Calendar, path: '/dashboard/bookings' },
        { name: 'Calendar View', icon: CalendarDays, path: '/dashboard/calendar' },
        { name: 'Earnings', icon: DollarSign, path: '/dashboard/earnings' },
        { name: 'Payout Policy', icon: FileText, path: '/dashboard/payout-policy' },
        { name: 'Add Farmhouse', icon: PlusCircle, path: '/dashboard/add-farmhouse' },
        { name: 'Account Verification', icon: Shield, path: '/dashboard/kyc' },
        { name: 'Profile', icon: User, path: '/dashboard/profile' },
        { name: 'Settings', icon: Settings, path: '/dashboard/settings' },
    ];

    if (!user) return null; // Or a loading spinner

    return (
        <div className="h-screen bg-gray-50 flex overflow-hidden">
            {/* Sidebar - Desktop */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
                    <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                            <Home className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-gray-900">UtsavNest</span>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-500 hover:text-gray-700">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-4 flex flex-col h-[calc(100%-4rem)] justify-between">
                    <div className="flex-1 overflow-y-auto mb-4 scrollbar-hide">
                        <div className="flex items-center space-x-3 mb-8 p-3 bg-emerald-50 rounded-xl">
                            <img
                                src={user?.profileImage || `https://ui-avatars.com/api/?name=${user?.name}&background=10b981&color=fff`}
                                alt="Profile"
                                className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm"
                            />
                            <div className="overflow-hidden">
                                <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                            </div>
                        </div>

                        <nav className="space-y-1">
                            {navItems.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.path}
                                        className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive
                                            ? 'bg-emerald-50 text-emerald-700'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                    >
                                        <item.icon className={`h-5 w-5 mr-3 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`} />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                        <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        >
                            <LogOut className="h-5 w-5 mr-3" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
                    <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-700">
                        <Menu className="h-6 w-6" />
                    </button>

                    <div className="flex-1 flex justify-end items-center space-x-4">
                        <div className="relative hidden sm:block">
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-64 pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 text-sm"
                            />
                            <Search className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
                        </div>

                        <NotificationDropdown />
                    </div>
                </header>

                {/* Dynamic Content */}
                <main className="flex-1 overflow-y-auto scrollbar-hide">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
