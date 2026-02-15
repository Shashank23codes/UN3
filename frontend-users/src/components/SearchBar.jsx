import React, { useState } from 'react';
import { Search, MapPin, Calendar, Users, X } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate } from 'react-router-dom';
import { saveRecentSearch } from './RecentSearches';

const SearchBar = ({ scrolled, isMobile = false, onClose }) => {
    const [isExpanded, setIsExpanded] = useState(isMobile);
    const [location, setLocation] = useState('');
    const [checkIn, setCheckIn] = useState(null);
    const [checkOut, setCheckOut] = useState(null);
    const [guests, setGuests] = useState(1);
    const navigate = useNavigate();

    const handleSearch = () => {
        const params = new URLSearchParams();

        if (location) params.append('location', location);
        if (checkIn) params.append('checkIn', checkIn.toISOString());
        if (checkOut) params.append('checkOut', checkOut.toISOString());
        if (guests) params.append('guests', guests.toString());

        // Save to recent searches
        if (location || checkIn || checkOut) {
            saveRecentSearch({
                location: location || '',
                checkIn: checkIn ? checkIn.toISOString() : null,
                checkOut: checkOut ? checkOut.toISOString() : null,
                guests: guests
            });
        }

        navigate(`/?${params.toString()}`);
        setIsExpanded(false);
        if (onClose) onClose();
    };


    const clearSearch = () => {
        setLocation('');
        setCheckIn(null);
        setCheckOut(null);
        setGuests(1);
        navigate('/');
    };

    const hasFilters = location || checkIn || checkOut || guests > 1;

    // Mobile View
    if (isMobile) {
        return (
            <div className="space-y-6">
                {/* Location */}
                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Where to?</label>
                    <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="Search destinations"
                            className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-2xl focus:border-rose-500 focus:outline-none text-base font-medium"
                        />
                    </div>
                </div>

                {/* Check-in */}
                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Check-in</label>
                    <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none z-10" />
                        <DatePicker
                            selected={checkIn}
                            onChange={(date) => setCheckIn(date)}
                            selectsStart
                            startDate={checkIn}
                            endDate={checkOut}
                            minDate={new Date()}
                            placeholderText="Add date"
                            className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-2xl focus:border-rose-500 focus:outline-none text-base font-medium cursor-pointer"
                            dateFormat="EEEE, dd MMMM yyyy"
                        />
                    </div>
                </div>

                {/* Check-out */}
                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Check-out</label>
                    <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none z-10" />
                        <DatePicker
                            selected={checkOut}
                            onChange={(date) => setCheckOut(date)}
                            selectsEnd
                            startDate={checkIn}
                            endDate={checkOut}
                            minDate={checkIn || new Date()}
                            placeholderText="Add date"
                            className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-2xl focus:border-rose-500 focus:outline-none text-base font-medium cursor-pointer"
                            dateFormat="EEEE, dd MMMM yyyy"
                        />
                    </div>
                </div>

                {/* Guests */}
                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Guests</label>
                    <div className="relative">
                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="number"
                            min="1"
                            max="20"
                            value={guests}
                            onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
                            className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-2xl focus:border-rose-500 focus:outline-none text-base font-medium"
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 pt-4">
                    <button
                        onClick={handleSearch}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-rose-600 to-pink-600 text-white px-6 py-4 rounded-2xl font-bold hover:from-rose-700 hover:to-pink-700 transition-all shadow-lg touch-target"
                    >
                        <Search className="h-5 w-5" />
                        Search
                    </button>
                    {hasFilters && (
                        <button
                            onClick={clearSearch}
                            className="w-full text-base font-semibold text-gray-600 hover:text-gray-900 underline transition-colors py-3 touch-target"
                        >
                            Clear all
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // Desktop Collapsed View
    if (!isExpanded) {
        return (
            <div
                onClick={() => setIsExpanded(true)}
                className={`hidden md:flex items-center justify-between bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer py-2.5 px-2 pl-6 w-full max-w-sm mx-4 transform hover:-translate-y-0.5 ${!scrolled && 'shadow-lg border-transparent'}`}
            >
                <div className="text-sm font-semibold text-gray-800 truncate">
                    {location || 'Anywhere'}
                </div>
                <div className="h-4 w-[1px] bg-gray-300 mx-4"></div>
                <div className="text-sm font-semibold text-gray-800 truncate">
                    {checkIn ? checkIn.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Any week'}
                </div>
                <div className="h-4 w-[1px] bg-gray-300 mx-4"></div>
                <div className="text-sm text-gray-500 truncate mr-2">
                    {guests > 1 ? `${guests} guests` : 'Add guests'}
                </div>
                <div className="bg-rose-500 p-2.5 rounded-full text-white shadow-md hover:bg-rose-600 transition-colors">
                    <Search className="h-4 w-4" />
                </div>
            </div>
        );
    }

    // Desktop Expanded View
    return (
        <div className="hidden md:block absolute left-0 right-0 top-full mt-2 z-50">
            <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Search properties</h3>
                    <button
                        onClick={() => setIsExpanded(false)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-6">
                    {/* Location */}
                    <div className="col-span-1">
                        <label className="block text-xs font-bold text-gray-900 mb-2 uppercase">Location</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="Where to?"
                                className="w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-500 focus:outline-none text-sm font-medium"
                            />
                        </div>
                    </div>

                    {/* Check-in */}
                    <div className="col-span-1">
                        <label className="block text-xs font-bold text-gray-900 mb-2 uppercase">Check-in</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none z-10" />
                            <DatePicker
                                selected={checkIn}
                                onChange={(date) => setCheckIn(date)}
                                selectsStart
                                startDate={checkIn}
                                endDate={checkOut}
                                minDate={new Date()}
                                placeholderText="Add date"
                                className="w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-500 focus:outline-none text-sm font-medium cursor-pointer"
                            />
                        </div>
                    </div>

                    {/* Check-out */}
                    <div className="col-span-1">
                        <label className="block text-xs font-bold text-gray-900 mb-2 uppercase">Check-out</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none z-10" />
                            <DatePicker
                                selected={checkOut}
                                onChange={(date) => setCheckOut(date)}
                                selectsEnd
                                startDate={checkIn}
                                endDate={checkOut}
                                minDate={checkIn || new Date()}
                                placeholderText="Add date"
                                className="w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-500 focus:outline-none text-sm font-medium cursor-pointer"
                            />
                        </div>
                    </div>

                    {/* Guests */}
                    <div className="col-span-1">
                        <label className="block text-xs font-bold text-gray-900 mb-2 uppercase">Guests</label>
                        <div className="relative">
                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="number"
                                min="1"
                                max="20"
                                value={guests}
                                onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
                                className="w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-500 focus:outline-none text-sm font-medium"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    {hasFilters && (
                        <button
                            onClick={clearSearch}
                            className="text-sm font-semibold text-gray-600 hover:text-gray-900 underline transition-colors"
                        >
                            Clear all
                        </button>
                    )}
                    <div className={`${hasFilters ? '' : 'ml-auto'}`}>
                        <button
                            onClick={handleSearch}
                            className="flex items-center gap-2 bg-gradient-to-r from-rose-600 to-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-rose-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
                        >
                            <Search className="h-5 w-5" />
                            Search
                        </button>
                    </div>
                </div>
            </div>

            {/* Overlay */}
            <div
                onClick={() => setIsExpanded(false)}
                className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
            ></div>
        </div>
    );
};

export default SearchBar;
