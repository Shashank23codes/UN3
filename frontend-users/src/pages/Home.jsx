import React, { useState, useEffect } from 'react';
import { Filter, Map, Star, Heart, Loader2, Home as HomeIcon, Waves, Tractor, Mountain, Gem, Tent, Umbrella, Flame, MapPin, Users, Bed, Bath } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import FiltersModal from '../components/FiltersModal';
import PropertyCard from '../components/PropertyCard';
import RecentSearches from '../components/RecentSearches';

const categories = [
    { id: 'all', label: 'All', icon: <HomeIcon className="h-6 w-6" /> },
    { id: 'pools', label: 'Amazing Pools', icon: <Waves className="h-6 w-6" /> },
    { id: 'farms', label: 'Farms', icon: <Tractor className="h-6 w-6" /> },
    { id: 'views', label: 'Amazing Views', icon: <Mountain className="h-6 w-6" /> },
    { id: 'luxe', label: 'Luxe', icon: <Gem className="h-6 w-6" /> },
    { id: 'cabins', label: 'Cabins', icon: <Tent className="h-6 w-6" /> },
    { id: 'beach', label: 'Beachfront', icon: <Umbrella className="h-6 w-6" /> },
    { id: 'trending', label: 'Trending', icon: <Flame className="h-6 w-6" /> },
];

const Home = () => {
    const [activeCategory, setActiveCategory] = useState('all');
    const [farmhouses, setFarmhouses] = useState([]);
    const [filteredFarmhouses, setFilteredFarmhouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [wishlistIds, setWishlistIds] = useState([]);
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [advancedFilters, setAdvancedFilters] = useState({});
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const fetchFarmhouses = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/farmhouses`);
                setFarmhouses(res.data);
                setFilteredFarmhouses(res.data);
            } catch (error) {
                console.error('Error fetching farmhouses:', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchWishlist = async () => {
            if (user) {
                try {
                    const token = localStorage.getItem('userToken');
                    const config = { headers: { Authorization: `Bearer ${token}` } };
                    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/wishlist`, config);
                    setWishlistIds(res.data.map(item => item._id));
                } catch (error) {
                    console.error('Error fetching wishlist:', error);
                }
            }
        };

        fetchFarmhouses();
        fetchWishlist();
    }, [user]);

    // Handle search filtering
    useEffect(() => {
        const location = searchParams.get('location');
        const checkIn = searchParams.get('checkIn');
        const checkOut = searchParams.get('checkOut');
        const guests = searchParams.get('guests');

        let filtered = [...farmhouses];

        // Filter by location
        if (location) {
            filtered = filtered.filter(house =>
                house.location?.city?.toLowerCase().includes(location.toLowerCase()) ||
                house.location?.state?.toLowerCase().includes(location.toLowerCase()) ||
                house.name?.toLowerCase().includes(location.toLowerCase())
            );
        }

        // Filter by guest capacity
        if (guests) {
            const guestCount = parseInt(guests);
            filtered = filtered.filter(house =>
                house.capacity?.guests >= guestCount
            );
        }

        // Filter by availability (dates)
        if (checkIn && checkOut) {
            const checkInDate = new Date(checkIn);
            const checkOutDate = new Date(checkOut);

            filtered = filtered.filter(house => {
                if (!house.unavailableDates || house.unavailableDates.length === 0) return true;

                // Check if any unavailable date falls between check-in and check-out
                return !house.unavailableDates.some(unavailableDate => {
                    const date = new Date(unavailableDate);
                    return date >= checkInDate && date <= checkOutDate;
                });
            });
        }

        // Apply advanced filters
        if (advancedFilters.priceMin || advancedFilters.priceMax) {
            filtered = filtered.filter(house => {
                const price = house.pricing?.pricePerNight || 0;
                const min = advancedFilters.priceMin || 0;
                const max = advancedFilters.priceMax || Infinity;
                return price >= min && price <= max;
            });
        }

        if (advancedFilters.types && advancedFilters.types.length > 0) {
            filtered = filtered.filter(house =>
                advancedFilters.types.includes(house.type)
            );
        }

        if (advancedFilters.amenities && advancedFilters.amenities.length > 0) {
            filtered = filtered.filter(house =>
                advancedFilters.amenities.every(amenity =>
                    house.amenities?.includes(amenity)
                )
            );
        }

        if (advancedFilters.rating && advancedFilters.rating > 0) {
            filtered = filtered.filter(house =>
                (house.averageRating || 0) >= advancedFilters.rating
            );
        }

        setFilteredFarmhouses(filtered);
    }, [searchParams, farmhouses, advancedFilters]);

    const handleApplyFilters = (filters) => {
        setAdvancedFilters(filters);
    };

    const toggleWishlist = async (e, farmhouseId) => {
        e.preventDefault();
        if (!user) {
            toast.error('Please login to add to wishlist');
            navigate('/login');
            return;
        }

        try {
            const token = localStorage.getItem('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            if (wishlistIds.includes(farmhouseId)) {
                await axios.delete(`${import.meta.env.VITE_API_URL}/api/users/wishlist/${farmhouseId}`, config);
                setWishlistIds(wishlistIds.filter(id => id !== farmhouseId));
                toast.success('Removed from wishlist');
            } else {
                await axios.post(`${import.meta.env.VITE_API_URL}/api/users/wishlist/${farmhouseId}`, {}, config);
                setWishlistIds([...wishlistIds, farmhouseId]);
                toast.success('Added to wishlist');
            }
        } catch (error) {
            console.error('Error toggling wishlist:', error);
            toast.error('Failed to update wishlist');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="flex flex-col items-center">
                    <Loader2 className="h-12 w-12 animate-spin text-rose-600 mb-4" />
                    <p className="text-gray-500 font-medium animate-pulse">Finding perfect getaways...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-20 md:pt-24 pb-8 md:pb-16 min-h-screen bg-gray-50">
            {/* Categories Filter - Sticky & Glassmorphism */}
            {/* Categories Filter - Sticky & Glassmorphism */}
            <div className="fixed top-[72px] w-full bg-white/95 backdrop-blur-md z-40 shadow-sm border-b border-gray-100 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between py-4">
                        {/* Categories Scroll Area */}
                        <div className="flex-1 overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                            <div className="flex space-x-8 min-w-max">
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setActiveCategory(cat.id)}
                                        className={`group flex flex-col items-center min-w-[64px] cursor-pointer transition-all duration-200 relative pb-2 ${activeCategory === cat.id
                                            ? 'text-gray-900 opacity-100'
                                            : 'text-gray-500 hover:text-gray-800 opacity-60 hover:opacity-100'
                                            }`}
                                    >
                                        <span className={`mb-2 transition-transform duration-300 ${activeCategory === cat.id ? 'scale-110' : 'group-hover:scale-110'
                                            }`}>
                                            {React.cloneElement(cat.icon, {
                                                className: `h-6 w-6 ${activeCategory === cat.id ? 'stroke-[2.5px]' : 'stroke-2'}`
                                            })}
                                        </span>
                                        <span className={`text-xs font-semibold whitespace-nowrap ${activeCategory === cat.id ? 'text-gray-900' : 'text-gray-500'
                                            }`}>
                                            {cat.label}
                                        </span>
                                        {activeCategory === cat.id && (
                                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-900 rounded-full animate-fadeIn"></span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Filters Button */}
                        <div className="hidden md:flex items-center pl-6 border-l border-gray-200 ml-6">
                            <button
                                onClick={() => setIsFiltersOpen(true)}
                                className="flex items-center gap-2 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold hover:border-gray-900 hover:bg-gray-50 transition-all duration-200 relative group"
                            >
                                <Filter className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                <span>Filters</span>
                                {Object.keys(advancedFilters).length > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-rose-600 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-sm border-2 border-white">
                                        {Object.keys(advancedFilters).filter(k => advancedFilters[k] && (Array.isArray(advancedFilters[k]) ? advancedFilters[k].length > 0 : true)).length}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Listings Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 md:mt-20 pb-12">
                {/* Recent Searches - Show when no active filters */}
                {!searchParams.get('location') && !searchParams.get('checkIn') && Object.keys(advancedFilters).length === 0 && (
                    <RecentSearches />
                )}

                {filteredFarmhouses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-md w-full">
                            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Map className="h-10 w-10 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">No properties found</h3>
                            <p className="text-gray-500 mb-8">
                                We couldn't find any matches for "{activeCategory !== 'all' ? categories.find(c => c.id === activeCategory)?.label : 'your search'}".
                                Try adjusting your filters or search area.
                            </p>
                            <button
                                onClick={() => {
                                    setActiveCategory('all');
                                    setAdvancedFilters({});
                                    navigate('/');
                                }}
                                className="w-full py-3 px-4 bg-gray-900 text-white font-semibold rounded-xl hover:bg-black transition-colors"
                            >
                                Clear all filters
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                        {filteredFarmhouses.map((house) => (
                            <PropertyCard
                                key={house._id}
                                house={house}
                                toggleWishlist={toggleWishlist}
                                wishlistIds={wishlistIds}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Filters Modal */}
            <FiltersModal
                isOpen={isFiltersOpen}
                onClose={() => setIsFiltersOpen(false)}
                onApply={handleApplyFilters}
                currentFilters={advancedFilters}
            />
        </div>
    );
};

export default Home;
