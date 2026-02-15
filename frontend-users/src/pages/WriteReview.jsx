import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Loader2, AlertCircle, CheckCircle, ChevronLeft, Sparkles, Info } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import SEO from '../components/SEO';

const StarRating = ({ rating, setRating, hoverRating, setHoverRating, size = "lg" }) => {
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

const WriteReview = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [booking, setBooking] = useState(null);
    const [error, setError] = useState(null);

    // Form State
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [cleanliness, setCleanliness] = useState(0);
    const [accuracy, setAccuracy] = useState(0);
    const [communication, setCommunication] = useState(0);
    const [location, setLocation] = useState(0);
    const [valueForMoney, setValueForMoney] = useState(0);
    const [comment, setComment] = useState('');

    useEffect(() => {
        checkEligibility();
    }, [bookingId]);

    const checkEligibility = async () => {
        try {
            const token = localStorage.getItem('userToken');
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/reviews/can-review/${bookingId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.canReview) {
                setBooking(response.data.booking);
            } else {
                setError(response.data.message);
                if (response.data.review) {
                    toast.info('You have already reviewed this booking');
                    navigate('/trips');
                }
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to verify booking');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error('Please provide an overall rating');
            return;
        }

        setSubmitting(true);
        try {
            const token = localStorage.getItem('userToken');
            await axios.post(
                `${import.meta.env.VITE_API_URL}/api/reviews`,
                {
                    bookingId,
                    farmhouseId: booking.farmhouse,
                    rating,
                    cleanliness: cleanliness || rating,
                    accuracy: accuracy || rating,
                    communication: communication || rating,
                    location: location || rating,
                    valueForMoney: valueForMoney || rating,
                    comment
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success('Review submitted successfully!');
            navigate('/trips');
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    const categoryDescriptions = {
        cleanliness: 'How clean was the property?',
        accuracy: 'Did the listing match the photos and description?',
        communication: 'How responsive was the host?',
        location: 'How did you like the location?',
        valueForMoney: 'Was it worth the price?'
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Cannot Write Review</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/trips')}
                        className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        Back to Trips
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-rose-50/30 py-12">
            <SEO
                title="Write a Review"
                description="Share your experience and help others find great farmhouses."
            />
            <div className="max-w-3xl mx-auto px-4">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors group"
                >
                    <ChevronLeft className="h-5 w-5 mr-1 group-hover:-translate-x-1 transition-transform" />
                    Back
                </button>

                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-rose-500 to-pink-500 p-8 text-white">
                        <div className="flex items-center gap-3 mb-3">
                            <Sparkles className="h-8 w-8" />
                            <h1 className="text-3xl font-bold">Share Your Experience</h1>
                        </div>
                        <p className="text-rose-50 text-lg">
                            Your feedback helps other travelers make better decisions
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-10">
                        {/* Overall Rating */}
                        <div className="text-center bg-gradient-to-br from-amber-50 to-orange-50 p-8 rounded-2xl border border-amber-100">
                            <label className="block text-xl font-bold text-gray-900 mb-2">
                                Overall Rating
                            </label>
                            <p className="text-gray-600 mb-6 text-sm">How would you rate your overall experience?</p>
                            <div className="flex justify-center mb-4">
                                <StarRating
                                    rating={rating}
                                    setRating={setRating}
                                    hoverRating={hoverRating}
                                    setHoverRating={setHoverRating}
                                    size="lg"
                                />
                            </div>
                            <p className="text-base font-semibold min-h-[24px]">
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

                        {/* Detailed Ratings */}
                        <div>
                            <div className="flex items-center gap-2 mb-6">
                                <h3 className="font-bold text-gray-900 text-lg">Category Ratings</h3>
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Optional</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    { label: 'Cleanliness', value: cleanliness, setter: setCleanliness, key: 'cleanliness' },
                                    { label: 'Accuracy', value: accuracy, setter: setAccuracy, key: 'accuracy' },
                                    { label: 'Communication', value: communication, setter: setCommunication, key: 'communication' },
                                    { label: 'Location', value: location, setter: setLocation, key: 'location' },
                                    { label: 'Value for Money', value: valueForMoney, setter: setValueForMoney, key: 'valueForMoney' },
                                ].map((item) => (
                                    <div key={item.label} className="bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-rose-200 transition-colors">
                                        <div className="flex items-center justify-between mb-3">
                                            <label className="font-semibold text-gray-800 text-sm">{item.label}</label>
                                            <div className="group relative">
                                                <Info className="h-4 w-4 text-gray-400 cursor-help" />
                                                <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block w-48 bg-gray-900 text-white text-xs rounded-lg p-2 shadow-lg z-10">
                                                    {categoryDescriptions[item.key]}
                                                </div>
                                            </div>
                                        </div>
                                        <StarRating
                                            rating={item.value}
                                            setRating={item.setter}
                                            size="sm"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Written Review */}
                        <div>
                            <label className="block font-bold text-gray-900 mb-2 text-lg">
                                Tell Us More
                            </label>
                            <p className="text-gray-600 text-sm mb-4">What did you like or dislike about your stay?</p>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows="5"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all resize-none"
                                placeholder="Share details about your experience... What made it special?"
                                required
                            />
                            <div className="flex justify-between items-center mt-2">
                                <p className="text-xs text-gray-500">Minimum 10 characters</p>
                                <p className={`text-xs font-medium ${comment.length > 800 ? 'text-amber-600' : 'text-gray-500'}`}>
                                    {comment.length}/1000 characters
                                </p>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={submitting || rating === 0 || comment.length < 10}
                                className="w-full bg-gradient-to-r from-rose-600 to-pink-600 text-white py-4 rounded-xl font-bold text-lg hover:from-rose-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Submitting Your Review...
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

export default WriteReview;
