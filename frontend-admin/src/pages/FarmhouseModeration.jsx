import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Building, Check, X, Eye, MapPin, Users, Bed,
    Loader2, Filter, Search, AlertCircle, CheckCircle,
    Clock, Star, Home
} from 'lucide-react';
import { toast } from 'react-toastify';

const FarmhouseModeration = () => {
    const [loading, setLoading] = useState(true);
    const [farmhouses, setFarmhouses] = useState([]);
    const [filter, setFilter] = useState('pending');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFarmhouse, setSelectedFarmhouse] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        fetchFarmhouses();
    }, [filter]);

    const fetchFarmhouses = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/farmhouses`, config);
            let allFarmhouses = res.data;

            // Filter based on status
            if (filter === 'pending') {
                allFarmhouses = allFarmhouses.filter(fh => fh.verificationStatus === 'pending');
            } else if (filter === 'approved') {
                allFarmhouses = allFarmhouses.filter(fh => fh.verificationStatus === 'approved');
            } else if (filter === 'rejected') {
                allFarmhouses = allFarmhouses.filter(fh => fh.verificationStatus === 'rejected');
            }

            setFarmhouses(allFarmhouses);
        } catch (error) {
            console.error('Error fetching farmhouses:', error);
            toast.error('Failed to load farmhouses');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (farmhouseId) => {
        setActionLoading(farmhouseId);
        try {
            const token = localStorage.getItem('adminToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/farmhouses/${farmhouseId}/approve`, {}, config);

            toast.success('Farmhouse approved successfully!');
            fetchFarmhouses();
        } catch (error) {
            console.error('Error approving farmhouse:', error);
            toast.error('Failed to approve farmhouse');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (farmhouseId, reason = 'Does not meet listing requirements') => {
        setActionLoading(farmhouseId);
        try {
            const token = localStorage.getItem('adminToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/farmhouses/${farmhouseId}/reject`, { reason }, config);

            toast.success('Farmhouse rejected');
            fetchFarmhouses();
        } catch (error) {
            console.error('Error rejecting farmhouse:', error);
            toast.error('Failed to reject farmhouse');
        } finally {
            setActionLoading(null);
        }
    };

    const filteredFarmhouses = farmhouses.filter(fh =>
        fh.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fh.location?.city?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusBadge = (fh) => {
        if (fh.verificationStatus === 'approved') {
            return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> Approved
            </span>;
        } else if (fh.verificationStatus === 'rejected') {
            return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full flex items-center gap-1">
                <X className="h-3 w-3" /> Rejected
            </span>;
        } else {
            return <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full flex items-center gap-1">
                <Clock className="h-3 w-3" /> Pending
            </span>;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Farmhouse Moderation</h1>
                    <p className="text-gray-500 mt-1">Review and approve new property listings</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name or location..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <div className="flex gap-2">
                    {['all', 'pending', 'approved', 'rejected'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${filter === f
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats (Note: Counts only reflect current filtered set due to API logic) */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                    <p className="text-amber-600 text-sm font-medium">Pending Review</p>
                    <p className="text-2xl font-bold text-amber-700">
                        {farmhouses.filter(f => f.verificationStatus === 'pending').length}
                    </p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                    <p className="text-green-600 text-sm font-medium">Approved</p>
                    <p className="text-2xl font-bold text-green-700">
                        {farmhouses.filter(f => f.verificationStatus === 'approved').length || '—'}
                    </p>
                </div>
                <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                    <p className="text-red-600 text-sm font-medium">Rejected</p>
                    <p className="text-2xl font-bold text-red-700">
                        {farmhouses.filter(f => f.verificationStatus === 'rejected').length || '—'}
                    </p>
                </div>
            </div>

            {/* Listings */}
            {filteredFarmhouses.length === 0 ? (
                <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
                    <Building className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No Farmhouses Found</h3>
                    <p className="text-gray-500">
                        {filter === 'pending' ? 'No pending listings to review' : `No ${filter} listings`}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredFarmhouses.map((fh) => (
                        <div
                            key={fh._id}
                            className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow"
                        >
                            <div className="flex gap-4">
                                {/* Image */}
                                <div className="w-32 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                                    {fh.images?.[0] ? (
                                        <img
                                            src={fh.images[0]}
                                            alt={fh.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Home className="h-8 w-8 text-gray-300" />
                                        </div>
                                    )}
                                </div>

                                {/* Details */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-gray-900 text-lg">{fh.name}</h3>
                                                {getStatusBadge(fh)}
                                            </div>
                                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                                <MapPin className="h-3.5 w-3.5" />
                                                {fh.location?.city}, {fh.location?.state}
                                            </p>
                                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                                <span className="flex items-center gap-1">
                                                    <Users className="h-4 w-4" /> {fh.capacity?.guests || 0} guests
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Bed className="h-4 w-4" /> {fh.capacity?.bedrooms || 0} beds
                                                </span>
                                                <span className="font-semibold text-indigo-600">
                                                    ₹{fh.pricing?.pricePerNight?.toLocaleString()}/night
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        {fh.verificationStatus === 'pending' && (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleApprove(fh._id)}
                                                    disabled={actionLoading === fh._id}
                                                    className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                                                >
                                                    {actionLoading === fh._id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Check className="h-4 w-4" />
                                                    )}
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleReject(fh._id)}
                                                    disabled={actionLoading === fh._id}
                                                    className="flex items-center gap-1 px-4 py-2 bg-red-100 text-red-600 rounded-lg font-medium hover:bg-red-200 transition-colors disabled:opacity-50"
                                                >
                                                    <X className="h-4 w-4" />
                                                    Reject
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Vendor Info */}
                                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                                        <div className="text-sm text-gray-500">
                                            Listed by: <span className="font-medium text-gray-700">{fh.vendor?.name}</span>
                                            {fh.vendor?.isVerified && (
                                                <span className="ml-2 text-green-600">✓ Verified Vendor</span>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => setSelectedFarmhouse(fh)}
                                            className="text-sm text-indigo-600 font-medium hover:underline flex items-center gap-1"
                                        >
                                            <Eye className="h-4 w-4" />
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Detail Modal */}
            {selectedFarmhouse && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="relative h-48">
                            {selectedFarmhouse.images?.[0] ? (
                                <img
                                    src={selectedFarmhouse.images[0]}
                                    alt={selectedFarmhouse.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                    <Home className="h-16 w-16 text-gray-400" />
                                </div>
                            )}
                            <button
                                onClick={() => setSelectedFarmhouse(null)}
                                className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
                            >
                                <X className="h-5 w-5 text-gray-600" />
                            </button>
                        </div>
                        <div className="p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedFarmhouse.name}</h2>
                            <p className="text-gray-500 mb-4">{selectedFarmhouse.description}</p>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-sm text-gray-500">Location</p>
                                    <p className="font-medium">{selectedFarmhouse.location?.city}, {selectedFarmhouse.location?.state}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-sm text-gray-500">Price</p>
                                    <p className="font-medium">₹{selectedFarmhouse.pricing?.pricePerNight?.toLocaleString()}/night</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-sm text-gray-500">Capacity</p>
                                    <p className="font-medium">{selectedFarmhouse.capacity?.guests} guests, {selectedFarmhouse.capacity?.bedrooms} bedrooms</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-sm text-gray-500">Vendor</p>
                                    <p className="font-medium">{selectedFarmhouse.vendor?.name}</p>
                                </div>
                            </div>

                            {selectedFarmhouse.amenities?.length > 0 && (
                                <div className="mb-6">
                                    <p className="text-sm font-medium text-gray-700 mb-2">Amenities</p>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedFarmhouse.amenities.map((amenity, i) => (
                                            <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-sm">
                                                {amenity}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedFarmhouse.verificationStatus === 'pending' && (
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            handleApprove(selectedFarmhouse._id);
                                            setSelectedFarmhouse(null);
                                        }}
                                        className="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700"
                                    >
                                        Approve Listing
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleReject(selectedFarmhouse._id);
                                            setSelectedFarmhouse(null);
                                        }}
                                        className="flex-1 py-3 bg-red-100 text-red-600 rounded-xl font-semibold hover:bg-red-200"
                                    >
                                        Reject Listing
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FarmhouseModeration;
