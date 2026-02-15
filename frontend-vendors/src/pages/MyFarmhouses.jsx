import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Home, MapPin, Edit, Trash2, Eye, Loader2, Users, Bed, IndianRupee, TrendingUp } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const MyFarmhouses = () => {
    const [farmhouses, setFarmhouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchFarmhouses();
    }, []);

    const fetchFarmhouses = async () => {
        try {
            const token = localStorage.getItem('vendorToken');
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/farmhouses/my-farmhouses`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFarmhouses(res.data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch farmhouses');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this farmhouse? This action cannot be undone.')) {
            try {
                const token = localStorage.getItem('vendorToken');
                await axios.delete(`${import.meta.env.VITE_API_URL}/api/farmhouses/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setFarmhouses(prev => prev.filter(f => f._id !== id));
                toast.success('Farmhouse deleted successfully');
            } catch (error) {
                console.error(error);
                toast.error('Failed to delete farmhouse');
            }
        }
    };

    const getStats = () => {
        return {
            total: farmhouses.length,
            active: farmhouses.filter(f => f.isActive).length,
            paused: farmhouses.filter(f => !f.isActive).length
        };
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                    <p className="mt-4 text-gray-500 font-medium">Loading properties...</p>
                </div>
            </div>
        );
    }

    const stats = getStats();

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900">My Farmhouses</h1>
                    <p className="text-gray-600 mt-2">Manage your listed properties</p>
                </div>
                <Link
                    to="/dashboard/add-farmhouse"
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-all shadow-sm hover:shadow-md"
                >
                    <Plus className="h-5 w-5" />
                    Add New Property
                </Link>
            </div>

            {/* Stats Cards */}
            {farmhouses.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Home className="h-24 w-24 text-indigo-500" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 bg-indigo-50 rounded-lg">
                                    <Home className="h-5 w-5 text-indigo-600" />
                                </div>
                                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Total Properties</h3>
                            </div>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
                            <p className="text-sm text-gray-500 mt-1">Listed farmhouses</p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <TrendingUp className="h-24 w-24 text-green-500" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 bg-green-50 rounded-lg">
                                    <TrendingUp className="h-5 w-5 text-green-600" />
                                </div>
                                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Active</h3>
                            </div>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.active}</p>
                            <p className="text-sm text-gray-500 mt-1">Currently listed</p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Home className="h-24 w-24 text-gray-500" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 bg-gray-50 rounded-lg">
                                    <Home className="h-5 w-5 text-gray-600" />
                                </div>
                                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Paused</h3>
                            </div>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.paused}</p>
                            <p className="text-sm text-gray-500 mt-1">Not accepting bookings</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Properties Grid */}
            {farmhouses.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                    <div className="bg-emerald-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Home className="h-10 w-10 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">No properties listed yet</h3>
                    <p className="text-gray-500 mt-2 max-w-md mx-auto">
                        Start earning by listing your farmhouse on UtsavNest. It takes only a few minutes to get started.
                    </p>
                    <Link
                        to="/dashboard/add-farmhouse"
                        className="mt-8 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg hover:shadow-xl transition-all"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        List Your First Farmhouse
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {farmhouses.map((farmhouse) => (
                        <div key={farmhouse._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-lg transition-all flex flex-col h-full">
                            {/* Image Section */}
                            <div className="relative h-56 bg-gray-200">
                                <img
                                    src={farmhouse.images[0] || 'https://via.placeholder.com/400x300?text=No+Image'}
                                    alt={farmhouse.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-bold shadow-md text-gray-700">
                                    {farmhouse.type}
                                </div>
                                <div className={`absolute top-3 left-3 px-3 py-1.5 rounded-lg text-xs font-bold shadow-md ${farmhouse.isActive
                                        ? 'bg-green-500 text-white'
                                        : 'bg-gray-500 text-white'
                                    }`}>
                                    {farmhouse.isActive ? 'ACTIVE' : 'PAUSED'}
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                                    <div className="flex items-center text-white text-sm">
                                        <MapPin className="h-4 w-4 mr-1.5 flex-shrink-0" />
                                        <span className="truncate font-medium">{farmhouse.location.city}, {farmhouse.location.state}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Content Section */}
                            <div className="p-6 flex-1 flex flex-col">
                                <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-emerald-600 transition-colors mb-3">
                                    {farmhouse.name}
                                </h3>

                                {/* Quick Stats */}
                                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                                    <div className="flex items-center">
                                        <Users className="h-4 w-4 mr-1.5 text-gray-400" />
                                        <span>{farmhouse.capacity.guests} Guests</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Bed className="h-4 w-4 mr-1.5 text-gray-400" />
                                        <span>{farmhouse.capacity.bedrooms} Beds</span>
                                    </div>
                                </div>

                                {/* Price & Actions */}
                                <div className="mt-auto pt-4 border-t border-gray-100">
                                    <div className="flex items-end justify-between mb-4">
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium mb-1">Price for 24 hours</p>
                                            <div className="flex items-baseline gap-1">
                                                <IndianRupee className="h-4 w-4 text-emerald-600" />
                                                <span className="text-2xl font-bold text-emerald-600">{farmhouse.pricing.pricePerNight.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2">
                                        <Link
                                            to={`/dashboard/farmhouses/${farmhouse._id}`}
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-medium hover:bg-emerald-100 transition-colors"
                                        >
                                            <Eye className="h-4 w-4" />
                                            View
                                        </Link>
                                        <Link
                                            to={`/dashboard/farmhouses/edit/${farmhouse._id}`}
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors"
                                        >
                                            <Edit className="h-4 w-4" />
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(farmhouse._id)}
                                            className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyFarmhouses;
