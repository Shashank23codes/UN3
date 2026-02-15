import React from 'react';
import StarRating from './StarRating';
import { ThumbsUp, Calendar, CheckCircle, Quote, Heart, AlertCircle, MessageCircle } from 'lucide-react';

const ReviewCard = ({ review }) => {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    };

    return (
        <div className="bg-white border border-gray-100 rounded-2xl lg:rounded-3xl p-5 lg:p-6 hover:shadow-xl hover:border-gray-200 transition-all duration-300 group">
            {/* User Info Header */}
            <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3 lg:gap-4">
                    <div className="relative">
                        <div className="h-12 w-12 lg:h-14 lg:w-14 bg-gradient-to-br from-rose-400 via-pink-500 to-purple-500 rounded-xl lg:rounded-2xl flex items-center justify-center text-white font-bold text-lg lg:text-xl shadow-lg">
                            {review.user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        {review.isVerified && (
                            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-md">
                                <CheckCircle className="h-4 w-4 text-green-500 fill-green-100" />
                            </div>
                        )}
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 text-base lg:text-lg">
                            {review.user?.name || 'Anonymous'}
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{formatDate(review.createdAt)}</span>
                            {review.isVerified && (
                                <span className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-100">
                                    Verified stay
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-100">
                        <span className="text-lg lg:text-xl font-bold text-amber-600">{review.rating.toFixed(1)}</span>
                        <StarRating rating={review.rating} size="sm" showNumber={false} />
                    </div>
                </div>
            </div>

            {/* Category Ratings - Enhanced Pills */}
            {(review.cleanliness || review.accuracy || review.communication || review.location || review.valueForMoney) && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {review.cleanliness && (
                        <div className="px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100 group-hover:bg-gray-100 transition-colors">
                            <span className="text-xs text-gray-500">Cleanliness</span>
                            <span className="ml-1.5 text-sm font-bold text-gray-900">{review.cleanliness.toFixed(1)}</span>
                        </div>
                    )}
                    {review.accuracy && (
                        <div className="px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100 group-hover:bg-gray-100 transition-colors">
                            <span className="text-xs text-gray-500">Accuracy</span>
                            <span className="ml-1.5 text-sm font-bold text-gray-900">{review.accuracy.toFixed(1)}</span>
                        </div>
                    )}
                    {review.communication && (
                        <div className="px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100 group-hover:bg-gray-100 transition-colors">
                            <span className="text-xs text-gray-500">Communication</span>
                            <span className="ml-1.5 text-sm font-bold text-gray-900">{review.communication.toFixed(1)}</span>
                        </div>
                    )}
                    {review.location && (
                        <div className="px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100 group-hover:bg-gray-100 transition-colors">
                            <span className="text-xs text-gray-500">Location</span>
                            <span className="ml-1.5 text-sm font-bold text-gray-900">{review.location.toFixed(1)}</span>
                        </div>
                    )}
                    {review.valueForMoney && (
                        <div className="px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100 group-hover:bg-gray-100 transition-colors">
                            <span className="text-xs text-gray-500">Value</span>
                            <span className="ml-1.5 text-sm font-bold text-gray-900">{review.valueForMoney.toFixed(1)}</span>
                        </div>
                    )}
                </div>
            )}

            {/* Review Comment with Quote Icon */}
            <div className="relative">
                <Quote className="absolute -top-1 -left-1 h-6 w-6 lg:h-8 lg:w-8 text-gray-100 fill-gray-100" />
                <p className="text-gray-700 leading-relaxed text-sm lg:text-base pl-4 lg:pl-6">{review.comment}</p>
            </div>

            {/* Likes/Dislikes Section */}
            {(review.likes?.length > 0 || review.dislikes?.length > 0) && (
                <div className="mt-5 pt-4 border-t border-gray-100 space-y-3">
                    {/* Likes */}
                    {review.likes && review.likes.length > 0 && (
                        <div>
                            <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1.5">
                                <Heart className="h-3.5 w-3.5 text-green-500 fill-green-500" />
                                What they loved
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {review.likes.map((like, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 text-xs font-medium rounded-full border border-green-200"
                                    >
                                        {like}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Dislikes */}
                    {review.dislikes && review.dislikes.length > 0 && (
                        <div>
                            <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1.5">
                                <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                                Could improve
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {review.dislikes.map((dislike, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 text-xs font-medium rounded-full border border-amber-200"
                                    >
                                        {dislike}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Vendor Response - Premium Style */}
            {review.vendorResponse?.comment && (
                <div className="mt-5 bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-100 rounded-xl p-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-rose-100 to-transparent rounded-bl-full"></div>
                    <div className="relative">
                        <div className="flex items-center gap-2 mb-2">
                            <MessageCircle className="h-4 w-4 text-rose-500" />
                            <p className="text-sm font-bold text-gray-900">Response from host</p>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">{review.vendorResponse.comment}</p>
                        <p className="text-xs text-gray-500 mt-2">
                            {formatDate(review.vendorResponse.respondedAt)}
                        </p>
                    </div>
                </div>
            )}

            {/* Helpful Button */}
            {review.helpfulCount > 0 && (
                <div className="mt-5 pt-4 border-t border-gray-100">
                    <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-rose-500 transition-colors group/btn">
                        <ThumbsUp className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                        <span>{review.helpfulCount} {review.helpfulCount === 1 ? 'person' : 'people'} found this helpful</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default ReviewCard;
