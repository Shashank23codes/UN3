import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    ChevronLeft, ChevronRight, Calendar as CalendarIcon, Home, Users,
    Clock, Loader2, Filter, X, Check, AlertCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const CalendarView = () => {
    const [loading, setLoading] = useState(true);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [bookings, setBookings] = useState([]);
    const [farmhouses, setFarmhouses] = useState([]);
    const [selectedFarmhouse, setSelectedFarmhouse] = useState('all');
    const [selectedBooking, setSelectedBooking] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('vendorToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const [bookingsRes, farmhousesRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/api/bookings/vendor-bookings`, config),
                axios.get(`${import.meta.env.VITE_API_URL}/api/farmhouses/my-farmhouses`, config)
            ]);

            setBookings(bookingsRes.data);
            setFarmhouses(farmhousesRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load calendar data');
        } finally {
            setLoading(false);
        }
    };

    const getDaysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const navigateMonth = (direction) => {
        const newDate = new Date(currentMonth);
        newDate.setMonth(newDate.getMonth() + direction);
        setCurrentMonth(newDate);
    };

    const getBookingsForDate = (date) => {
        return bookings.filter(booking => {
            if (selectedFarmhouse !== 'all' && booking.farmhouse?._id !== selectedFarmhouse) {
                return false;
            }
            const checkIn = new Date(booking.checkIn);
            const checkOut = new Date(booking.checkOut);
            checkIn.setHours(0, 0, 0, 0);
            checkOut.setHours(0, 0, 0, 0);
            date.setHours(0, 0, 0, 0);
            return date >= checkIn && date <= checkOut;
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return 'bg-green-500';
            case 'pending': return 'bg-amber-500';
            case 'checked-in': return 'bg-blue-500';
            case 'completed': return 'bg-gray-500';
            case 'cancelled': return 'bg-red-500';
            default: return 'bg-gray-400';
        }
    };

    const getStatusBg = (status) => {
        switch (status) {
            case 'confirmed': return 'bg-green-50 border-green-200';
            case 'pending': return 'bg-amber-50 border-amber-200';
            case 'checked-in': return 'bg-blue-50 border-blue-200';
            case 'completed': return 'bg-gray-50 border-gray-200';
            case 'cancelled': return 'bg-red-50 border-red-200';
            default: return 'bg-gray-50 border-gray-200';
        }
    };

    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(currentMonth);
        const firstDay = getFirstDayOfMonth(currentMonth);
        const days = [];

        // Empty cells
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-32 border border-gray-100 bg-gray-50/50" />);
        }

        // Days
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
            const dayBookings = getBookingsForDate(new Date(date));
            const isToday = new Date().toDateString() === date.toDateString();

            days.push(
                <div
                    key={day}
                    className={`h-32 border border-gray-100 p-2 overflow-hidden hover:bg-gray-50 transition-colors ${isToday ? 'bg-emerald-50 border-emerald-200' : ''}`}
                >
                    <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-emerald-600' : 'text-gray-700'}`}>
                        {day}
                    </div>
                    <div className="space-y-1 overflow-y-auto max-h-24">
                        {dayBookings.slice(0, 3).map((booking, idx) => (
                            <button
                                key={booking._id}
                                onClick={() => setSelectedBooking(booking)}
                                className={`w-full text-left px-2 py-1 rounded text-xs font-medium truncate ${getStatusColor(booking.status)} text-white hover:opacity-90 transition-opacity`}
                            >
                                {booking.farmhouse?.name || 'Booking'}
                            </button>
                        ))}
                        {dayBookings.length > 3 && (
                            <div className="text-xs text-gray-500 font-medium">
                                +{dayBookings.length - 3} more
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return days;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Booking Calendar</h1>
                    <p className="text-gray-500 mt-1">Visual overview of all your bookings</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={selectedFarmhouse}
                        onChange={(e) => setSelectedFarmhouse(e.target.value)}
                        className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                        <option value="all">All Properties</option>
                        {farmhouses.map(fh => (
                            <option key={fh._id} value={fh._id}>{fh.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Calendar Navigation */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <button
                        onClick={() => navigateMonth(-1)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ChevronLeft className="h-5 w-5 text-gray-600" />
                    </button>
                    <h2 className="text-xl font-bold text-gray-900">
                        {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h2>
                    <button
                        onClick={() => navigateMonth(1)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ChevronRight className="h-5 w-5 text-gray-600" />
                    </button>
                </div>

                {/* Day Headers */}
                <div className="grid grid-cols-7 border-b border-gray-100">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="py-3 text-center text-sm font-semibold text-gray-500 bg-gray-50">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7">
                    {renderCalendar()}
                </div>
            </div>

            {/* Legend */}
            <div className="mt-6 flex flex-wrap items-center gap-4">
                <span className="text-sm font-medium text-gray-500">Status:</span>
                {[
                    { status: 'confirmed', label: 'Confirmed' },
                    { status: 'pending', label: 'Pending' },
                    { status: 'checked-in', label: 'Checked In' },
                    { status: 'completed', label: 'Completed' },
                    { status: 'cancelled', label: 'Cancelled' }
                ].map(({ status, label }) => (
                    <div key={status} className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`}></div>
                        <span className="text-sm text-gray-600">{label}</span>
                    </div>
                ))}
            </div>

            {/* Booking Details Modal */}
            {selectedBooking && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
                        <div className={`p-6 ${getStatusBg(selectedBooking.status)} border-b`}>
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">
                                        {selectedBooking.farmhouse?.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Booking #{selectedBooking._id.slice(-6).toUpperCase()}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedBooking(null)}
                                    className="p-2 hover:bg-white/50 rounded-full transition-colors"
                                >
                                    <X className="h-5 w-5 text-gray-500" />
                                </button>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <CalendarIcon className="h-4 w-4 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Check-in</p>
                                        <p className="font-medium text-gray-900">
                                            {new Date(selectedBooking.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <CalendarIcon className="h-4 w-4 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Check-out</p>
                                        <p className="font-medium text-gray-900">
                                            {new Date(selectedBooking.checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-100 rounded-lg">
                                    <Users className="h-4 w-4 text-gray-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Guest</p>
                                    <p className="font-medium text-gray-900">{selectedBooking.user?.name || 'Guest'}</p>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-gray-100">
                                <button
                                    onClick={() => {
                                        navigate(`/dashboard/bookings/${selectedBooking._id}`);
                                        setSelectedBooking(null);
                                    }}
                                    className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
                                >
                                    View Full Details
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CalendarView;
