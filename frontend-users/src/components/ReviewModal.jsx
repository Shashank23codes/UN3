import React, { useState } from 'react';
import { X, Star, Sparkles, Info, CheckCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ReviewModal = ({ isOpen, onClose, bookingId, farmhouseId, onReviewSubmitted }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [categoryRatings, setCategoryRatings] = useState({
        cleanliness: 0,
        accuracy: 0,
        communication: 0,
        location: 0,
        valueForMoney: 0
    });
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const categoryDescriptions = {
        cleanliness: 'How clean was the property?',
        accuracy: 'Did the listing match the photos and description?',
        communication: 'How responsive was the host?',
        location: 'How did you like the location?',
        valueForMoney: 'Was it worth the price?'
    };

    const categories = [
        { key: 'cleanliness', label: 'Cleanliness' },
        { key: 'accuracy', label: 'Accuracy' },
        { key: 'communication', label: 'Communication' },
        { key: 'location', label: 'Location' },
        { key: 'valueForMoney', label: 'Value for Money' }
    ];

    const handleCategoryRating = (category, value) => {
        setCategoryRatings(prev => ({ ...prev, [category]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (rating === 0) {
            toast.error('Please provide an overall rating');
            return;
        }

        if (comment.trim().length < 10) {
            toast.error('Please write at least 10 characters in your review');
            return;
        }

        setSubmitting(true);

        try {
            const token = localStorage.getItem('userToken');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };

            await axios.post(
                `${import.meta.env.VITE_API_URL}/api/reviews`,
                {
                    bookingId,
                    farmhouseId,
                    rating,
                    cleanliness: categoryRatings.cleanliness || rating,
                    accuracy: categoryRatings.accuracy || rating,
                    communication: categoryRatings.communication || rating,
                    location: categoryRatings.location || rating,
                    valueForMoney: categoryRatings.valueForMoney || rating,
                    comment
                },
                config
            );

            toast.success('Review submitted successfully!');
            onReviewSubmitted?.();
        } catch (error) {
            console.error('Error submitting review:', error);
            toast.error(error.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    const StarRating = ({ rating, setRating, hoverRating, setHoverRating, size = "md" }) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating && setHoverRating(star)}
                        onMouseLeave={() => setHoverRating && setHoverRating(0)}
                        className="focus:outline-none transition-transform hover:scale-110"
                    >
                        <Star
                            className={`${size === "lg" ? "h-8 w-8" : "h-6 w-6"
                                } ${star <= (hoverRating || rating)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                        />
                    </button>
                ))}
            </div>
        );
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden animate-slideUp"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Premium Header */}
                <div className="bg-gradient-to-r from-rose-500 to-pink-500 p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Sparkles className="h-7 w-7" />
                            <div>
                                <h2 className="text-2xl font-bold">Share Your Experience</h2>
                                <p className="text-rose-50 text-sm mt-1">Your feedback helps others make better decisions</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                {/* Form Content */}
                <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Overall Rating */}
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl border border-amber-100">
                            <label className="block text-lg font-bold text-gray-900 mb-2 text-center">
                                Overall Rating
                            </label>
                            <p className="text-gray-600 mb-4 text-sm text-center">How would you rate your overall experience?</p>
                            <div className="flex justify-center mb-3">
                                <StarRating
                                    rating={rating}
                                    setRating={setRating}
                                    hoverRating={hoverRating}
                                    setHoverRating={setHoverRating}
                                    size="lg"
                                />
                            </div>
                            <p className="text-base font-semibold text-center min-h-[24px]">
                                {hoverRating || rating ? (
                                    <span className={`${(hoverRating || rating) >= 4 ? 'text-green-600' :
                                            (hoverRating || rating) >= 3 ? 'text-yellow-600' :
                                                'text-red-600'
                                        }`}>
                                        {['Terrible', 'Bad', 'Okay', 'Good', 'Excellent'][(hoverRating || rating) - 1]}
                                    </span>
                                ) : (
                                    <span className="text-gray-400">Select a rating</span>
                                )}
                            </p>
                        </div>

                        {/* Category Ratings */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <h3 className="font-bold text-gray-900">Category Ratings</h3>
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Optional</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {categories.map(({ key, label }) => (
                                    <div key={key} className="bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-rose-200 transition-colors">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="font-semibold text-gray-800 text-sm">{label}</label>
                                            <div className="group relative">
                                                <Info className="h-4 w-4 text-gray-400 cursor-help" />
                                                <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block w-48 bg-gray-900 text-white text-xs rounded-lg p-2 shadow-lg z-10">
                                                    {categoryDescriptions[key]}
                                                </div>
                                            </div>
                                        </div>
                                        <StarRating
                                            rating={categoryRatings[key]}
                                            setRating={(value) => handleCategoryRating(key, value)}
                                            size="sm"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Written Review */}
                        <div>
                            <label className="block font-bold text-gray-900 mb-2">
                                Tell Us More <span className="text-red-500">*</span>
                            </label>
                            <p className="text-gray-600 text-sm mb-3">What did you like or dislike about your stay?</p>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows="4"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all resize-none"
                                placeholder="Share details about your experience... What made it special?"
                                maxLength={1000}
                                required
                            />
                            <div className="flex justify-between items-center mt-2">
                                <p className="text-xs text-gray-500">Minimum 10 characters</p>
                                <p className={`text-xs font-medium ${comment.length > 800 ? 'text-amber-600' : 'text-gray-500'}`}>
                                    {comment.length}/1000 characters
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting || rating === 0 || comment.length < 10}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl font-semibold hover:from-rose-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="h-5 w-5" />
                                        Submit Review
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ReviewModal;
