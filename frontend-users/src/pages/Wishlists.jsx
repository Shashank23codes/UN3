import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Loader2 } from 'lucide-react';
import PropertyCard from '../components/PropertyCard';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const Wishlists = () => {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchWishlist = async () => {
            try {
                const token = localStorage.getItem('userToken');
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                };
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/wishlist`, config);
                setWishlist(res.data);
            } catch (error) {
                console.error('Error fetching wishlist:', error);
                toast.error('Failed to load wishlist');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchWishlist();
        } else {
            setLoading(false);
        }
    }, [user]);

    const removeFromWishlist = async (e, farmhouseId) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('userToken');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/users/wishlist/${farmhouseId}`, config);
            setWishlist(wishlist.filter(item => item._id !== farmhouseId));
            toast.success('Removed from wishlist');
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            toast.error('Failed to remove from wishlist');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white pt-20">
                <div className="flex flex-col items-center">
                    <Loader2 className="h-12 w-12 animate-spin text-rose-600 mb-4" />
                    <p className="text-gray-500 font-medium">Loading your wishlist...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="pt-28 pb-16 min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center max-w-md">
                    <div className="bg-rose-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Heart className="h-10 w-10 text-rose-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">Log in to view your wishlists</h2>
                    <p className="text-gray-500 mb-8">
                        You can create, view, or edit wishlists once you've logged in.
                    </p>
                    <Link
                        to="/login"
                        className="inline-block bg-rose-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-rose-700 transition-colors shadow-lg hover:shadow-xl"
                    >
                        Log in
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-28 pb-16 min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">My Wishlist</h1>
                    <p className="text-gray-600">
                        {wishlist.length > 0
                            ? `${wishlist.length} ${wishlist.length === 1 ? 'property' : 'properties'} saved`
                            : 'Start saving your favorite properties'}
                    </p>
                </div>

                {wishlist.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
                        <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Heart className="h-10 w-10 text-gray-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">Your wishlist is empty</h2>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto">
                            As you search, tap the heart icon to save your favorite places to stay or things to do.
                        </p>
                        <Link
                            to="/"
                            className="inline-block bg-rose-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-rose-700 transition-colors shadow-lg hover:shadow-xl"
                        >
                            Explore properties
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {wishlist.map((house) => (
                            <PropertyCard
                                key={house._id}
                                house={house}
                                toggleWishlist={removeFromWishlist}
                                wishlistIds={wishlist.map(h => h._id)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wishlists;
