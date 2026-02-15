import React, { useState, useEffect } from 'react';
import { X, IndianRupee, Home, Star } from 'lucide-react';

const FiltersModal = ({ isOpen, onClose, onApply, currentFilters }) => {
    const [priceRange, setPriceRange] = useState([0, 50000]);
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [selectedAmenities, setSelectedAmenities] = useState([]);
    const [minRating, setMinRating] = useState(0);

    const propertyTypes = [
        'Villa',
        'Farmhouse',
        'Cottage',
        'Cabin',
        'Bungalow',
        'Resort',
        'Guesthouse',
        'Estate'
    ];

    const amenitiesList = [
        'WiFi',
        'Pool',
        'Parking',
        'Kitchen',
        'Air Conditioning',
        'Hot Water',
        'TV',
        'Garden',
        'BBQ Grill',
        'Fireplace',
        'Gym',
        'Pet Friendly',
        'Wheelchair Accessible',
        'Smoke Detector',
        'First Aid Kit',
        'Fire Extinguisher'
    ];

    useEffect(() => {
        if (currentFilters) {
            if (currentFilters.priceMin || currentFilters.priceMax) {
                setPriceRange([
                    currentFilters.priceMin || 0,
                    currentFilters.priceMax || 50000
                ]);
            }
            if (currentFilters.types) {
                setSelectedTypes(currentFilters.types);
            }
            if (currentFilters.amenities) {
                setSelectedAmenities(currentFilters.amenities);
            }
            if (currentFilters.rating) {
                setMinRating(currentFilters.rating);
            }
        }
    }, [currentFilters, isOpen]);

    const handleTypeToggle = (type) => {
        setSelectedTypes(prev =>
            prev.includes(type)
                ? prev.filter(t => t !== type)
                : [...prev, type]
        );
    };

    const handleAmenityToggle = (amenity) => {
        setSelectedAmenities(prev =>
            prev.includes(amenity)
                ? prev.filter(a => a !== amenity)
                : [...prev, amenity]
        );
    };

    const handleApply = () => {
        onApply({
            priceMin: priceRange[0],
            priceMax: priceRange[1],
            types: selectedTypes,
            amenities: selectedAmenities,
            rating: minRating
        });
        onClose();
    };

    const handleReset = () => {
        setPriceRange([0, 50000]);
        setSelectedTypes([]);
        setSelectedAmenities([]);
        setMinRating(0);
    };

    const activeFiltersCount =
        (priceRange[0] > 0 || priceRange[1] < 50000 ? 1 : 0) +
        selectedTypes.length +
        selectedAmenities.length +
        (minRating > 0 ? 1 : 0);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div className="absolute right-0 top-0 h-full w-full sm:w-[480px] bg-white shadow-2xl transform transition-transform">
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Filters</h2>
                            {activeFiltersCount > 0 && (
                                <p className="text-sm text-gray-500 mt-1">
                                    {activeFiltersCount} {activeFiltersCount === 1 ? 'filter' : 'filters'} active
                                </p>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="h-6 w-6 text-gray-500" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
                        {/* Price Range */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Price Range</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <label className="block text-xs font-medium text-gray-600 mb-2">Min Price</label>
                                        <div className="relative">
                                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input
                                                type="number"
                                                value={priceRange[0]}
                                                onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                                                className="w-full pl-9 pr-3 py-2 border-2 border-gray-200 rounded-lg focus:border-rose-500 focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs font-medium text-gray-600 mb-2">Max Price</label>
                                        <div className="relative">
                                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input
                                                type="number"
                                                value={priceRange[1]}
                                                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 50000])}
                                                className="w-full pl-9 pr-3 py-2 border-2 border-gray-200 rounded-lg focus:border-rose-500 focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="50000"
                                    step="500"
                                    value={priceRange[1]}
                                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
                                />
                            </div>
                        </div>

                        {/* Property Type */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Property Type</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {propertyTypes.map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => handleTypeToggle(type)}
                                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 font-medium transition-all ${selectedTypes.includes(type)
                                                ? 'border-rose-600 bg-rose-50 text-rose-700'
                                                : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                            }`}
                                    >
                                        <Home className="h-4 w-4" />
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Amenities */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Amenities</h3>
                            <div className="space-y-2">
                                {amenitiesList.map((amenity) => (
                                    <label
                                        key={amenity}
                                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedAmenities.includes(amenity)}
                                            onChange={() => handleAmenityToggle(amenity)}
                                            className="w-5 h-5 rounded border-gray-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                                        />
                                        <span className="text-sm font-medium text-gray-700">{amenity}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Rating */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Minimum Rating</h3>
                            <div className="grid grid-cols-5 gap-2">
                                {[0, 1, 2, 3, 4, 5].map((rating) => (
                                    <button
                                        key={rating}
                                        onClick={() => setMinRating(rating)}
                                        className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 font-medium transition-all ${minRating === rating
                                                ? 'border-rose-600 bg-rose-50 text-rose-700'
                                                : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                            }`}
                                    >
                                        <Star className={`h-5 w-5 mb-1 ${minRating === rating ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                                        <span className="text-xs">{rating === 0 ? 'Any' : `${rating}+`}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleReset}
                                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                                Clear all
                            </button>
                            <button
                                onClick={handleApply}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl font-semibold hover:from-rose-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
                            >
                                Show {activeFiltersCount > 0 ? 'results' : 'all'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FiltersModal;
