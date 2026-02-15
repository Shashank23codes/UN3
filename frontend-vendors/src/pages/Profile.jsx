import React from 'react';
import { User, Mail, Phone, MapPin, Edit, Calendar, ShieldCheck, Building, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
    const { user } = useAuth();

    if (!user) return null;

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            {/* Header Section */}
            <div className="relative mb-8">
                {/* Banner */}
                <div className="h-60 w-full bg-gradient-to-r from-emerald-900 to-teal-800 rounded-t-3xl shadow-lg overflow-hidden relative">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                </div>

                {/* Profile Content */}
                <div className="bg-white rounded-b-3xl shadow-sm border-x border-b border-gray-100 px-6 md:px-8 pb-8 relative z-10">
                    <div className="flex flex-col md:flex-row items-start gap-6">
                        {/* Avatar - Overlapping Banner */}
                        <div className="relative -mt-16 md:-mt-20">
                            <div className="h-32 w-32 md:h-40 md:w-40 rounded-3xl border-4 border-white shadow-2xl overflow-hidden bg-white p-1">
                                <img
                                    src={user.profileImage || `https://ui-avatars.com/api/?name=${user.name}&background=059669&color=fff&size=256`}
                                    alt="Profile"
                                    className="h-full w-full rounded-2xl object-cover"
                                />
                            </div>
                            <div className={`absolute bottom-3 right-3 h-6 w-6 rounded-full border-4 border-white flex items-center justify-center ${user.isVerified ? 'bg-emerald-500' : 'bg-yellow-500'}`}>
                                {user.isVerified && <CheckCircle className="h-3 w-3 text-white" />}
                            </div>
                        </div>

                        {/* Info & Actions */}
                        <div className="flex-1 pt-2 md:pt-4 flex flex-col md:flex-row md:items-end justify-between gap-4 w-full">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{user.name}</h1>
                                <div className="flex flex-wrap items-center gap-3 mt-2 text-gray-600 font-medium">
                                    <span className="flex items-center gap-1.5">
                                        <Building className="h-4 w-4 text-gray-400" />
                                        {user.businessName || 'Independent Vendor'}
                                    </span>
                                    <span className="text-gray-300">|</span>
                                    {user.isVerified ? (
                                        <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-xs font-bold border border-emerald-100">
                                            <ShieldCheck className="h-3 w-3" /> Verified
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full text-xs font-bold border border-yellow-100">
                                            <Clock className="h-3 w-3" /> Pending
                                        </span>
                                    )}
                                </div>
                            </div>

                            <Link
                                to="/dashboard/settings"
                                className="bg-gray-900 text-white hover:bg-gray-800 px-6 py-3 rounded-xl shadow-lg shadow-gray-200 font-semibold flex items-center justify-center transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                            >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Profile
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-20 md:mt-24 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Contact Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <User className="h-24 w-24 text-emerald-600" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 relative z-10">
                            <span className="p-1.5 bg-emerald-100 rounded-lg">
                                <User className="h-5 w-5 text-emerald-600" />
                            </span>
                            Contact Information
                        </h2>
                        <div className="space-y-4 relative z-10">
                            <div className="group flex items-center p-4 bg-gray-50 rounded-xl transition-all hover:bg-emerald-50/50 hover:shadow-sm border border-transparent hover:border-emerald-100">
                                <div className="bg-white p-2.5 rounded-full shadow-sm mr-4 group-hover:scale-110 transition-transform">
                                    <Mail className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide font-bold mb-0.5">Email Address</p>
                                    <p className="text-sm font-semibold text-gray-900 truncate" title={user.email}>{user.email}</p>
                                </div>
                            </div>

                            <div className="group flex items-center p-4 bg-gray-50 rounded-xl transition-all hover:bg-emerald-50/50 hover:shadow-sm border border-transparent hover:border-emerald-100">
                                <div className="bg-white p-2.5 rounded-full shadow-sm mr-4 group-hover:scale-110 transition-transform">
                                    <Phone className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide font-bold mb-0.5">Phone Number</p>
                                    <p className="text-sm font-semibold text-gray-900">{user.phone || 'Not provided'}</p>
                                </div>
                            </div>

                            <div className="group flex items-center p-4 bg-gray-50 rounded-xl transition-all hover:bg-emerald-50/50 hover:shadow-sm border border-transparent hover:border-emerald-100">
                                <div className="bg-white p-2.5 rounded-full shadow-sm mr-4 group-hover:scale-110 transition-transform">
                                    <MapPin className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide font-bold mb-0.5">Location</p>
                                    <p className="text-sm font-semibold text-gray-900">
                                        {user.address?.city ? `${user.address.city}, ${user.address.state}` : 'Not set'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <span className="p-1.5 bg-blue-100 rounded-lg">
                                <ShieldCheck className="h-5 w-5 text-blue-600" />
                            </span>
                            Account Status
                        </h2>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5 text-gray-400" />
                                    <span className="text-sm font-medium text-gray-600">Member Since</span>
                                </div>
                                <span className="text-sm font-bold text-gray-900">
                                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                                </span>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <ShieldCheck className="h-5 w-5 text-gray-400" />
                                    <span className="text-sm font-medium text-gray-600">Verification</span>
                                </div>
                                {user.isVerified ? (
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        VERIFIED
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-yellow-100 text-yellow-700 border border-yellow-200">
                                        <Clock className="w-3 h-3 mr-1" />
                                        PENDING
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Details & Stats */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">About</h2>
                        <div className="prose prose-emerald max-w-none">
                            <p className="text-gray-600 leading-relaxed">
                                {user.about || "Welcome to your profile! This section is where you can tell your story. Add a description to help customers get to know you and your business better. Building trust starts with a great introduction."}
                            </p>
                        </div>
                        {!user.about && (
                            <div className="mt-6">
                                <Link to="/dashboard/settings" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                                    Add a bio <Edit className="h-3 w-3" />
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold text-gray-900">Address Details</h2>
                            {user.address?.street && (
                                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full uppercase tracking-wide">
                                    Primary Address
                                </span>
                            )}
                        </div>

                        {user.address?.street ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 transition-all hover:border-emerald-200 hover:shadow-sm">
                                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Street Address</p>
                                    <p className="text-gray-900 font-semibold text-lg">{user.address.street}</p>
                                </div>
                                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 transition-all hover:border-emerald-200 hover:shadow-sm">
                                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">City</p>
                                    <p className="text-gray-900 font-semibold text-lg">{user.address.city}</p>
                                </div>
                                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 transition-all hover:border-emerald-200 hover:shadow-sm">
                                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">State</p>
                                    <p className="text-gray-900 font-semibold text-lg">{user.address.state}</p>
                                </div>
                                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 transition-all hover:border-emerald-200 hover:shadow-sm">
                                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Zip Code</p>
                                    <p className="text-gray-900 font-semibold text-lg">{user.address.zip}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                <div className="bg-white p-4 rounded-full shadow-sm inline-block mb-4">
                                    <MapPin className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-1">No address details</h3>
                                <p className="text-gray-500 mb-6">Add your business address to help customers find you.</p>
                                <Link
                                    to="/dashboard/settings"
                                    className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
                                >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Add Address
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
