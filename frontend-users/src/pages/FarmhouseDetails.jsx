import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Share, Heart, MapPin, User, Check, Calendar, ChevronRight, Minus, Plus, Loader2, X, ChevronLeft, Home, Users, Bed, Bath, Phone, Shield, Clock, DollarSign, AlertCircle, Sparkles, Image, ArrowRight, Info, Wifi, Car, Coffee, Tv, Wind, TreePine, Sun, Moon, Utensils, Waves, Dumbbell, PawPrint, Music, Flame, Copy, Facebook, Twitter, Linkedin, Mail, MessageCircle, ExternalLink } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import ReviewsSection from '../components/ReviewsSection';
import StarRating from '../components/StarRating';

const FarmhouseDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, login } = useAuth();
    const [farmhouse, setFarmhouse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [guests, setGuests] = useState(1);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [showAllImages, setShowAllImages] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [showAllAmenities, setShowAllAmenities] = useState(false);
    const [showAllRules, setShowAllRules] = useState(false);
    const [imageHovered, setImageHovered] = useState(null);
    const [showShareModal, setShowShareModal] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);
    const [showPhoneModal, setShowPhoneModal] = useState(false);
    const [mobileNumber, setMobileNumber] = useState('');

    // Amenity icons mapping for premium display
    const amenityIcons = {
        'WiFi': Wifi, 'Pool': Waves, 'Parking': Car, 'Kitchen': Utensils,
        'AC': Wind, 'TV': Tv, 'Garden': TreePine, 'BBQ': Flame,
        'Gym': Dumbbell, 'Pet Friendly': PawPrint, 'Music System': Music,
        'Coffee Maker': Coffee
    };

    const getAmenityIcon = (amenity) => {
        const IconComponent = Object.entries(amenityIcons).find(([key]) =>
            amenity.toLowerCase().includes(key.toLowerCase())
        )?.[1];
        return IconComponent || Sparkles;
    };

    // Pre-populate mobile number from user profile and force close modal if phone exists
    useEffect(() => {
        if (user?.phone) {
            setMobileNumber(user.phone);
            setShowPhoneModal(false); // Force close if background fetch found a number
        }
    }, [user?.phone]);

    useEffect(() => {
        const fetchFarmhouse = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/farmhouses/${id}`);
                setFarmhouse(res.data);
            } catch (error) {
                console.error('Error fetching farmhouse details:', error);
                toast.error('Failed to load farmhouse details');
            } finally {
                setLoading(false);
            }
        };

        const checkWishlistStatus = async () => {
            if (user) {
                try {
                    const token = localStorage.getItem('userToken');
                    const config = { headers: { Authorization: `Bearer ${token}` } };
                    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/wishlist`, config);
                    const wishlistIds = res.data.map(item => item._id);
                    setIsWishlisted(wishlistIds.includes(id));
                } catch (error) {
                    console.error('Error checking wishlist status:', error);
                }
            }
        };

        fetchFarmhouse();
        checkWishlistStatus();
    }, [id, user]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="h-12 w-12 animate-spin text-rose-600" />
            </div>
        );
    }

    if (!farmhouse) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <p className="text-xl text-gray-500">Farmhouse not found.</p>
            </div>
        );
    }

    // Calculate duration in days (with fixed check-in at 11 AM and check-out at 11 AM)
    const calculateDays = () => {
        if (!startDate || !endDate) return 0;
        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };



    const handleSaveMobile = async () => {
        if (!mobileNumber || mobileNumber.length < 10) {
            toast.error('Please enter a valid 10-digit mobile number');
            return;
        }

        try {
            const token = localStorage.getItem('userToken');
            await axios.put(`${import.meta.env.VITE_API_URL}/api/users/profile`,
                { phone: mobileNumber },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Update local context
            const updatedUser = { ...user, phone: mobileNumber, token };
            login(updatedUser);

            setShowPhoneModal(false);
            toast.success('Mobile number saved! Proceeding with booking...');

            // Retry booking with updated user
            handleReserve(updatedUser);

        } catch (error) {
            console.error('Error saving mobile:', error);
            toast.error('Failed to save mobile number');
        }
    };

    const calculateTotal = () => {
        const days = calculateDays();
        const basePrice = days * (farmhouse.pricing?.pricePerNight || 0);
        const cleaningFee = farmhouse.pricing?.cleaningFee || 0;
        return basePrice + cleaningFee;
    };

    const nights = calculateDays();
    const basePrice = nights * (farmhouse.pricing?.pricePerNight || 0);
    const totalPrice = calculateTotal();
    const advancePayment = Math.round(totalPrice * 0.30);
    const payAtVenue = totalPrice - advancePayment;

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleReserve = async (overrideUser = null) => {
        const currentUser = overrideUser || user;

        if (!currentUser) {
            toast.error('Please login to book a farmhouse');
            navigate('/login');
            return;
        }

        if (!startDate || !endDate) {
            toast.error('Please select check-in and check-out dates');
            return;
        }

        // Validate booking duration policy
        const minStay = farmhouse.bookingPolicy?.minDuration || 1;
        const maxStay = farmhouse.bookingPolicy?.maxDuration || 30;

        if (nights < minStay) {
            toast.error(`Minimum stay for this property is ${minStay} ${minStay === 1 ? 'day' : 'days'}`);
            return;
        }

        if (nights > maxStay) {
            toast.error(`Maximum stay for this property is ${maxStay} ${maxStay === 1 ? 'day' : 'days'}`);
            return;
        }

        setBookingLoading(true);

        try {
            const token = localStorage.getItem('userToken');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };

            // Real-time Database Verification
            const profileRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/me`, config);
            const latestUser = { ...profileRes.data, token };

            // Sync with context if different
            if (JSON.stringify(user) !== JSON.stringify(latestUser)) {
                login(latestUser);
            }

            // Bulletproof phone number check against database result
            const dbPhone = latestUser.phone?.toString().trim();
            if (!dbPhone || dbPhone.length < 5) {
                setShowPhoneModal(true);
                setBookingLoading(false);
                return;
            }

            // Set both check-in and check-out time to 11 AM
            const checkInDateTime = new Date(startDate);
            checkInDateTime.setHours(11, 0, 0, 0);

            const checkOutDateTime = new Date(endDate);
            checkOutDateTime.setHours(11, 0, 0, 0);

            // 1. Load Razorpay SDK
            const res = await loadRazorpay();
            if (!res) {
                toast.error('Razorpay SDK failed to load. Are you online?');
                setBookingLoading(false);
                return;
            }

            // 2. Create Order on Backend
            const orderData = {
                amount: advancePayment
            };

            const { data: order } = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/payments/create-order`,
                orderData,
                config
            );

            // 3. Initialize Razorpay Options
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: "Utsav Nest",
                description: `Booking for ${farmhouse.name}`,
                image: "https://via.placeholder.com/150",
                order_id: order.id,
                handler: async function (response) {
                    try {
                        // 4. Verify Payment and Create Booking
                        const verifyData = {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            bookingDetails: {
                                farmhouseId: farmhouse._id,
                                checkIn: checkInDateTime.toISOString(),
                                checkOut: checkOutDateTime.toISOString(),
                                guests,
                                totalPrice: totalPrice,
                                advancePayment: advancePayment
                            }
                        };

                        const verifyResponse = await axios.post(
                            `${import.meta.env.VITE_API_URL}/api/payments/verify`,
                            verifyData,
                            config
                        );

                        const { receiptNumber } = verifyResponse.data;
                        toast.success('Booking requested! Waiting for host confirmation.');
                        navigate(`/booking-confirmation?receipt=${receiptNumber}`);
                    } catch (error) {
                        console.error('Payment verification failed:', error);
                        toast.error('Payment verification failed. Please contact support.');
                        setBookingLoading(false);
                    }
                },
                prefill: {
                    name: currentUser.name,
                    email: currentUser.email,
                    contact: currentUser.phone || ""
                },
                theme: {
                    color: "#e11d48"
                },
                modal: {
                    ondismiss: function () {
                        setBookingLoading(false);
                    }
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

            paymentObject.on('payment.failed', function (response) {
                toast.error(response.error.description);
                setBookingLoading(false);
            });

        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Booking initiation failed. Please try again.');
            setBookingLoading(false);
        }
    };

    const toggleWishlist = async () => {
        if (!user) {
            toast.error('Please login to save to wishlist');
            navigate('/login');
            return;
        }

        try {
            const token = localStorage.getItem('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            if (isWishlisted) {
                await axios.delete(`${import.meta.env.VITE_API_URL}/api/users/wishlist/${id}`, config);
                setIsWishlisted(false);
                toast.success('Removed from wishlist');
            } else {
                await axios.post(`${import.meta.env.VITE_API_URL}/api/users/wishlist/${id}`, {}, config);
                setIsWishlisted(true);
                toast.success('Added to wishlist');
            }
        } catch (error) {
            console.error('Error toggling wishlist:', error);
            toast.error('Failed to update wishlist');
        }
    };

    const displayedAmenities = showAllAmenities ? farmhouse.amenities : farmhouse.amenities.slice(0, 10);
    const displayedRules = showAllRules ? farmhouse.rules : farmhouse.rules?.slice(0, 5) || [];
    const descriptionPreview = farmhouse.description?.substring(0, 400) || '';

    return (
        <div className="pt-16 md:pt-20 pb-8 md:pb-16 min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
            {/* Premium Header */}
            <div className="bg-gradient-to-r from-white via-rose-50/30 to-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                        <div className="flex-1 space-y-3">
                            {/* Property Type Badge */}
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-sm">
                                    <Sparkles className="h-3 w-3 mr-1" />
                                    {farmhouse.type || 'Farmhouse'}
                                </span>
                                {farmhouse.averageRating > 0 && (
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                        <Star className="h-3 w-3 mr-1 fill-amber-400 text-amber-400" />
                                        {farmhouse.averageRating.toFixed(1)}
                                    </span>
                                )}
                            </div>

                            {/* Title */}
                            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
                                {farmhouse.name}
                            </h1>

                            {/* Location & Reviews */}
                            <div className="flex flex-wrap items-center gap-3 text-gray-600">
                                <div className="flex items-center bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-gray-100">
                                    <MapPin className="h-4 w-4 mr-1.5 text-rose-500" />
                                    <span className="text-sm font-medium">{farmhouse.location?.city}, {farmhouse.location?.state}</span>
                                </div>
                                {farmhouse.reviewCount > 0 && (
                                    <div className="flex items-center gap-1.5">
                                        <StarRating rating={farmhouse.averageRating} size="sm" />
                                        <span className="text-sm text-gray-500">({farmhouse.reviewCount} {farmhouse.reviewCount === 1 ? 'review' : 'reviews'})</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 md:gap-3">
                            <button
                                onClick={() => setShowShareModal(true)}
                                className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow"
                            >
                                <Share className="h-4 w-4 text-gray-600 group-hover:text-gray-900 transition-colors" />
                                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 hidden sm:inline">Share</span>
                            </button>
                            <button
                                onClick={toggleWishlist}
                                className={`group flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow ${isWishlisted
                                    ? 'bg-rose-50 border border-rose-200 hover:bg-rose-100'
                                    : 'bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <Heart className={`h-4 w-4 transition-all duration-200 ${isWishlisted ? 'fill-rose-500 text-rose-500 scale-110' : 'text-gray-600 group-hover:text-rose-500'}`} />
                                <span className={`text-sm font-medium hidden sm:inline ${isWishlisted ? 'text-rose-600' : 'text-gray-700 group-hover:text-gray-900'}`}>
                                    {isWishlisted ? 'Saved' : 'Save'}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-0 sm:px-4 md:px-6 lg:px-8">
                {/* Premium Image Gallery */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-1.5 md:gap-2 rounded-none sm:rounded-3xl overflow-hidden h-[280px] sm:h-[340px] md:h-[520px] my-0 sm:my-6 md:my-8 relative shadow-xl group">
                    {/* Main Image */}
                    <div
                        className="md:col-span-2 h-full relative overflow-hidden cursor-pointer"
                        onMouseEnter={() => setImageHovered(0)}
                        onMouseLeave={() => setImageHovered(null)}
                        onClick={() => { setShowAllImages(true); setCurrentImageIndex(0); }}
                    >
                        <img
                            src={farmhouse.images[0]}
                            alt="Main"
                            className={`w-full h-full object-cover transition-all duration-500 ${imageHovered === 0 ? 'scale-110' : 'scale-100'}`}
                        />
                        <div className={`absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent transition-opacity duration-300 ${imageHovered === 0 ? 'opacity-100' : 'opacity-0'}`} />
                        <div className={`absolute bottom-4 left-4 text-white transition-all duration-300 ${imageHovered === 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                            <p className="text-sm font-medium flex items-center gap-1.5"><Image className="h-4 w-4" /> View Gallery</p>
                        </div>
                    </div>

                    {/* Secondary Images - Column 1 */}
                    {farmhouse.images.length > 1 && (
                        <div className="hidden md:grid grid-rows-2 gap-1.5 md:gap-2 h-full">
                            {[1, 2].map((idx) => farmhouse.images[idx] && (
                                <div
                                    key={idx}
                                    className="relative overflow-hidden cursor-pointer"
                                    onMouseEnter={() => setImageHovered(idx)}
                                    onMouseLeave={() => setImageHovered(null)}
                                    onClick={() => { setShowAllImages(true); setCurrentImageIndex(idx); }}
                                >
                                    <img
                                        src={farmhouse.images[idx]}
                                        alt={`View ${idx + 1}`}
                                        className={`w-full h-full object-cover transition-all duration-500 ${imageHovered === idx ? 'scale-110' : 'scale-100'}`}
                                    />
                                    <div className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${imageHovered === idx ? 'opacity-100' : 'opacity-0'}`} />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Secondary Images - Column 2 */}
                    {farmhouse.images.length > 3 && (
                        <div className="hidden md:grid grid-rows-2 gap-1.5 md:gap-2 h-full">
                            {[3, 4].map((idx) => farmhouse.images[idx] && (
                                <div
                                    key={idx}
                                    className="relative overflow-hidden cursor-pointer"
                                    onMouseEnter={() => setImageHovered(idx)}
                                    onMouseLeave={() => setImageHovered(null)}
                                    onClick={() => { setShowAllImages(true); setCurrentImageIndex(idx); }}
                                >
                                    <img
                                        src={farmhouse.images[idx]}
                                        alt={`View ${idx + 1}`}
                                        className={`w-full h-full object-cover transition-all duration-500 ${imageHovered === idx ? 'scale-110' : 'scale-100'}`}
                                    />
                                    <div className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${imageHovered === idx ? 'opacity-100' : 'opacity-0'}`} />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Show All Photos Button */}
                    {farmhouse.images.length > 1 && (
                        <button
                            onClick={() => setShowAllImages(true)}
                            className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm border border-gray-200 px-4 md:px-5 py-2.5 md:py-3 rounded-xl text-xs md:text-sm font-semibold hover:bg-white hover:shadow-lg transition-all duration-200 shadow-md flex items-center gap-2 group-hover:scale-105"
                        >
                            <Image className="h-4 w-4" />
                            <span>Show all {farmhouse.images.length} photos</span>
                        </button>
                    )}

                    {/* Image Counter Badge */}
                    <div className="absolute top-4 left-4 md:hidden bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5">
                        <Image className="h-3 w-3" />
                        1 / {farmhouse.images.length}
                    </div>
                </div>

                {/* Premium Lightbox Modal */}
                {showAllImages && (
                    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col">
                        {/* Lightbox Header */}
                        <div className="flex items-center justify-between p-4 md:p-6">
                            <span className="text-white/80 text-sm font-medium">{currentImageIndex + 1} of {farmhouse.images.length}</span>
                            <button
                                onClick={() => setShowAllImages(false)}
                                className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2.5 transition-all duration-200"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Main Image Area */}
                        <div className="flex-1 flex items-center justify-center relative px-4">
                            <button
                                onClick={() => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : farmhouse.images.length - 1)}
                                className="absolute left-4 md:left-8 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-all duration-200 hover:scale-110"
                            >
                                <ChevronLeft className="h-6 w-6 md:h-8 md:w-8" />
                            </button>
                            <img
                                src={farmhouse.images[currentImageIndex]}
                                alt="Farmhouse"
                                className="max-h-[70vh] max-w-[85vw] object-contain rounded-lg shadow-2xl transition-opacity duration-300"
                            />
                            <button
                                onClick={() => setCurrentImageIndex(prev => prev < farmhouse.images.length - 1 ? prev + 1 : 0)}
                                className="absolute right-4 md:right-8 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-all duration-200 hover:scale-110"
                            >
                                <ChevronRight className="h-6 w-6 md:h-8 md:w-8" />
                            </button>
                        </div>

                        {/* Thumbnail Strip */}
                        <div className="p-4 md:p-6">
                            <div className="flex justify-center gap-2 overflow-x-auto pb-2">
                                {farmhouse.images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentImageIndex(idx)}
                                        className={`flex-shrink-0 w-16 h-12 md:w-20 md:h-14 rounded-lg overflow-hidden transition-all duration-200 ${currentImageIndex === idx
                                            ? 'ring-2 ring-white scale-105'
                                            : 'opacity-50 hover:opacity-100'
                                            }`}
                                    >
                                        <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Share Modal */}
                {showShareModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
                            {/* Modal Header */}
                            <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 p-6 text-white relative">
                                <button
                                    onClick={() => {
                                        setShowShareModal(false);
                                        setLinkCopied(false);
                                    }}
                                    className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-white/20 rounded-xl">
                                        <Share className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">Share this property</h3>
                                        <p className="text-white/80 text-sm">Let others know about this amazing place!</p>
                                    </div>
                                </div>
                            </div>

                            {/* Property Preview */}
                            <div className="p-4 border-b border-gray-100">
                                <div className="flex gap-4">
                                    <img
                                        src={farmhouse.images?.[0] || 'https://via.placeholder.com/100'}
                                        alt={farmhouse.name}
                                        className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-gray-900 truncate">{farmhouse.name}</h4>
                                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                            <MapPin className="h-3.5 w-3.5" />
                                            {farmhouse.location?.city}, {farmhouse.location?.state}
                                        </p>
                                        <p className="text-sm font-semibold text-rose-600 mt-1">
                                            ₹{farmhouse.pricing?.pricePerNight?.toLocaleString()} / day
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Share Options */}
                            <div className="p-6">
                                <p className="text-sm font-medium text-gray-500 mb-4">Share via</p>
                                <div className="grid grid-cols-4 gap-3 mb-6">
                                    {/* WhatsApp */}
                                    <button
                                        onClick={() => {
                                            const text = `Check out this amazing farmhouse: ${farmhouse.name}\n${window.location.href}`;
                                            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                                        }}
                                        className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-green-50 transition-colors group"
                                    >
                                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <MessageCircle className="h-6 w-6 text-white" />
                                        </div>
                                        <span className="text-xs font-medium text-gray-600">WhatsApp</span>
                                    </button>

                                    {/* Facebook */}
                                    <button
                                        onClick={() => {
                                            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
                                        }}
                                        className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-blue-50 transition-colors group"
                                    >
                                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Facebook className="h-6 w-6 text-white" />
                                        </div>
                                        <span className="text-xs font-medium text-gray-600">Facebook</span>
                                    </button>

                                    {/* Twitter/X */}
                                    <button
                                        onClick={() => {
                                            const text = `Check out this amazing farmhouse: ${farmhouse.name}`;
                                            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`, '_blank');
                                        }}
                                        className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-100 transition-colors group"
                                    >
                                        <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Twitter className="h-6 w-6 text-white" />
                                        </div>
                                        <span className="text-xs font-medium text-gray-600">X</span>
                                    </button>

                                    {/* LinkedIn */}
                                    <button
                                        onClick={() => {
                                            window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank');
                                        }}
                                        className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-blue-50 transition-colors group"
                                    >
                                        <div className="w-12 h-12 bg-blue-700 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Linkedin className="h-6 w-6 text-white" />
                                        </div>
                                        <span className="text-xs font-medium text-gray-600">LinkedIn</span>
                                    </button>
                                </div>

                                {/* Email Share */}
                                <button
                                    onClick={() => {
                                        const subject = `Check out this farmhouse: ${farmhouse.name}`;
                                        const body = `I found this amazing farmhouse and thought you might be interested!\n\n${farmhouse.name}\n${farmhouse.location?.city}, ${farmhouse.location?.state}\nPrice: ₹${farmhouse.pricing?.pricePerNight?.toLocaleString()} per day\n\n${window.location.href}`;
                                        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                                    }}
                                    className="w-full flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all mb-4"
                                >
                                    <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                                        <Mail className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium text-gray-900">Share via Email</p>
                                        <p className="text-sm text-gray-500">Send to friends or family</p>
                                    </div>
                                </button>

                                {/* Copy Link */}
                                <div className="relative">
                                    <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-xl">
                                        <ExternalLink className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                        <input
                                            type="text"
                                            readOnly
                                            value={window.location.href}
                                            className="flex-1 bg-transparent text-sm text-gray-600 outline-none truncate"
                                        />
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(window.location.href);
                                                setLinkCopied(true);
                                                toast.success('Link copied to clipboard!');
                                                setTimeout(() => setLinkCopied(false), 2000);
                                            }}
                                            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium text-sm transition-all ${linkCopied
                                                ? 'bg-green-500 text-white'
                                                : 'bg-gray-900 text-white hover:bg-gray-800'
                                                }`}
                                        >
                                            {linkCopied ? (
                                                <>
                                                    <Check className="h-4 w-4" />
                                                    Copied!
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="h-4 w-4" />
                                                    Copy
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Native Share (Mobile) */}
                                {navigator.share && (
                                    <button
                                        onClick={async () => {
                                            try {
                                                await navigator.share({
                                                    title: farmhouse.name,
                                                    text: `Check out this amazing farmhouse: ${farmhouse.name} in ${farmhouse.location?.city}`,
                                                    url: window.location.href
                                                });
                                            } catch (err) {
                                                console.log('Share cancelled');
                                            }
                                        }}
                                        className="w-full mt-4 p-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                    >
                                        <Share className="h-5 w-5" />
                                        More sharing options
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-12">
                    {/* Left Column: Details */}
                    <div className="lg:col-span-2 space-y-5 md:space-y-6 lg:space-y-8 px-4 sm:px-0">
                        {/* Premium Host Info Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div className="h-16 w-16 md:h-18 md:w-18 rounded-2xl bg-gradient-to-br from-rose-500 via-pink-500 to-purple-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg flex-shrink-0 overflow-hidden">
                                            {farmhouse.vendor?.profileImage ? (
                                                <img src={farmhouse.vendor.profileImage} alt={farmhouse.vendor.name} className="h-full w-full object-cover" />
                                            ) : (
                                                farmhouse.vendor?.name ? farmhouse.vendor.name[0].toUpperCase() : 'H'
                                            )}
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 bg-green-500 h-5 w-5 rounded-full border-2 border-white flex items-center justify-center">
                                            <Check className="h-3 w-3 text-white" />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-rose-600 uppercase tracking-wide mb-1">Your Host</p>
                                        <h2 className="text-xl font-bold text-gray-900">{farmhouse.vendor?.name || 'Host'}</h2>
                                        {farmhouse.vendor?.about && (
                                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{farmhouse.vendor.about}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Premium Property Highlights */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-rose-500" />
                                Property Highlights
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="group flex flex-col items-center text-center p-5 bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl border border-rose-100 hover:border-rose-200 hover:shadow-sm transition-all duration-300">
                                    <div className="p-3 bg-white rounded-xl shadow-sm mb-3 group-hover:scale-110 transition-transform duration-300">
                                        <Users className="h-6 w-6 text-rose-600" />
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900">{farmhouse.capacity?.guests}</p>
                                    <p className="text-sm text-gray-500 font-medium">Guests</p>
                                </div>
                                <div className="group flex flex-col items-center text-center p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 hover:border-blue-200 hover:shadow-sm transition-all duration-300">
                                    <div className="p-3 bg-white rounded-xl shadow-sm mb-3 group-hover:scale-110 transition-transform duration-300">
                                        <Bed className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900">{farmhouse.capacity?.bedrooms}</p>
                                    <p className="text-sm text-gray-500 font-medium">Bedrooms</p>
                                </div>
                                <div className="group flex flex-col items-center text-center p-5 bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl border border-purple-100 hover:border-purple-200 hover:shadow-sm transition-all duration-300">
                                    <div className="p-3 bg-white rounded-xl shadow-sm mb-3 group-hover:scale-110 transition-transform duration-300">
                                        <Bath className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900">{farmhouse.capacity?.bathrooms}</p>
                                    <p className="text-sm text-gray-500 font-medium">Bathrooms</p>
                                </div>
                                <div className="group flex flex-col items-center text-center p-5 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100 hover:border-amber-200 hover:shadow-sm transition-all duration-300">
                                    <div className="p-3 bg-white rounded-xl shadow-sm mb-3 group-hover:scale-110 transition-transform duration-300">
                                        <Home className="h-6 w-6 text-amber-600" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-900">{farmhouse.type}</p>
                                    <p className="text-sm text-gray-500 font-medium">Property</p>
                                </div>
                            </div>
                        </div>

                        {/* Premium Description */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Info className="h-5 w-5 text-rose-500" />
                                About this place
                            </h2>
                            <div className="prose prose-gray max-w-none">
                                <p className="text-gray-600 leading-relaxed whitespace-pre-line text-base">
                                    {showFullDescription ? farmhouse.description : descriptionPreview}
                                    {!showFullDescription && farmhouse.description?.length > 400 && '...'}
                                </p>
                            </div>
                            {farmhouse.description?.length > 400 && (
                                <button
                                    onClick={() => setShowFullDescription(!showFullDescription)}
                                    className="mt-5 inline-flex items-center gap-1.5 font-semibold text-rose-600 hover:text-rose-700 transition-colors group"
                                >
                                    <span className="underline underline-offset-4">{showFullDescription ? 'Show less' : 'Show more'}</span>
                                    <ArrowRight className={`h-4 w-4 transition-transform duration-300 ${showFullDescription ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
                                </button>
                            )}
                        </div>

                        {/* Premium Location Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300 overflow-hidden relative">
                            <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-rose-500" />
                                Location
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100">
                                    <div className="p-2 bg-rose-100 rounded-lg flex-shrink-0">
                                        <MapPin className="h-5 w-5 text-rose-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{farmhouse.location.address}</p>
                                        <p className="text-sm text-gray-500 mt-1">{farmhouse.location.city}, {farmhouse.location.state} - {farmhouse.location.zip}</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        const address = `${farmhouse.location.address}, ${farmhouse.location.city}, ${farmhouse.location.state} ${farmhouse.location.zip}`;
                                        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
                                        window.open(mapsUrl, '_blank');
                                    }}
                                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white font-semibold py-3.5 px-4 rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-200 group"
                                >
                                    <MapPin className="h-5 w-5 group-hover:animate-bounce" />
                                    View on Google Maps
                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </button>

                                <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-1.5">
                                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                    Opens in a new tab
                                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                    Get directions and explore
                                </p>
                            </div>
                        </div>

                        {/* Premium Amenities */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-rose-500" />
                                What this place offers
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {displayedAmenities.map((amenity, idx) => {
                                    const IconComponent = getAmenityIcon(amenity);
                                    return (
                                        <div
                                            key={idx}
                                            className="group flex items-center gap-3 p-3 rounded-xl bg-gray-50/50 hover:bg-gradient-to-r hover:from-rose-50 hover:to-pink-50 border border-transparent hover:border-rose-100 transition-all duration-200"
                                        >
                                            <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow group-hover:scale-110 transition-all duration-200">
                                                <IconComponent className="h-4 w-4 text-rose-500" />
                                            </div>
                                            <span className="text-gray-700 font-medium">{amenity}</span>
                                        </div>
                                    );
                                })}
                            </div>
                            {farmhouse.amenities.length > 10 && (
                                <button
                                    onClick={() => setShowAllAmenities(!showAllAmenities)}
                                    className="mt-6 inline-flex items-center gap-2 border-2 border-gray-900 rounded-xl px-6 py-3 font-semibold text-gray-900 hover:bg-gray-900 hover:text-white transition-all duration-200"
                                >
                                    {showAllAmenities ? 'Show less' : `Show all ${farmhouse.amenities.length} amenities`}
                                    <ChevronRight className={`h-4 w-4 transition-transform duration-200 ${showAllAmenities ? 'rotate-90' : ''}`} />
                                </button>
                            )}
                        </div>

                        {/* Premium House Rules */}
                        {farmhouse.rules && farmhouse.rules.length > 0 && (
                            <div className="bg-gradient-to-br from-amber-50 via-white to-orange-50 rounded-2xl shadow-sm border border-amber-100 p-6 hover:shadow-md transition-shadow duration-300">
                                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <AlertCircle className="h-5 w-5 text-amber-500" />
                                    House Rules
                                </h2>
                                <div className="space-y-3">
                                    {displayedRules.map((rule, idx) => (
                                        <div key={idx} className="flex items-start gap-3 p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-amber-100/50">
                                            <div className="p-1.5 bg-amber-100 rounded-lg flex-shrink-0 mt-0.5">
                                                <Check className="h-3 w-3 text-amber-700" />
                                            </div>
                                            <span className="text-gray-700">{rule}</span>
                                        </div>
                                    ))}
                                </div>
                                {farmhouse.rules.length > 5 && (
                                    <button
                                        onClick={() => setShowAllRules(!showAllRules)}
                                        className="mt-5 inline-flex items-center gap-1.5 font-semibold text-amber-700 hover:text-amber-800 transition-colors"
                                    >
                                        <span className="underline underline-offset-4">{showAllRules ? 'Show less' : `Show all ${farmhouse.rules.length} rules`}</span>
                                        <ArrowRight className={`h-4 w-4 transition-transform duration-300 ${showAllRules ? 'rotate-90' : ''}`} />
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Premium Booking Policy */}
                        {farmhouse.bookingPolicy && (
                            <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 rounded-2xl shadow-sm border border-blue-100 p-6 hover:shadow-md transition-shadow duration-300">
                                <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-blue-500" />
                                    Booking Policy
                                </h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-blue-100">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Sun className="h-4 w-4 text-amber-500" />
                                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Minimum Stay</span>
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900">{farmhouse.bookingPolicy.minDuration} <span className="text-sm font-medium text-gray-500">day(s)</span></p>
                                    </div>
                                    <div className="p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-blue-100">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Moon className="h-4 w-4 text-indigo-500" />
                                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Maximum Stay</span>
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900">{farmhouse.bookingPolicy.maxDuration} <span className="text-sm font-medium text-gray-500">day(s)</span></p>
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                    <Info className="h-4 w-4 text-blue-600 flex-shrink-0" />
                                    <p className="text-xs text-blue-700">Check-in and check-out times are both at 11:00 AM</p>
                                </div>
                            </div>
                        )}

                        {/* Premium Caretaker Info */}
                        {farmhouse.caretaker?.name && (
                            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-green-50 rounded-2xl shadow-sm border border-emerald-200 p-6 hover:shadow-md transition-shadow duration-300">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-100 to-transparent rounded-bl-full opacity-50"></div>
                                <div className="relative">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl shadow-lg">
                                            <Shield className="h-6 w-6 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h2 className="text-xl font-bold text-gray-900 mb-1">On-site Caretaker Available</h2>
                                            <p className="text-gray-600">A dedicated caretaker will be available to assist you during your stay, ensuring a comfortable and hassle-free experience.</p>
                                            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-100 rounded-full">
                                                <Check className="h-4 w-4 text-emerald-600" />
                                                <span className="text-sm font-medium text-emerald-700">24/7 Support</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Booking Widget */}
                    <div className="lg:col-span-1 relative">
                        {/* Premium Mobile: Fixed Bottom Booking Bar */}
                        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200/50 p-4 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
                            <div className="flex items-center justify-between max-w-lg mx-auto">
                                <div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">₹{farmhouse.pricing?.pricePerNight?.toLocaleString()}</span>
                                        <span className="text-sm text-gray-500 font-medium">/ 24 hrs</span>
                                    </div>
                                    {startDate && endDate && (
                                        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                            <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                            {nights} {nights === 1 ? 'day' : 'days'} • ₹{totalPrice.toLocaleString()}
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={() => {
                                        const bookingSection = document.getElementById('mobile-booking-section');
                                        if (bookingSection) {
                                            bookingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                        }
                                    }}
                                    className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white font-bold px-6 py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 shadow-md"
                                >
                                    Reserve
                                </button>
                            </div>
                        </div>

                        {/* Premium Desktop: Sticky Sidebar Widget */}
                        <div className="hidden lg:block sticky top-24 bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden">
                            {/* Price Header with Gradient */}
                            <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 p-6 text-white">
                                <div className="flex items-end justify-between">
                                    <div>
                                        <p className="text-rose-100 text-sm font-medium mb-1">Starting from</p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-bold">₹{farmhouse.pricing?.pricePerNight?.toLocaleString()}</span>
                                            <span className="text-rose-100 text-base font-medium">/ 24 hrs</span>
                                        </div>
                                    </div>
                                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                                        <Sparkles className="h-5 w-5" />
                                    </div>
                                </div>
                            </div>

                            <div className="p-6">

                                {/* Date Selection with Modern UI */}
                                <div className="space-y-4 mb-6">
                                    {/* Check-In Date */}
                                    <div className="bg-white border-2 border-gray-300 rounded-2xl p-5 hover:border-rose-400 transition-all duration-200 shadow-sm hover:shadow-md">
                                        <div className="flex items-center mb-3">
                                            <div className="bg-rose-100 p-2 rounded-lg mr-3">
                                                <Calendar className="h-5 w-5 text-rose-600" />
                                            </div>
                                            <label className="text-sm font-bold text-gray-900 uppercase tracking-wide">Check-In Date</label>
                                        </div>
                                        <DatePicker
                                            selected={startDate}
                                            onChange={(date) => setStartDate(date)}
                                            selectsStart
                                            startDate={startDate}
                                            endDate={endDate}
                                            minDate={new Date(new Date().setDate(new Date().getDate() + 1))}
                                            excludeDates={farmhouse.unavailableDates?.map(date => new Date(date)) || []}
                                            className="w-full text-lg font-bold text-gray-900 border-none focus:outline-none cursor-pointer bg-transparent"
                                            dateFormat="EEEE, dd MMMM yyyy"
                                            placeholderText="Select check-in date"
                                        />
                                        <div className="flex items-center mt-2 text-sm text-gray-600">
                                            <Clock className="h-4 w-4 mr-2 text-gray-500" />
                                            <span>Check-in time: 11:00 AM</span>
                                        </div>
                                    </div>

                                    {/* Check-Out Date */}
                                    <div className="bg-white border-2 border-gray-300 rounded-2xl p-5 hover:border-rose-400 transition-all duration-200 shadow-sm hover:shadow-md">
                                        <div className="flex items-center mb-3">
                                            <div className="bg-blue-100 p-2 rounded-lg mr-3">
                                                <Calendar className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <label className="text-sm font-bold text-gray-900 uppercase tracking-wide">Check-Out Date</label>
                                        </div>
                                        <DatePicker
                                            selected={endDate}
                                            onChange={(date) => setEndDate(date)}
                                            selectsEnd
                                            startDate={startDate}
                                            endDate={endDate}
                                            minDate={startDate ? new Date(new Date(startDate).setDate(startDate.getDate() + 1)) : new Date(new Date().setDate(new Date().getDate() + 2))}
                                            excludeDates={farmhouse.unavailableDates?.map(date => new Date(date)) || []}
                                            className="w-full text-lg font-bold text-gray-900 border-none focus:outline-none cursor-pointer bg-transparent"
                                            dateFormat="EEEE, dd MMMM yyyy"
                                            placeholderText="Select check-out date"
                                        />
                                        <div className="flex items-center mt-2 text-sm text-gray-600">
                                            <Clock className="h-4 w-4 mr-2 text-gray-500" />
                                            <span>Check-out time: 11:00 AM</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Duration & Availability Info */}
                                {startDate && endDate && (
                                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-4 mb-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs font-semibold text-green-900 uppercase tracking-wide">Total Duration</p>
                                                <p className="text-2xl font-bold text-green-900 mt-1">
                                                    {nights} {nights === 1 ? 'Day' : 'Days'}
                                                </p>
                                                <p className="text-xs text-green-700 mt-1">11:00 AM to 11:00 AM</p>
                                            </div>
                                            <div className="bg-green-200 p-3 rounded-full">
                                                <Check className="h-7 w-7 text-green-700" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {(!startDate || !endDate) && (
                                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-4 mb-6">
                                        <div className="flex items-start">
                                            <AlertCircle className="h-5 w-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-semibold text-amber-900">Select Your Dates</p>
                                                <p className="text-xs text-amber-700 mt-1">
                                                    • Check-in starts from tomorrow<br />
                                                    • Both check-in & check-out at 11:00 AM<br />
                                                    • Minimum 1 day booking required
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Premium Guests Selector */}
                                <div className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-2xl p-4 mb-6">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-purple-100 rounded-lg">
                                                <Users className="h-4 w-4 text-purple-600" />
                                            </div>
                                            <span className="text-sm font-bold text-gray-900 uppercase tracking-wide">Guests</span>
                                        </div>
                                        <span className="text-xs text-gray-500">Max {farmhouse.capacity?.guests}</span>
                                    </div>
                                    <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100">
                                        <button
                                            onClick={() => setGuests(Math.max(1, guests - 1))}
                                            className="h-10 w-10 rounded-xl bg-gray-100 hover:bg-rose-100 flex items-center justify-center hover:text-rose-600 transition-all duration-200"
                                        >
                                            <Minus className="h-4 w-4" />
                                        </button>
                                        <div className="text-center">
                                            <span className="font-bold text-2xl text-gray-900">{guests}</span>
                                            <p className="text-xs text-gray-500">{guests === 1 ? 'Guest' : 'Guests'}</p>
                                        </div>
                                        <button
                                            onClick={() => setGuests(Math.min(farmhouse.capacity?.guests || 10, guests + 1))}
                                            className="h-10 w-10 rounded-xl bg-gray-100 hover:bg-rose-100 flex items-center justify-center hover:text-rose-600 transition-all duration-200"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Premium Reserve Button */}
                                <button
                                    onClick={handleReserve}
                                    disabled={bookingLoading}
                                    className="w-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white font-bold py-4 rounded-2xl hover:shadow-xl hover:scale-[1.02] transition-all duration-200 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 text-lg group"
                                >
                                    {bookingLoading ? (
                                        <Loader2 className="h-6 w-6 animate-spin" />
                                    ) : (
                                        <>
                                            Reserve Now
                                            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                                <p className="text-center text-sm text-gray-400 mt-3 flex items-center justify-center gap-1.5">
                                    <Shield className="h-4 w-4" />
                                    You won't be charged yet
                                </p>

                                {/* Price Breakdown */}
                                <div className="mt-6 space-y-3 pt-6 border-t-2 border-gray-200">
                                    <div className="flex justify-between text-gray-700">
                                        <span>₹{farmhouse.pricing?.pricePerNight?.toLocaleString()} x {nights} {nights === 1 ? 'day' : 'days'}</span>
                                        <span>₹{basePrice.toLocaleString()}</span>
                                    </div>
                                    {farmhouse.pricing?.cleaningFee > 0 && (
                                        <div className="flex justify-between text-gray-700">
                                            <span>Cleaning fee</span>
                                            <span>₹{farmhouse.pricing.cleaningFee.toLocaleString()}</span>
                                        </div>
                                    )}
                                    {farmhouse.pricing?.securityDeposit > 0 && (
                                        <div className="flex justify-between text-gray-700 border-t border-gray-200 pt-3">
                                            <span className="flex items-center">
                                                <Shield className="h-4 w-4 mr-1.5 text-amber-600" />
                                                Security Deposit
                                            </span>
                                            <span>₹{farmhouse.pricing.securityDeposit.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-gray-900 font-bold text-lg pt-4 border-t-2 border-gray-300">
                                        <span>Total</span>
                                        <span>₹{totalPrice.toLocaleString()}</span>
                                    </div>
                                    <div className="bg-gradient-to-br from-rose-50 to-pink-50 border-2 border-rose-200 rounded-xl p-4 mt-4">
                                        <p className="text-sm text-rose-900 font-bold mb-3 flex items-center">
                                            <DollarSign className="h-4 w-4 mr-1.5" />
                                            Payment Terms:
                                        </p>
                                        <div className="space-y-2 text-sm text-rose-800">
                                            <div className="flex justify-between bg-white bg-opacity-50 p-2 rounded-lg">
                                                <span>• Advance (30%):</span>
                                                <span className="font-bold">₹{advancePayment.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between bg-white bg-opacity-50 p-2 rounded-lg">
                                                <span>• At Venue (70%):</span>
                                                <span className="font-bold">₹{payAtVenue.toLocaleString()}</span>
                                            </div>
                                        </div>
                                        <p className="text-xs text-rose-700 mt-3 bg-white bg-opacity-50 p-2 rounded-lg">
                                            📌 Check-in: 11:00 AM | Check-out: 11:00 AM
                                        </p>
                                    </div>

                                    {/* Cancellation Policy */}
                                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-4 mt-4">
                                        <p className="text-sm text-amber-900 font-bold mb-3 flex items-center">
                                            <AlertCircle className="h-4 w-4 mr-1.5" />
                                            Cancellation Policy:
                                        </p>
                                        <div className="space-y-2 text-xs text-amber-800">
                                            <div className="bg-white bg-opacity-50 p-2 rounded-lg">
                                                • <span className="font-semibold">48+ hours before:</span> 100% refund
                                            </div>
                                            <div className="bg-white bg-opacity-50 p-2 rounded-lg">
                                                • <span className="font-semibold">24-48 hours:</span> 50% refund
                                            </div>
                                            <div className="bg-white bg-opacity-50 p-2 rounded-lg">
                                                • <span className="font-semibold">{'<'}24 hours:</span> No refund
                                            </div>
                                        </div>
                                        <p className="text-xs text-amber-700 mt-3 bg-white bg-opacity-50 p-2 rounded-lg">
                                            ℹ️ Refunds processed within 5-7 business days
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Booking Section - Full Form */}
                    <div id="mobile-booking-section" className="lg:hidden px-3 sm:px-4 pb-20">
                        <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-xl p-4 md:p-6">
                            <div className="flex justify-between items-baseline mb-4 pb-4 border-b-2 border-gray-100">
                                <div>
                                    <span className="text-2xl md:text-3xl font-bold text-gray-900">₹{farmhouse.pricing?.pricePerNight?.toLocaleString()}</span>
                                    <span className="text-gray-600 text-sm md:text-base ml-1">/ 24 hrs</span>
                                </div>
                            </div>

                            {/* Date Selection */}
                            <div className="space-y-3 mb-4">
                                {/* Check-In */}
                                <div className="bg-white border-2 border-gray-300 rounded-2xl p-4 hover:border-rose-400 transition-all">
                                    <div className="flex items-center mb-2">
                                        <div className="bg-rose-100 p-2 rounded-lg mr-2">
                                            <Calendar className="h-4 w-4 text-rose-600" />
                                        </div>
                                        <label className="text-xs font-bold text-gray-900 uppercase tracking-wide">Check-In</label>
                                    </div>
                                    <DatePicker
                                        selected={startDate}
                                        onChange={(date) => setStartDate(date)}
                                        selectsStart
                                        startDate={startDate}
                                        endDate={endDate}
                                        minDate={new Date(new Date().setDate(new Date().getDate() + 1))}
                                        excludeDates={farmhouse.unavailableDates?.map(date => new Date(date)) || []}
                                        className="w-full text-base font-bold text-gray-900 border-none focus:outline-none bg-transparent"
                                        dateFormat="EEEE, dd MMMM yyyy"
                                        placeholderText="Select check-in date"
                                    />
                                    <div className="flex items-center mt-1 text-xs text-gray-600">
                                        <Clock className="h-3 w-3 mr-1 text-gray-500" />
                                        <span>11:00 AM</span>
                                    </div>
                                </div>

                                {/* Check-Out */}
                                <div className="bg-white border-2 border-gray-300 rounded-2xl p-4 hover:border-rose-400 transition-all">
                                    <div className="flex items-center mb-2">
                                        <div className="bg-blue-100 p-2 rounded-lg mr-2">
                                            <Calendar className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <label className="text-xs font-bold text-gray-900 uppercase tracking-wide">Check-Out</label>
                                    </div>
                                    <DatePicker
                                        selected={endDate}
                                        onChange={(date) => setEndDate(date)}
                                        selectsEnd
                                        startDate={startDate}
                                        endDate={endDate}
                                        minDate={startDate
                                            ? new Date(new Date(startDate).getTime() + (farmhouse.bookingPolicy?.minDuration || 1) * 24 * 60 * 60 * 1000)
                                            : new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000)}
                                        maxDate={startDate && farmhouse.bookingPolicy?.maxDuration
                                            ? new Date(new Date(startDate).getTime() + (farmhouse.bookingPolicy?.maxDuration) * 24 * 60 * 60 * 1000)
                                            : null}
                                        excludeDates={farmhouse.unavailableDates?.map(date => new Date(date)) || []}
                                        className="w-full text-base font-bold text-gray-900 border-none focus:outline-none bg-transparent"
                                        dateFormat="EEEE, dd MMMM yyyy"
                                        placeholderText="Select check-out date"
                                    />
                                    <div className="flex items-center mt-1 text-xs text-gray-600">
                                        <Clock className="h-3 w-3 mr-1 text-gray-500" />
                                        <span>11:00 AM</span>
                                    </div>
                                </div>
                            </div>

                            {/* Duration Info */}
                            {startDate && endDate && (
                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-3 mb-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-semibold text-green-900 uppercase">Total Duration</p>
                                            <p className="text-xl font-bold text-green-900 mt-1">{nights} {nights === 1 ? 'Day' : 'Days'}</p>
                                            <p className="text-xs text-green-700 mt-0.5">11:00 AM to 11:00 AM</p>
                                        </div>
                                        <div className="bg-green-200 p-2 rounded-full">
                                            <Check className="h-5 w-5 text-green-700" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Guests */}
                            <div className="border-2 border-gray-300 rounded-xl p-3 mb-4">
                                <label className="text-xs font-bold text-gray-900 block mb-2">GUESTS</label>
                                <div className="flex items-center justify-between">
                                    <button
                                        onClick={() => setGuests(Math.max(1, guests - 1))}
                                        className="h-10 w-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-900 transition-colors font-bold touch-target"
                                    >
                                        <Minus className="h-4 w-4" />
                                    </button>
                                    <span className="font-bold text-lg">{guests}</span>
                                    <button
                                        onClick={() => setGuests(Math.min(farmhouse.capacity?.guests || 10, guests + 1))}
                                        className="h-10 w-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-900 transition-colors font-bold touch-target"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Reserve Button */}
                            <button
                                onClick={handleReserve}
                                disabled={bookingLoading}
                                className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold py-4 rounded-xl hover:from-rose-600 hover:to-pink-700 transition-all shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center text-base touch-target"
                            >
                                {bookingLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    'Reserve Now'
                                )}
                            </button>
                            <p className="text-center text-xs text-gray-500 mt-2 font-medium">You won't be charged yet</p>

                            {/* Price Breakdown */}
                            {startDate && endDate && (
                                <div className="mt-4 space-y-2 pt-4 border-t-2 border-gray-200">
                                    <div className="flex justify-between text-sm text-gray-700">
                                        <span>₹{farmhouse.pricing?.pricePerNight?.toLocaleString()} x {nights} {nights === 1 ? 'day' : 'days'}</span>
                                        <span>₹{basePrice.toLocaleString()}</span>
                                    </div>
                                    {farmhouse.pricing?.cleaningFee > 0 && (
                                        <div className="flex justify-between text-sm text-gray-700">
                                            <span>Cleaning fee</span>
                                            <span>₹{farmhouse.pricing.cleaningFee.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-gray-900 font-bold text-base pt-3 border-t-2 border-gray-300">
                                        <span>Total</span>
                                        <span>₹{totalPrice.toLocaleString()}</span>
                                    </div>
                                    <div className="bg-gradient-to-br from-rose-50 to-pink-50 border-2 border-rose-200 rounded-xl p-3 mt-3">
                                        <p className="text-xs text-rose-900 font-bold mb-2 flex items-center">
                                            <DollarSign className="h-3 w-3 mr-1" />
                                            Payment Terms:
                                        </p>
                                        <div className="space-y-1.5 text-xs text-rose-800">
                                            <div className="flex justify-between bg-white bg-opacity-50 p-2 rounded-lg">
                                                <span>• Advance (30%):</span>
                                                <span className="font-bold">₹{advancePayment.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between bg-white bg-opacity-50 p-2 rounded-lg">
                                            </div>
                                            {/* Stay Policy */}
                                            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-xl p-3 mt-3">
                                                <p className="text-xs text-indigo-900 font-bold mb-2 flex items-center">
                                                    <Calendar className="h-3 w-3 mr-1" />
                                                    Stay Policy:
                                                </p>
                                                <div className="space-y-1.5 text-xs text-indigo-800">
                                                    <div className="flex justify-between bg-white bg-opacity-50 p-2 rounded-lg">
                                                        <span>• Minimum Stay:</span>
                                                        <span className="font-bold">{farmhouse.bookingPolicy?.minDuration || 1} {(farmhouse.bookingPolicy?.minDuration || 1) === 1 ? 'Day' : 'Days'}</span>
                                                    </div>
                                                    <div className="flex justify-between bg-white bg-opacity-50 p-2 rounded-lg">
                                                        <span>• Maximum Stay:</span>
                                                        <span className="font-bold">{farmhouse.bookingPolicy?.maxDuration || 30} Days</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Cancellation Policy */}
                                            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-3 mt-3">
                                                <p className="text-xs text-amber-900 font-bold mb-2 flex items-center">
                                                    <AlertCircle className="h-3 w-3 mr-1" />
                                                    Cancellation Policy:
                                                </p>
                                                <div className="space-y-1.5 text-xs text-amber-800">
                                                    <div className="bg-white bg-opacity-50 p-1.5 rounded-lg">
                                                        • <span className="font-semibold">48+ hours:</span> 100% refund
                                                    </div>
                                                    <div className="bg-white bg-opacity-50 p-1.5 rounded-lg">
                                                        • <span className="font-semibold">24-48 hours:</span> 50% refund
                                                    </div>
                                                    <div className="bg-white bg-opacity-50 p-1.5 rounded-lg">
                                                        • <span className="font-semibold">{'<'}24 hours:</span> No refund
                                                    </div>
                                                </div>
                                                <p className="text-xs text-amber-700 mt-2 bg-white bg-opacity-50 p-1.5 rounded-lg">
                                                    ℹ️ Refunds within 5-7 business days
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Reviews Section - Matches Content Width */}
                    <div className="lg:col-span-3 px-4 sm:px-0 pb-20 lg:pb-8">
                        <ReviewsSection farmhouseId={farmhouse._id} />
                    </div>
                </div>
            </div>

            {/* Mobile Number Modal */}
            {
                showPhoneModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fadeIn">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-rose-100 rounded-full">
                                        <Phone className="h-6 w-6 text-rose-600" />
                                    </div>
                                    <button
                                        onClick={() => setShowPhoneModal(false)}
                                        className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    Add Mobile Number
                                </h3>
                                <p className="text-gray-600 mb-6 font-medium">
                                    To ensure smooth communication for your booking, please add your mobile number.
                                </p>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">
                                            Mobile Number
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium border-r pr-2 border-gray-300">
                                                +91
                                            </span>
                                            <input
                                                type="tel"
                                                value={mobileNumber}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, '');
                                                    if (val.length <= 10) setMobileNumber(val);
                                                }}
                                                className="w-full pl-14 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-rose-500 focus:ring-0 font-bold text-gray-900 transition-all placeholder-gray-400"
                                                placeholder="98765 43210"
                                            />
                                        </div>
                                        {mobileNumber.length > 0 && mobileNumber.length < 10 && (
                                            <p className="text-rose-500 text-xs mt-1 font-medium">
                                                Please enter 10 digits
                                            </p>
                                        )}
                                    </div>

                                    <button
                                        onClick={handleSaveMobile}
                                        disabled={mobileNumber.length !== 10}
                                        className="w-full bg-rose-600 text-white font-bold py-3.5 rounded-xl hover:bg-rose-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-rose-200"
                                    >
                                        Save & Continue Booking
                                    </button>

                                    <p className="text-xs text-center text-gray-400">
                                        This number will be shared with the host after booking confirmation.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default FarmhouseDetails;
