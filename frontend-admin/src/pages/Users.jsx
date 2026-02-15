import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, User, Mail, Phone, Calendar,
    Shield, ShieldAlert, Eye, Download,
    CheckCircle, XCircle, Filter, UserCheck, Users as UsersIcon
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { exportToCSV } from '../utils/exportHelper';

const Users = () => {
    const navigate = useNavigate();
    const { token } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // all, active, banned

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/admin/users`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setUsers(response.data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (userId, currentStatus) => {
        if (!window.confirm(`Are you sure you want to ${currentStatus ? 'unban' : 'ban'} this user?`)) return;

        try {
            await axios.put(
                `${import.meta.env.VITE_API_URL}/api/admin/users/${userId}/status`,
                { isBanned: !currentStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(`User ${currentStatus ? 'unbanned' : 'banned'} successfully`);
            fetchUsers();
        } catch (error) {
            console.error(error);
            toast.error('Failed to update user status');
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'active' && !user.isBanned) ||
            (statusFilter === 'banned' && user.isBanned);

        return matchesSearch && matchesStatus;
    });

    const getStats = () => {
        return {
            total: users.length,
            active: users.filter(u => !u.isBanned).length,
            banned: users.filter(u => u.isBanned).length
        };
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
                    <p className="mt-4 text-gray-500 font-medium">Loading users...</p>
                </div>
            </div>
        );
    }

    const stats = getStats();

    const handleExport = () => {
        const headers = ['ID', 'Name', 'Email', 'Phone', 'Status', 'Joined Date'];
        const data = filteredUsers.map(u => [
            u._id,
            u.name,
            u.email,
            u.phone || 'N/A',
            u.isBanned ? 'Banned' : 'Active',
            new Date(u.createdAt).toLocaleDateString()
        ]);
        exportToCSV(data, headers, `users_export_${new Date().toISOString().split('T')[0]}.csv`);
        toast.success('Users list exported successfully');
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Users Management</h1>
                    <p className="text-gray-500 mt-1">Manage all registered users on the platform</p>
                </div>
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                >
                    <Download className="h-4 w-4" />
                    Export Users
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <UsersIcon className="h-24 w-24 text-indigo-500" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-indigo-50 rounded-lg">
                                <UsersIcon className="h-5 w-5 text-indigo-600" />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Total Users</h3>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
                        <p className="text-sm text-gray-500 mt-1">Registered customers</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <UserCheck className="h-24 w-24 text-green-500" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-green-50 rounded-lg">
                                <UserCheck className="h-5 w-5 text-green-600" />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Active Users</h3>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.active}</p>
                        <p className="text-sm text-gray-500 mt-1">Can make bookings</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <ShieldAlert className="h-24 w-24 text-red-500" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-red-50 rounded-lg">
                                <ShieldAlert className="h-5 w-5 text-red-600" />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Banned Users</h3>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.banned}</p>
                        <p className="text-sm text-gray-500 mt-1">Restricted access</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Filters */}
                <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/50">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative w-full md:w-48">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full pl-10 pr-8 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none cursor-pointer transition-all"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="banned">Banned</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined Date</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                                                <User className="h-8 w-8 text-gray-400" />
                                            </div>
                                            <h3 className="text-lg font-medium text-gray-900">No users found</h3>
                                            <p className="text-gray-500 mt-1">Try adjusting your search or filters</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-600 font-bold text-sm flex-shrink-0">
                                                    {user.picture ? (
                                                        <img src={user.picture} alt={user.name} className="h-10 w-10 rounded-full object-cover" />
                                                    ) : (
                                                        user.name.charAt(0).toUpperCase()
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{user.name}</p>
                                                    <p className="text-xs text-gray-500">ID: {user._id.slice(-6)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Mail className="h-3.5 w-3.5 text-gray-400" />
                                                    {user.email}
                                                </div>
                                                {user.phone && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Phone className="h-3.5 w-3.5 text-gray-400" />
                                                        {user.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(user.createdAt).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {user.isBanned ? (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                                                    <ShieldAlert className="h-3 w-3 mr-1" />
                                                    Banned
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                    Active
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => navigate(`/users/${user._id}`)}
                                                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleStatus(user._id, user.isBanned)}
                                                    className={`p-2 rounded-lg transition-colors ${user.isBanned
                                                        ? 'text-green-600 hover:bg-green-50'
                                                        : 'text-red-400 hover:text-red-600 hover:bg-red-50'
                                                        }`}
                                                    title={user.isBanned ? "Unban User" : "Ban User"}
                                                >
                                                    {user.isBanned ? (
                                                        <Shield className="h-4 w-4" />
                                                    ) : (
                                                        <ShieldAlert className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Users;
