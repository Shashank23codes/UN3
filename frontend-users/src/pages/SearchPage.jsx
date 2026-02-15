import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Search, MapPin, Calendar, Users, IndianRupee,
    SlidersHorizontal, X, ChevronDown, Star, Wifi,
    Tv, Car, UtensilsCrossed, Wind, Waves, Trees
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import SEO from '../components/SEO';

const SearchPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [farmhouses, setFarmhouses] = useState([]);
    const [showFilters, setShowFilters] = useState(true);

    // Filter States
    const [filters, setFilters] = useState({
        location: searchParams.get('location') || '',
        checkIn: searchParams.get('checkIn') || '',
        checkOut: searchParams.get('checkOut') || '',
        guests: searchParams.get('guests') || '',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        amenities: searchParams.get('amenities')?.split(',').filter(Boolean) || [],
        sortBy: searchParams.get('sortBy') || 'relevance'
    });

    const amenitiesList = [
        { id: 'wifi', label: 'WiFi', icon: Wifi },
        { id: 'tv', label: 'TV', icon: Tv },
        { id: 'parking', label: 'Parking', icon: Car },
        { id: 'kitchen', label: 'Kitchen', icon: UtensilsCrossed },
        { id: 'ac', label: 'AC', icon: Wind },
        { id: 'pool', label: 'Pool', icon: Waves },
        { id: 'garden', label: 'Garden', icon: Trees }
    ];

    useEffect(() => {
        searchFarmhouses();
    }, []);

    const searchFarmhouses = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();

            if (filters.location) params.append('location', filters.location);
            if (filters.checkIn) params.append('checkIn', filters.checkIn);
            if (filters.checkOut) params.append('checkOut', filters.checkOut);
            if (filters.guests) params.append('guests', filters.guests);
            if (filters.minPrice) params.append('minPrice', filters.minPrice);
            if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
            if (filters.amenities.length > 0) params.append('amenities', filters.amenities.join(','));
            if (filters.sortBy) params.append('sortBy', filters.sortBy);

            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/farmhouses/search?${params.toString()}`
            );
            setFarmhouses(response.data);
        } catch (error) {
            console.error('Search error:', error);
            toast.error('Failed to search farmhouses');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const toggleAmenity = (amenityId) => {
        setFilters(prev => ({
            ...prev,
            amenities: prev.amenities.includes(amenityId)
                ? prev.amenities.filter(a => a !== amenityId)
                : [...prev.amenities, amenityId]
        }));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        searchFarmhouses();
    };

    const clearFilters = () => {
        setFilters({
            location: '',
            checkIn: '',
            checkOut: '',
            guests: '',
            minPrice: '',
            maxPrice: '',
            amenities: [],
            sortBy: 'relevance'
        });
    };

    const activeFiltersCount = () => {
        let count = 0;
        if (filters.location) count++;
        if (filters.checkIn || filters.checkOut) count++;
        if (filters.guests) count++;
        if (filters.minPrice || filters.maxPrice) count++;
        if (filters.amenities.length > 0) count++;
        return count;
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-16">
            <SEO
                title={`Search Results for ${filters.location || 'Farmhouses'}`}
                description="Find the perfect farmhouse for your stay. Search by location, price, amenities, and more."
                keywords="farmhouse, rental, vacation, stay, search, booking"
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Search Farmhouses</h1>
                    <p className="text-gray-600">
                        {farmhouses.length} {farmhouses.length === 1 ? 'property' : 'properties'} found
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filters Sidebar */}
                    <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <SlidersHorizontal className="h-5 w-5" />
                                    Filters
                                    {activeFiltersCount() > 0 && (
                                        <span className="bg-rose-100 text-rose-700 text-xs font-semibold px-2 py-1 rounded-full">
                                            {activeFiltersCount()}
                                        </span>
                                    )}
                                </h2>
                                {activeFiltersCount() > 0 && (
                                    <button
                                        onClick={clearFilters}
                                        className="text-sm text-rose-600 hover:text-rose-700 font-medium"
                                    >
                                        Clear all
                                    </button>
                                )}
                            </div>

                            <form onSubmit={handleSearch} className="space-y-6">
                                {/* Location */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Location
                                    </label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <input
                                            type="text"
                                            value={filters.location}
                                            onChange={(e) => handleFilterChange('location', e.target.value)}
                                            placeholder="City, State or Area"
                                            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                                        />
                                    </div>
                                </div>

                                {/* Dates */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Check-in / Check-out
                                    </label>
                                    <div className="space-y-3">
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <input
                                                type="date"
                                                value={filters.checkIn}
                                                onChange={(e) => handleFilterChange('checkIn', e.target.value)}
                                                min={new Date().toISOString().split('T')[0]}
                                                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                                            />
                                        </div>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <input
                                                type="date"
                                                value={filters.checkOut}
                                                onChange={(e) => handleFilterChange('checkOut', e.target.value)}
                                                min={filters.checkIn || new Date().toISOString().split('T')[0]}
                                                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Guests */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Number of Guests
                                    </label>
                                    <div className="relative">
                                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <input
                                            type="number"
                                            value={filters.guests}
                                            onChange={(e) => handleFilterChange('guests', e.target.value)}
                                            min="1"
                                            placeholder="Number of guests"
                                            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                                        />
                                    </div>
                                </div>

                                {/* Price Range */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Price Range (per night)
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="relative">
                                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input
                                                type="number"
                                                value={filters.minPrice}
                                                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                                placeholder="Min"
                                                className="w-full pl-9 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                                            />
                                        </div>
                                        <div className="relative">
                                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input
                                                type="number"
                                                value={filters.maxPrice}
                                                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                                placeholder="Max"
                                                className="w-full pl-9 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Amenities */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        Amenities
                                    </label>
                                    <div className="space-y-2">
                                        {amenitiesList.map((amenity) => {
                                            const Icon = amenity.icon;
                                            return (
                                                <label
                                                    key={amenity.id}
                                                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={filters.amenities.includes(amenity.id)}
                                                        onChange={() => toggleAmenity(amenity.id)}
                                                        className="w-4 h-4 text-rose-600 border-gray-300 rounded focus:ring-rose-500"
                                                    />
                                                    <Icon className="h-4 w-4 text-gray-600" />
                                                    <span className="text-sm text-gray-700">{amenity.label}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Search Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-rose-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:from-rose-700 hover:to-pink-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-rose-200"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                                            Searching...
                                        </>
                                    ) : (
                                        <>
                                            <Search className="h-5 w-5" />
                                            Search
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Results */}
                    <div className="flex-1">
                        {/* Mobile Filter Toggle */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="lg:hidden w-full mb-4 bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between"
                        >
                            <span className="font-semibold text-gray-900 flex items-center gap-2">
                                <SlidersHorizontal className="h-5 w-5" />
                                Filters
                                {activeFiltersCount() > 0 && (
                                    <span className="bg-rose-100 text-rose-700 text-xs font-semibold px-2 py-1 rounded-full">
                                        {activeFiltersCount()}
                                    </span>
                                )}
                            </span>
                            <ChevronDown className={`h-5 w-5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Sort */}
                        <div className="mb-6 flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                                Showing {farmhouses.length} results
                            </p>
                            <select
                                value={filters.sortBy}
                                onChange={(e) => {
                                    handleFilterChange('sortBy', e.target.value);
                                    searchFarmhouses();
                                }}
                                className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                            >
                                <option value="relevance">Most Relevant</option>
                                <option value="price_low">Price: Low to High</option>
                                <option value="price_high">Price: High to Low</option>
                                <option value="rating">Highest Rated</option>
                                <option value="newest">Newest First</option>
                            </select>
                        </div>

                        {/* Results Grid */}
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600" />
                            </div>
                        ) : farmhouses.length === 0 ? (
                            <div className="text-center py-20">
                                <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">No farmhouses found</h3>
                                <p className="text-gray-600 mb-6">Try adjusting your filters or search criteria</p>
                                <button
                                    onClick={clearFilters}
                                    className="bg-rose-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-rose-700"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {farmhouses.map((farmhouse) => (
                                    <div
                                        key={farmhouse._id}
                                        onClick={() => navigate(`/farmhouses/${farmhouse._id}`)}
                                        className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                                    >
                                        <div className="relative h-64 overflow-hidden">
                                            <img
                                                src={farmhouse.images?.[0] || 'https://via.placeholder.com/400x300'}
                                                alt={farmhouse.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                            />
                                            {farmhouse.rating && (
                                                <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                    <span className="font-semibold text-sm">{farmhouse.rating.toFixed(1)}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-5">
                                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-rose-600 transition-colors">
                                                {farmhouse.name}
                                            </h3>
                                            <p className="text-gray-600 flex items-center gap-1 text-sm mb-3">
                                                <MapPin className="h-4 w-4" />
                                                {farmhouse.location?.city}, {farmhouse.location?.state}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className="text-2xl font-bold text-gray-900">
                                                        ₹{farmhouse.pricing?.basePrice?.toLocaleString()}
                                                    </span>
                                                    <span className="text-gray-600 text-sm"> / night</span>
                                                </div>
                                                <button className="bg-rose-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-rose-700 transition-colors">
                                                    View Details
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchPage;
