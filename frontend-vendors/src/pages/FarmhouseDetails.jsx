import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    MapPin, Users, Bed, Bath, CheckCircle, ArrowLeft, Edit, Calendar, Shield,
    User, Clock, Image as ImageIcon, IndianRupee, Home, X, Eye, TrendingUp
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const FarmhouseDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [farmhouse, setFarmhouse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        const fetchFarmhouse = async () => {
            try {
                const token = localStorage.getItem('vendorToken');
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/farmhouses/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setFarmhouse(res.data);
            } catch (error) {
                console.error(error);
                toast.error('Failed to fetch farmhouse details');
                navigate('/dashboard/farmhouses');
            } finally {
                setLoading(false);
            }
        };

        fetchFarmhouse();
    }, [id, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                    <p className="mt-4 text-gray-500 font-medium">Loading property details...</p>
                </div>
            </div>
        );
    }

    if (!farmhouse) return null;

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            {/* Back Button */}
            <Link
                to="/dashboard/farmhouses"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-medium mb-6"
            >
                <ArrowLeft className="h-5 w-5" />
                Back to My Farmhouses
            </Link>

            {/* Header Card */}
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl shadow-sm border border-emerald-100 p-8 mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                {farmhouse.type}
                            </span>
                            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${farmhouse.isActive
                                ? 'bg-green-100 text-green-800 border-green-200'
                                : 'bg-gray-100 text-gray-800 border-gray-200'
                                }`}>
                                {farmhouse.isActive ? 'Active' : 'Paused'}
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{farmhouse.name}</h1>
                        <div className="flex items-center text-gray-600">
                            <MapPin className="h-5 w-5 mr-2 flex-shrink-0" />
                            <span>{farmhouse.location.address}, {farmhouse.location.city}, {farmhouse.location.state} {farmhouse.location.zip}</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-4">
                        <div className="text-right">
                            <p className="text-sm text-gray-600 mb-1">Price for 24 hours</p>
                            <div className="flex items-baseline gap-1">
                                <IndianRupee className="h-6 w-6 text-emerald-600" />
                                <span className="text-4xl font-bold text-emerald-600">{farmhouse.pricing.pricePerNight.toLocaleString()}</span>
                            </div>
                        </div>
                        <Link
                            to={`/dashboard/farmhouses/edit/${farmhouse._id}`}
                            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-all shadow-sm hover:shadow-md"
                        >
                            <Edit className="h-4 w-4" />
                            Edit Property
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Image */}
            <div className="relative bg-gray-200 rounded-2xl overflow-hidden mb-8 shadow-sm">
                <div className="h-96 w-full cursor-pointer" onClick={() => setSelectedImage(farmhouse.images[0])}>
                    <img
                        src={farmhouse.images[0] || 'https://via.placeholder.com/1200x600?text=No+Image'}
                        alt={farmhouse.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                </div>
                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    {farmhouse.images.length} Photos
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Photo Gallery */}
                    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <ImageIcon className="h-5 w-5 text-emerald-600" />
                            <h2 className="text-xl font-bold text-gray-900">Photo Gallery</h2>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {farmhouse.images.map((img, idx) => (
                                <div
                                    key={idx}
                                    className="aspect-square rounded-xl overflow-hidden border border-gray-200 cursor-pointer hover:opacity-90 hover:scale-105 transition-all"
                                    onClick={() => setSelectedImage(img)}
                                >
                                    <img
                                        src={img}
                                        alt={`${farmhouse.name} ${idx + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Description */}
                    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <Home className="h-5 w-5 text-emerald-600" />
                            <h2 className="text-xl font-bold text-gray-900">About this property</h2>
                        </div>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                            {farmhouse.description}
                        </p>
                    </section>

                    {/* Amenities */}
                    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <TrendingUp className="h-5 w-5 text-emerald-600" />
                            <h2 className="text-xl font-bold text-gray-900">Amenities</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {farmhouse.amenities.map((amenity, index) => (
                                <div key={index} className="flex items-center gap-3 text-gray-700">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                                    </div>
                                    <span className="font-medium">{amenity}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Rules */}
                    {farmhouse.rules && farmhouse.rules.length > 0 && (
                        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <Shield className="h-5 w-5 text-emerald-600" />
                                <h2 className="text-xl font-bold text-gray-900">House Rules</h2>
                            </div>
                            <ul className="space-y-3">
                                {farmhouse.rules.map((rule, index) => (
                                    <li key={index} className="flex items-start gap-3 text-gray-700">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center mt-0.5">
                                            <span className="text-xs font-bold text-gray-600">{index + 1}</span>
                                        </div>
                                        <span>{rule}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {/* Caretaker */}
                    {farmhouse.caretaker && farmhouse.caretaker.name && (
                        <section className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border border-emerald-100 p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <User className="h-5 w-5 text-emerald-600" />
                                <h2 className="text-lg font-bold text-gray-900">Caretaker Information</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Name</p>
                                    <p className="font-semibold text-gray-900">{farmhouse.caretaker.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Contact</p>
                                    <p className="font-semibold text-gray-900">{farmhouse.caretaker.phone || 'Not provided'}</p>
                                </div>
                            </div>
                        </section>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Capacity Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-bold text-gray-900 mb-6">Property Details</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                <div className="flex items-center gap-3 text-gray-700">
                                    <div className="p-2 bg-white rounded-lg">
                                        <Users className="h-5 w-5 text-indigo-600" />
                                    </div>
                                    <span className="font-medium">Guests</span>
                                </div>
                                <span className="font-bold text-gray-900 text-lg">{farmhouse.capacity.guests}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                <div className="flex items-center gap-3 text-gray-700">
                                    <div className="p-2 bg-white rounded-lg">
                                        <Bed className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <span className="font-medium">Bedrooms</span>
                                </div>
                                <span className="font-bold text-gray-900 text-lg">{farmhouse.capacity.bedrooms}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                <div className="flex items-center gap-3 text-gray-700">
                                    <div className="p-2 bg-white rounded-lg">
                                        <Bath className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <span className="font-medium">Bathrooms</span>
                                </div>
                                <span className="font-bold text-gray-900 text-lg">{farmhouse.capacity.bathrooms}</span>
                            </div>
                        </div>
                    </div>

                    {/* Booking Policy Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <Clock className="h-5 w-5 text-emerald-600" />
                            <h3 className="font-bold text-gray-900">Booking Policy</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                <span className="text-gray-600 font-medium">Min Duration</span>
                                <span className="font-bold text-gray-900">{farmhouse.bookingPolicy?.minDuration || 1} Days</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                <span className="text-gray-600 font-medium">Max Duration</span>
                                <span className="font-bold text-gray-900">{farmhouse.bookingPolicy?.maxDuration || 30} Days</span>
                            </div>
                        </div>
                    </div>

                    {/* Pricing Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <IndianRupee className="h-5 w-5 text-emerald-600" />
                            <h3 className="font-bold text-gray-900">Pricing Breakdown</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                <span className="text-gray-600 font-medium">Cleaning Fee</span>
                                <span className="font-bold text-gray-900">₹{(farmhouse.pricing.cleaningFee || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                <span className="text-gray-600 font-medium">Security Deposit</span>
                                <span className="font-bold text-gray-900">₹{(farmhouse.pricing.securityDeposit || 0).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Unavailable Dates */}
                    {farmhouse.unavailableDates && farmhouse.unavailableDates.length > 0 && (
                        <div className="bg-red-50 rounded-2xl border border-red-100 p-6">
                            <div className="flex items-center gap-2 text-red-800 font-semibold mb-4">
                                <Calendar className="h-5 w-5" />
                                Unavailable Dates
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {farmhouse.unavailableDates.map((date, idx) => (
                                    <span key={idx} className="text-xs bg-white text-red-700 px-3 py-1.5 rounded-lg border border-red-200 font-medium">
                                        {new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Lightbox Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm"
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                        onClick={() => setSelectedImage(null)}
                    >
                        <X className="w-6 h-6" />
                    </button>
                    <img
                        src={selectedImage}
                        alt="Full screen view"
                        className="max-h-[90vh] max-w-full object-contain rounded-2xl shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
};

export default FarmhouseDetails;
