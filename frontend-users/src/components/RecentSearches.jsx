import React, { useState, useEffect } from 'react';
import { Clock, X, MapPin, Calendar, Users, ArrowRight, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const STORAGE_KEY = 'recentSearches';
const MAX_SEARCHES = 5;

// Utility functions to manage recent searches
export const saveRecentSearch = (searchParams) => {
    const existing = getRecentSearches();
    const newSearch = {
        id: Date.now(),
        ...searchParams,
        timestamp: new Date().toISOString()
    };

    // Remove duplicates based on same location
    const filtered = existing.filter(s =>
        s.location?.toLowerCase() !== searchParams.location?.toLowerCase()
    );

    // Add new search at the beginning
    const updated = [newSearch, ...filtered].slice(0, MAX_SEARCHES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const getRecentSearches = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

export const clearRecentSearches = () => {
    localStorage.removeItem(STORAGE_KEY);
};

export const removeRecentSearch = (id) => {
    const searches = getRecentSearches().filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
};

// Component to display recent searches
const RecentSearches = ({ onSearchClick }) => {
    const [searches, setSearches] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        setSearches(getRecentSearches());
    }, []);

    const handleClear = () => {
        clearRecentSearches();
        setSearches([]);
    };

    const handleRemove = (e, id) => {
        e.stopPropagation();
        removeRecentSearch(id);
        setSearches(getRecentSearches());
    };

    const handleClick = (search) => {
        const params = new URLSearchParams();
        if (search.location) params.set('location', search.location);
        if (search.checkIn) params.set('checkIn', search.checkIn);
        if (search.checkOut) params.set('checkOut', search.checkOut);
        if (search.guests) params.set('guests', search.guests);

        if (onSearchClick) {
            onSearchClick(search);
        }
        navigate(`/search?${params.toString()}`);
    };

    const formatDate = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    if (searches.length === 0) return null;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-rose-50 rounded-lg">
                        <History className="h-4 w-4 text-rose-500" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Recent Searches</h3>
                </div>
                <button
                    onClick={handleClear}
                    className="text-sm text-gray-500 hover:text-rose-500 transition-colors"
                >
                    Clear all
                </button>
            </div>

            <div className="space-y-2">
                {searches.map((search) => (
                    <div
                        key={search.id}
                        onClick={() => handleClick(search)}
                        className="group flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-all border border-transparent hover:border-gray-200"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded-full group-hover:bg-rose-100 transition-colors">
                                <MapPin className="h-4 w-4 text-gray-500 group-hover:text-rose-500 transition-colors" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">{search.location || 'Any location'}</p>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    {search.checkIn && search.checkOut ? (
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {formatDate(search.checkIn)} - {formatDate(search.checkOut)}
                                        </span>
                                    ) : (
                                        <span>Any dates</span>
                                    )}
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                        <Users className="h-3 w-3" />
                                        {search.guests || 1} guest{(search.guests || 1) > 1 ? 's' : ''}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={(e) => handleRemove(e, search.id)}
                                className="p-1.5 rounded-full hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-all"
                            >
                                <X className="h-4 w-4 text-gray-400" />
                            </button>
                            <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-rose-500 group-hover:translate-x-1 transition-all" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecentSearches;
