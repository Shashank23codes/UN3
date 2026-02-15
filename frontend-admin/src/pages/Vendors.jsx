import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Search,
    Filter,
    CheckCircle,
    XCircle,
    ShieldCheck,
    Mail,
    Phone,
    Building2,
    MoreVertical,
    Download,
    User,
    ArrowRight
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { exportToCSV } from '../utils/exportHelper';

const Vendors = () => {
    const [vendors, setVendors] = useState([]);
    const [filteredVendors, setFilteredVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'verified', 'unverified'

    useEffect(() => {
        fetchVendors();
    }, []);

    useEffect(() => {
        filterVendors();
    }, [vendors, searchTerm, statusFilter]);

    const fetchVendors = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/admin/vendors`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setVendors(res.data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch vendors');
        } finally {
            setLoading(false);
        }
    };

    const filterVendors = () => {
        let filtered = vendors;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(vendor =>
                vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                vendor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                vendor.businessDetails?.name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            const isVerified = statusFilter === 'verified';
            filtered = filtered.filter(vendor => vendor.isVerified === isVerified);
        }

        setFilteredVendors(filtered);
    };

    const getStats = () => {
        return {
            total: vendors.length,
            verified: vendors.filter(v => v.isVerified).length,
            unverified: vendors.filter(v => !v.isVerified).length
        };
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
                    <p className="mt-4 text-gray-500 font-medium">Loading vendors...</p>
                </div>
            </div>
        );
    }

    const stats = getStats();

    const handleExport = () => {
        const headers = ['ID', 'Name', 'Email', 'Phone', 'Business Name', 'Business Type', 'Verified', 'Joined Date'];
        const data = filteredVendors.map(v => [
            v._id,
            v.name,
            v.email,
            v.phone || 'N/A',
            v.businessDetails?.name || 'N/A',
            v.businessDetails?.type || 'N/A',
            v.isVerified ? 'Yes' : 'No',
            new Date(v.createdAt).toLocaleDateString()
        ]);
        exportToCSV(data, headers, `vendors_export_${new Date().toISOString().split('T')[0]}.csv`);
        toast.success('Vendor list exported successfully');
    };

    return (
        <div className="p-6 md:p-8 max-w-[1600px] mx-auto bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Vendor Management</h1>
                    <p className="text-gray-500 mt-1">Oversee vendor accounts and verification status</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        <Download className="h-4 w-4" />
                        Export List
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <User className="h-24 w-24 text-indigo-500" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-indigo-50 rounded-lg">
                                <User className="h-5 w-5 text-indigo-600" />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Total Vendors</h3>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
                        <p className="text-sm text-gray-500 mt-1">Registered partners</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <CheckCircle className="h-24 w-24 text-green-500" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-green-50 rounded-lg">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Verified Vendors</h3>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.verified}</p>
                        <p className="text-sm text-gray-500 mt-1">Active and approved</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <ShieldCheck className="h-24 w-24 text-orange-500" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-orange-50 rounded-lg">
                                <ShieldCheck className="h-5 w-5 text-orange-600" />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Pending Verification</h3>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.unverified}</p>
                        <p className="text-sm text-gray-500 mt-1">Awaiting admin approval</p>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Filters */}
                <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/50">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search vendors..."
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
                                <option value="verified">Verified</option>
                                <option value="unverified">Unverified</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Vendors Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Vendor Details</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Business Info</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Verification</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined Date</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredVendors.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                                                <User className="h-8 w-8 text-gray-400" />
                                            </div>
                                            <h3 className="text-lg font-medium text-gray-900">No vendors found</h3>
                                            <p className="text-gray-500 mt-1">Try adjusting your search or filters</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredVendors.map((vendor) => (
                                    <tr key={vendor._id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-start gap-3">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center flex-shrink-0 text-indigo-600 font-bold text-sm">
                                                    {vendor.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{vendor.name}</p>
                                                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                                        <Mail className="h-3 w-3" />
                                                        {vendor.email}
                                                    </div>
                                                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                                                        <Phone className="h-3 w-3" />
                                                        {vendor.phone}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-900">{vendor.businessDetails?.name || 'N/A'}</span>
                                                <span className="text-xs text-gray-500 capitalize flex items-center gap-1 mt-1">
                                                    <Building2 className="h-3 w-3" />
                                                    {vendor.businessDetails?.type?.replace('_', ' ') || 'Individual'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {vendor.isVerified ? (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                    Verified
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-100">
                                                    <ShieldCheck className="h-3 w-3 mr-1" />
                                                    Unverified
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(vendor.createdAt).toLocaleDateString('en-IN', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                to={`/vendors/${vendor._id}`}
                                                className="inline-flex items-center px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm group-hover:border-indigo-200 group-hover:text-indigo-600"
                                            >
                                                View Details
                                                <ArrowRight className="h-3 w-3 ml-1" />
                                            </Link>
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

export default Vendors;
