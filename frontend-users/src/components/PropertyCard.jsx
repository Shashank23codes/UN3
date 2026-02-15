import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, MapPin, Users, Bed, Bath } from 'lucide-react';

const PropertyCard = ({ house, toggleWishlist, wishlistIds = [] }) => {
    const isWishlisted = wishlistIds.includes(house._id);

    return (
        <div className="group w-full relative bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            {/* Image Section */}
            <Link to={`/farmhouses/${house._id}`} className="block relative aspect-[4/3] overflow-hidden bg-gray-100">
                <img
                    src={house.images?.[0] || 'https://via.placeholder.com/400'}
                    alt={house.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                    {house.type && (
                        <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-xs font-bold text-gray-900 rounded-lg shadow-sm">
                            {house.type}
                        </span>
                    )}
                    {house.averageRating >= 4.5 && (
                        <span className="px-2.5 py-1 bg-rose-500 text-xs font-bold text-white rounded-lg shadow-sm">
                            Top Rated
                        </span>
                    )}
                </div>
            </Link>

            {/* Wishlist Button - Floating */}
            <button
                onClick={(e) => {
                    e.preventDefault();
                    toggleWishlist(e, house._id);
                }}
                className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-all duration-200 shadow-sm z-10 group/heart"
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
                <Heart
                    className={`h-5 w-5 transition-all duration-300 ${isWishlisted
                        ? 'text-rose-500 fill-rose-500 scale-110'
                        : 'text-gray-600 group-hover/heart:text-rose-500'
                        }`}
                />
            </button>

            {/* Content Section */}
            <Link to={`/farmhouses/${house._id}`} className="block p-4">
                {/* Title & Rating Row */}
                <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-gray-900 text-lg line-clamp-1 group-hover:text-rose-600 transition-colors">
                        {house.name}
                    </h3>
                    <div className="flex items-center gap-1 shrink-0 bg-gray-50 px-1.5 py-0.5 rounded-md">
                        <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-bold text-gray-900">
                            {house.averageRating > 0 ? house.averageRating.toFixed(1) : 'New'}
                        </span>
                    </div>
                </div>

                {/* Location */}
                <div className="flex items-center text-gray-500 text-sm mb-3">
                    <MapPin className="h-3.5 w-3.5 mr-1" />
                    <span className="truncate">{house.location?.city}, {house.location?.state}</span>
                </div>

                {/* Quick Stats */}
                <div className="flex items-center gap-3 mb-4 text-xs text-gray-500">
                    {house.capacity?.guests && (
                        <div className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            <span>{house.capacity.guests} Guests</span>
                        </div>
                    )}
                    <span className="w-1 h-1 bg-gray-300 rounded-full" />
                    {house.capacity?.bedrooms && (
                        <div className="flex items-center gap-1">
                            <Bed className="h-3.5 w-3.5" />
                            <span>{house.capacity.bedrooms} Beds</span>
                        </div>
                    )}
                </div>

                {/* Price & Action Row */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500">Price per day</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-lg font-bold text-gray-900">
                                ₹{house.pricing?.pricePerNight?.toLocaleString()}
                            </span>
                        </div>
                    </div>

                    <span className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-xl group-hover:bg-rose-600 transition-colors duration-300">
                        View Details
                    </span>
                </div>
            </Link>
        </div>
    );
};

export default PropertyCard;
