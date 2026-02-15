import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StarRating from './StarRating';
import ReviewCard from './ReviewCard';
import { Star, Sparkles, Award, ChevronLeft, ChevronRight, MessageSquare, TrendingUp } from 'lucide-react';

const ReviewsSection = ({ farmhouseId }) => {
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchReviews();
    }, [farmhouseId, currentPage]);

    const fetchReviews = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/reviews/farmhouse/${farmhouseId}?page=${currentPage}&limit=5`
            );
            setReviews(response.data.reviews);
            setStats(response.data.stats);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="py-12">
                <div className="animate-pulse space-y-6">
                    <div className="h-10 bg-gray-200 rounded-xl w-1/4"></div>
                    <div className="h-48 bg-gray-200 rounded-2xl"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="h-56 bg-gray-200 rounded-2xl"></div>
                        <div className="h-56 bg-gray-200 rounded-2xl"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!stats || stats.totalReviews === 0) {
        return (
            <div className="py-12">
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                    <Star className="h-7 w-7 lg:h-8 lg:w-8 text-amber-500 fill-amber-500" />
                    Guest Reviews
                </h2>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-3xl p-12 lg:p-16 text-center">
                    <div className="max-w-md mx-auto">
                        <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <MessageSquare className="h-10 w-10 lg:h-12 lg:w-12 text-amber-500" />
                        </div>
                        <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3">No reviews yet</h3>
                        <p className="text-gray-600 text-base lg:text-lg">Be the first to share your experience after your stay!</p>
                    </div>
                </div>
            </div>
        );
    }

    const ratingDistribution = [
        { stars: 5, count: stats.rating5 || 0 },
        { stars: 4, count: stats.rating4 || 0 },
        { stars: 3, count: stats.rating3 || 0 },
        { stars: 2, count: stats.rating2 || 0 },
        { stars: 1, count: stats.rating1 || 0 }
    ];

    return (
        <div className="py-12 lg:py-16">
            {/* Premium Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8 lg:mb-10">
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="p-2 lg:p-2.5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl shadow-lg">
                        <Star className="h-5 w-5 lg:h-6 lg:w-6 text-white fill-white" />
                    </div>
                    Guest Reviews
                </h2>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-amber-50 rounded-full border border-amber-200">
                        <span className="text-amber-700 font-semibold">{stats.totalReviews} {stats.totalReviews === 1 ? 'Review' : 'Reviews'}</span>
                    </div>
                </div>
            </div>

            {/* Overall Rating Summary - Enhanced Desktop Layout */}
            <div className="bg-white border border-gray-100 rounded-3xl shadow-lg overflow-hidden mb-10">
                <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-6 lg:p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        {/* Overall Rating - Large Display */}
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <div className="w-24 h-24 lg:w-28 lg:h-28 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                                    <span className="text-5xl lg:text-6xl font-bold text-white">{stats.avgRating.toFixed(1)}</span>
                                </div>
                                <div className="absolute -top-2 -right-2 p-1.5 bg-white rounded-full shadow-lg">
                                    <Award className="h-5 w-5 text-amber-500" />
                                </div>
                            </div>
                            <div className="text-white">
                                <StarRating rating={stats.avgRating} size="lg" showNumber={false} />
                                <p className="mt-2 text-white/90 font-medium">
                                    Based on {stats.totalReviews} verified {stats.totalReviews === 1 ? 'review' : 'reviews'}
                                </p>
                            </div>
                        </div>

                        {/* Rating Distribution - Desktop */}
                        <div className="hidden lg:block bg-white/10 backdrop-blur-sm rounded-2xl p-5 min-w-[320px]">
                            <div className="space-y-2.5">
                                {ratingDistribution.map(({ stars, count }) => {
                                    const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                                    return (
                                        <div key={stars} className="flex items-center gap-3">
                                            <span className="text-sm font-semibold text-white w-12">{stars} stars</span>
                                            <div className="flex-1 bg-white/20 rounded-full h-2.5 overflow-hidden">
                                                <div
                                                    className="bg-white h-full rounded-full transition-all duration-500"
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-sm text-white/80 w-8 text-right">{count}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Rating Distribution - Mobile */}
                <div className="lg:hidden p-6 bg-gradient-to-br from-amber-50 to-orange-50">
                    <div className="space-y-3">
                        {ratingDistribution.map(({ stars, count }) => {
                            const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                            return (
                                <div key={stars} className="flex items-center gap-3">
                                    <span className="text-sm font-medium text-gray-700 w-8">{stars} ★</span>
                                    <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                                        <div
                                            className="bg-gradient-to-r from-amber-400 to-orange-500 h-full rounded-full transition-all duration-500"
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Category Averages - Enhanced Grid */}
                {(stats.avgCleanliness || stats.avgAccuracy || stats.avgCommunication || stats.avgLocation || stats.avgValueForMoney) && (
                    <div className="p-6 lg:p-8 bg-gray-50 border-t border-gray-100">
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Rating Breakdown
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                            {stats.avgCleanliness && (
                                <div className="group bg-white rounded-2xl p-4 lg:p-5 text-center shadow-sm border border-gray-100 hover:shadow-md hover:border-amber-200 transition-all duration-200">
                                    <p className="text-xs lg:text-sm text-gray-500 mb-1 font-medium">Cleanliness</p>
                                    <p className="text-2xl lg:text-3xl font-bold text-gray-900 group-hover:text-amber-600 transition-colors">{stats.avgCleanliness.toFixed(1)}</p>
                                </div>
                            )}
                            {stats.avgAccuracy && (
                                <div className="group bg-white rounded-2xl p-4 lg:p-5 text-center shadow-sm border border-gray-100 hover:shadow-md hover:border-amber-200 transition-all duration-200">
                                    <p className="text-xs lg:text-sm text-gray-500 mb-1 font-medium">Accuracy</p>
                                    <p className="text-2xl lg:text-3xl font-bold text-gray-900 group-hover:text-amber-600 transition-colors">{stats.avgAccuracy.toFixed(1)}</p>
                                </div>
                            )}
                            {stats.avgCommunication && (
                                <div className="group bg-white rounded-2xl p-4 lg:p-5 text-center shadow-sm border border-gray-100 hover:shadow-md hover:border-amber-200 transition-all duration-200">
                                    <p className="text-xs lg:text-sm text-gray-500 mb-1 font-medium">Communication</p>
                                    <p className="text-2xl lg:text-3xl font-bold text-gray-900 group-hover:text-amber-600 transition-colors">{stats.avgCommunication.toFixed(1)}</p>
                                </div>
                            )}
                            {stats.avgLocation && (
                                <div className="group bg-white rounded-2xl p-4 lg:p-5 text-center shadow-sm border border-gray-100 hover:shadow-md hover:border-amber-200 transition-all duration-200">
                                    <p className="text-xs lg:text-sm text-gray-500 mb-1 font-medium">Location</p>
                                    <p className="text-2xl lg:text-3xl font-bold text-gray-900 group-hover:text-amber-600 transition-colors">{stats.avgLocation.toFixed(1)}</p>
                                </div>
                            )}
                            {stats.avgValueForMoney && (
                                <div className="group bg-white rounded-2xl p-4 lg:p-5 text-center shadow-sm border border-gray-100 hover:shadow-md hover:border-amber-200 transition-all duration-200">
                                    <p className="text-xs lg:text-sm text-gray-500 mb-1 font-medium">Value</p>
                                    <p className="text-2xl lg:text-3xl font-bold text-gray-900 group-hover:text-amber-600 transition-colors">{stats.avgValueForMoney.toFixed(1)}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Individual Reviews - 2 Column Grid on Desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
                {reviews.map((review) => (
                    <ReviewCard key={review._id} review={review} />
                ))}
            </div>

            {/* Premium Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="p-3 bg-white border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <div className="px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl shadow-md">
                        {currentPage} / {totalPages}
                    </div>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="p-3 bg-white border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default ReviewsSection;
