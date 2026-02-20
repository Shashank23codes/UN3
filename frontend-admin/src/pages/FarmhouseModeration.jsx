import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Building, Check, X, Eye, MapPin, Users, Bed, Bath,
    Loader2, Search, CheckCircle, Clock, Star, Home,
    Phone, Mail, ShieldCheck, ShieldAlert, IndianRupee,
    ChevronLeft, ChevronRight, RotateCcw, AlertTriangle,
    Calendar, Image as ImageIcon, Tag, Wifi
} from 'lucide-react';
import { toast } from 'react-toastify';

const STATUS_CONFIG = {
    approved: {
        label: 'Approved',
        badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        icon: CheckCircle,
        dot: 'bg-emerald-500'
    },
    rejected: {
        label: 'Rejected',
        badge: 'bg-red-100 text-red-700 border-red-200',
        icon: X,
        dot: 'bg-red-500'
    },
    pending: {
        label: 'Pending Review',
        badge: 'bg-amber-100 text-amber-700 border-amber-200',
        icon: Clock,
        dot: 'bg-amber-500'
    }
};

const StatusBadge = ({ status }) => {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.badge}`}>
            <Icon className="h-3 w-3" />
            {cfg.label}
        </span>
    );
};

const RejectModal = ({ onConfirm, onCancel, title = 'Reject Farmhouse', defaultReason = '' }) => {
    const [reason, setReason] = useState(defaultReason);
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-red-50 rounded-xl">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                </div>
                <p className="text-sm text-gray-500 mb-4">Please provide a reason that will be sent to the vendor.</p>
                <textarea
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    rows={3}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                    placeholder="e.g. Images are low quality, missing amenity details..."
                />
                <div className="flex gap-3 mt-4">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onConfirm(reason || 'Does not meet listing requirements')}
                        className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

const ImageGallery = ({ images, name }) => {
    const [current, setCurrent] = useState(0);
    if (!images?.length) return (
        <div className="w-full h-64 bg-gray-100 flex items-center justify-center rounded-xl">
            <ImageIcon className="h-10 w-10 text-gray-300" />
        </div>
    );
    return (
        <div className="relative rounded-xl overflow-hidden">
            <img src={images[current]} alt={name} className="w-full h-64 object-cover" />
            {images.length > 1 && (
                <>
                    <button
                        onClick={() => setCurrent(i => (i - 1 + images.length) % images.length)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => setCurrent(i => (i + 1) % images.length)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                        {images.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrent(i)}
                                className={`h-1.5 rounded-full transition-all ${i === current ? 'w-5 bg-white' : 'w-1.5 bg-white/50'}`}
                            />
                        ))}
                    </div>
                </>
            )}
            <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-lg">
                {current + 1}/{images.length}
            </div>
        </div>
    );
};

const DetailModal = ({ farmhouse, onClose, onApprove, onReject, onRevoke, actionLoading }) => {
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showRevokeModal, setShowRevokeModal] = useState(false);

    if (!farmhouse) return null;

    const fh = farmhouse;
    const status = fh.verificationStatus;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{fh.name}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <StatusBadge status={status} />
                            <span className="text-xs text-gray-500">{fh.type}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Image Gallery */}
                    <ImageGallery images={fh.images} name={fh.name} />

                    {/* Rejection Reason Alert */}
                    {status === 'rejected' && fh.rejectionReason && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                            <p className="text-sm font-semibold text-red-700 mb-1">Rejection Reason</p>
                            <p className="text-sm text-red-600">{fh.rejectionReason}</p>
                        </div>
                    )}

                    {/* Key Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-blue-50 rounded-xl p-3 text-center">
                            <Users className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                            <p className="text-lg font-bold text-blue-700">{fh.capacity?.guests}</p>
                            <p className="text-xs text-blue-500">Guests</p>
                        </div>
                        <div className="bg-purple-50 rounded-xl p-3 text-center">
                            <Bed className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                            <p className="text-lg font-bold text-purple-700">{fh.capacity?.bedrooms}</p>
                            <p className="text-xs text-purple-500">Bedrooms</p>
                        </div>
                        <div className="bg-teal-50 rounded-xl p-3 text-center">
                            <Bath className="h-5 w-5 text-teal-600 mx-auto mb-1" />
                            <p className="text-lg font-bold text-teal-700">{fh.capacity?.bathrooms}</p>
                            <p className="text-xs text-teal-500">Bathrooms</p>
                        </div>
                        <div className="bg-emerald-50 rounded-xl p-3 text-center">
                            <IndianRupee className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
                            <p className="text-lg font-bold text-emerald-700">{fh.pricing?.pricePerNight?.toLocaleString()}</p>
                            <p className="text-xs text-emerald-500">per night</p>
                        </div>
                    </div>

                    {/* Description & Location */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-xl p-4">
                            <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-indigo-500" /> Location
                            </h4>
                            <p className="text-sm text-gray-900 font-medium">{fh.location?.address}</p>
                            <p className="text-sm text-gray-600">{fh.location?.city}, {fh.location?.state} – {fh.location?.zip}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                            <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-indigo-500" /> Booking Policy
                            </h4>
                            <p className="text-sm text-gray-600">Min stay: <span className="font-semibold text-gray-900">{fh.bookingPolicy?.minDuration} day(s)</span></p>
                            <p className="text-sm text-gray-600">Max stay: <span className="font-semibold text-gray-900">{fh.bookingPolicy?.maxDuration} day(s)</span></p>
                            <p className="text-sm text-gray-600">Cleaning fee: <span className="font-semibold text-gray-900">₹{fh.pricing?.cleaningFee || 0}</span></p>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="font-semibold text-gray-700 mb-2">Description</h4>
                        <p className="text-sm text-gray-600 leading-relaxed">{fh.description}</p>
                    </div>

                    {/* Amenities */}
                    {fh.amenities?.length > 0 && (
                        <div>
                            <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <Wifi className="h-4 w-4 text-indigo-500" /> Amenities
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {fh.amenities.map((a, i) => (
                                    <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-700 text-sm rounded-full border border-indigo-100 font-medium">
                                        {a}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* House Rules */}
                    {fh.rules?.length > 0 && (
                        <div>
                            <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <Tag className="h-4 w-4 text-indigo-500" /> House Rules
                            </h4>
                            <ul className="space-y-1">
                                {fh.rules.map((r, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gray-400 flex-shrink-0" />
                                        {r}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Vendor Info */}
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-5">
                        <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-indigo-600" /> Listed By
                        </h4>
                        <div className="flex items-center gap-4">
                            <img
                                src={fh.vendor?.profileImage || `https://ui-avatars.com/api/?name=${fh.vendor?.name}&background=6366f1&color=fff`}
                                alt={fh.vendor?.name}
                                className="h-14 w-14 rounded-full object-cover ring-2 ring-white shadow"
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <p className="font-bold text-gray-900">{fh.vendor?.name}</p>
                                    {fh.vendor?.isVerified ? (
                                        <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-semibold border border-emerald-200 flex items-center gap-1">
                                            <CheckCircle className="h-3 w-3" /> Verified
                                        </span>
                                    ) : (
                                        <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-semibold border border-amber-200 flex items-center gap-1">
                                            <Clock className="h-3 w-3" /> Unverified
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-3 mt-1">
                                    <p className="text-sm text-gray-600 flex items-center gap-1">
                                        <Mail className="h-3.5 w-3.5 text-gray-400" /> {fh.vendor?.email}
                                    </p>
                                    {fh.vendor?.phone && (
                                        <p className="text-sm text-gray-600 flex items-center gap-1">
                                            <Phone className="h-3.5 w-3.5 text-gray-400" /> {fh.vendor?.phone}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Caretaker */}
                    {fh.caretaker?.name && (
                        <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-4">
                            <div className="p-2 bg-white rounded-xl shadow-sm">
                                <Phone className="h-5 w-5 text-gray-500" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Caretaker</p>
                                <p className="font-semibold text-gray-900">{fh.caretaker.name}</p>
                                {fh.caretaker.phone && <p className="text-sm text-gray-600">{fh.caretaker.phone}</p>}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="pt-2 border-t border-gray-100">
                        {status === 'pending' && (
                            <div className="flex gap-3">
                                <button
                                    onClick={() => { onApprove(fh._id); onClose(); }}
                                    disabled={actionLoading}
                                    className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                    Approve Listing
                                </button>
                                <button
                                    onClick={() => setShowRejectModal(true)}
                                    className="flex-1 py-3 bg-red-50 text-red-600 border border-red-200 rounded-xl font-semibold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                                >
                                    <X className="h-4 w-4" /> Reject Listing
                                </button>
                            </div>
                        )}
                        {status === 'approved' && (
                            <div className="flex gap-3">
                                <div className="flex-1 py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl font-semibold flex items-center justify-center gap-2">
                                    <CheckCircle className="h-4 w-4" /> Currently Approved & Live
                                </div>
                                <button
                                    onClick={() => setShowRevokeModal(true)}
                                    className="flex-1 py-3 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl font-semibold hover:bg-amber-100 transition-colors flex items-center justify-center gap-2"
                                >
                                    <RotateCcw className="h-4 w-4" /> Revoke Approval
                                </button>
                            </div>
                        )}
                        {status === 'rejected' && (
                            <div className="flex gap-3">
                                <button
                                    onClick={() => { onApprove(fh._id); onClose(); }}
                                    disabled={actionLoading}
                                    className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                    Approve Anyway
                                </button>
                                <button
                                    onClick={() => setShowRevokeModal(true)}
                                    className="flex-1 py-3 bg-gray-50 text-gray-700 border border-gray-200 rounded-xl font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                                >
                                    <RotateCcw className="h-4 w-4" /> Reset to Pending
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showRejectModal && (
                <RejectModal
                    title="Reject Farmhouse"
                    onConfirm={(reason) => { onReject(fh._id, reason); setShowRejectModal(false); onClose(); }}
                    onCancel={() => setShowRejectModal(false)}
                />
            )}
            {showRevokeModal && (
                <RejectModal
                    title="Revoke Approval"
                    defaultReason=""
                    onConfirm={(reason) => { onRevoke(fh._id, reason); setShowRevokeModal(false); onClose(); }}
                    onCancel={() => setShowRevokeModal(false)}
                />
            )}
        </div>
    );
};

const FarmhouseModeration = () => {
    const [loading, setLoading] = useState(true);
    const [farmhouses, setFarmhouses] = useState([]);
    const [allFarmhouses, setAllFarmhouses] = useState([]);
    const [filter, setFilter] = useState('pending');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFarmhouse, setSelectedFarmhouse] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchFarmhouses();
    }, []);

    // Client-side filter whenever filter/search changes
    useEffect(() => {
        let result = allFarmhouses;
        if (filter !== 'all') {
            result = result.filter(fh => fh.verificationStatus === filter);
        }
        if (searchTerm) {
            const q = searchTerm.toLowerCase();
            result = result.filter(fh =>
                fh.name?.toLowerCase().includes(q) ||
                fh.location?.city?.toLowerCase().includes(q) ||
                fh.vendor?.name?.toLowerCase().includes(q)
            );
        }
        setFarmhouses(result);
    }, [filter, searchTerm, allFarmhouses]);

    const fetchFarmhouses = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/farmhouses`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAllFarmhouses(res.data);
        } catch {
            toast.error('Failed to load farmhouses');
        } finally {
            setLoading(false);
        }
    };

    const getAuthConfig = () => ({
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
    });

    const handleApprove = async (id) => {
        setActionLoading(true);
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/farmhouses/${id}/approve`, {}, getAuthConfig());
            toast.success('Farmhouse approved! Vendor has been notified.');
            setAllFarmhouses(prev => prev.map(f => f._id === id ? { ...f, verificationStatus: 'approved', isActive: true } : f));
        } catch {
            toast.error('Failed to approve farmhouse');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async (id, reason) => {
        setActionLoading(true);
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/farmhouses/${id}/reject`, { reason }, getAuthConfig());
            toast.success('Farmhouse rejected. Vendor has been notified.');
            setAllFarmhouses(prev => prev.map(f => f._id === id ? { ...f, verificationStatus: 'rejected', rejectionReason: reason, isActive: false } : f));
        } catch {
            toast.error('Failed to reject farmhouse');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRevoke = async (id, reason) => {
        setActionLoading(true);
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/farmhouses/${id}/revoke`, { reason }, getAuthConfig());
            toast.success('Farmhouse revoked to pending review. Vendor has been notified.');
            setAllFarmhouses(prev => prev.map(f => f._id === id ? { ...f, verificationStatus: 'pending', isActive: false } : f));
        } catch {
            toast.error('Failed to revoke farmhouse');
        } finally {
            setActionLoading(false);
        }
    };

    const counts = {
        all: allFarmhouses.length,
        pending: allFarmhouses.filter(f => f.verificationStatus === 'pending').length,
        approved: allFarmhouses.filter(f => f.verificationStatus === 'approved').length,
        rejected: allFarmhouses.filter(f => f.verificationStatus === 'rejected').length,
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                    <p className="text-gray-500 font-medium">Loading farmhouses...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8">
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Farmhouse Moderation</h1>
                    <p className="text-gray-500 mt-1">Review, approve, and manage property listings</p>
                </div>
                <button
                    onClick={fetchFarmhouses}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm"
                >
                    <RotateCcw className="h-4 w-4" /> Refresh
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                    { key: 'all', label: 'Total', color: 'bg-indigo-50 text-indigo-700 border-indigo-100', icon: Building },
                    { key: 'pending', label: 'Pending', color: 'bg-amber-50 text-amber-700 border-amber-100', icon: Clock },
                    { key: 'approved', label: 'Approved', color: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: CheckCircle },
                    { key: 'rejected', label: 'Rejected', color: 'bg-red-50 text-red-700 border-red-100', icon: X },
                ].map(({ key, label, color, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => setFilter(key)}
                        className={`p-4 rounded-xl border text-left transition-all hover:shadow-md ${color} ${filter === key ? 'ring-2 ring-offset-1 ring-indigo-400 shadow-md' : ''}`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-semibold opacity-80">{label}</p>
                            <Icon className="h-4 w-4 opacity-70" />
                        </div>
                        <p className="text-2xl font-bold">{counts[key]}</p>
                    </button>
                ))}
            </div>

            {/* Search + Filter Bar */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name, city, or vendor..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {['all', 'pending', 'approved', 'rejected'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg font-medium text-sm capitalize transition-colors ${filter === f ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            {f}
                            <span className={`ml-1.5 text-xs ${filter === f ? 'text-indigo-200' : 'text-gray-400'}`}>
                                {counts[f]}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Listings */}
            {farmhouses.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-16 text-center">
                    <Building className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-1">No farmhouses found</h3>
                    <p className="text-gray-500 text-sm">
                        {filter === 'pending' ? 'No pending listings to review — all caught up!' : `No ${filter} listings match your search.`}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {farmhouses.map((fh) => (
                        <div key={fh._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                            <div className="flex gap-0">
                                {/* Image */}
                                <div className="w-36 h-32 lg:w-48 lg:h-36 flex-shrink-0 bg-gray-100 relative">
                                    {fh.images?.[0] ? (
                                        <img src={fh.images[0]} alt={fh.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Home className="h-10 w-10 text-gray-300" />
                                        </div>
                                    )}
                                    <div className={`absolute top-2 left-2 h-2 w-2 rounded-full ${STATUS_CONFIG[fh.verificationStatus]?.dot || 'bg-gray-400'} ring-2 ring-white`} />
                                </div>

                                {/* Content */}
                                <div className="flex-1 p-5 min-w-0">
                                    <div className="flex items-start justify-between gap-3 flex-wrap">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                <h3 className="font-bold text-gray-900 text-lg leading-tight">{fh.name}</h3>
                                                <StatusBadge status={fh.verificationStatus} />
                                            </div>
                                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                                                {fh.location?.city}, {fh.location?.state}
                                            </p>
                                        </div>

                                        {/* Quick Actions */}
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            {fh.verificationStatus === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleApprove(fh._id)}
                                                        disabled={actionLoading}
                                                        className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50"
                                                        title="Approve"
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setSelectedFarmhouse(fh)}
                                                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                                        title="Reject"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </>
                                            )}
                                            {fh.verificationStatus === 'approved' && (
                                                <button
                                                    onClick={() => setSelectedFarmhouse(fh)}
                                                    className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors"
                                                    title="Revoke approval"
                                                >
                                                    <RotateCcw className="h-4 w-4" />
                                                </button>
                                            )}
                                            {fh.verificationStatus === 'rejected' && (
                                                <button
                                                    onClick={() => handleApprove(fh._id)}
                                                    disabled={actionLoading}
                                                    className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50"
                                                    title="Approve"
                                                >
                                                    <Check className="h-4 w-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => setSelectedFarmhouse(fh)}
                                                className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                                                title="View details"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Meta */}
                                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-600 flex-wrap">
                                        <span className="flex items-center gap-1">
                                            <Users className="h-3.5 w-3.5 text-gray-400" /> {fh.capacity?.guests} guests
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Bed className="h-3.5 w-3.5 text-gray-400" /> {fh.capacity?.bedrooms} beds
                                        </span>
                                        <span className="font-semibold text-indigo-600">
                                            ₹{fh.pricing?.pricePerNight?.toLocaleString()}/night
                                        </span>
                                        {fh.averageRating > 0 && (
                                            <span className="flex items-center gap-1 text-amber-600">
                                                <Star className="h-3.5 w-3.5 fill-current" /> {fh.averageRating.toFixed(1)}
                                            </span>
                                        )}
                                    </div>

                                    {/* Vendor */}
                                    <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-2">
                                        <img
                                            src={fh.vendor?.profileImage || `https://ui-avatars.com/api/?name=${fh.vendor?.name}&background=6366f1&color=fff&size=32`}
                                            alt={fh.vendor?.name}
                                            className="h-6 w-6 rounded-full"
                                        />
                                        <span className="text-xs text-gray-500">
                                            Listed by <span className="font-semibold text-gray-700">{fh.vendor?.name}</span>
                                        </span>
                                        {fh.vendor?.isVerified ? (
                                            <span className="text-xs text-emerald-600 flex items-center gap-0.5">
                                                <ShieldCheck className="h-3 w-3" /> Verified vendor
                                            </span>
                                        ) : (
                                            <span className="text-xs text-amber-600 flex items-center gap-0.5">
                                                <ShieldAlert className="h-3 w-3" /> Unverified
                                            </span>
                                        )}
                                        <span className="ml-auto text-xs text-gray-400">
                                            {new Date(fh.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Detail Modal */}
            {selectedFarmhouse && (
                <DetailModal
                    farmhouse={selectedFarmhouse}
                    onClose={() => setSelectedFarmhouse(null)}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onRevoke={handleRevoke}
                    actionLoading={actionLoading}
                />
            )}
        </div>
    );
};

export default FarmhouseModeration;
