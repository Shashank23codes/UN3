import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, Home, CheckCircle, CreditCard } from 'lucide-react';

const HowItWorks = () => {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-rose-50 to-pink-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <Link to="/" className="inline-flex items-center text-gray-600 hover:text-rose-600 mb-8 transition-colors">
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Back to Home
                    </Link>
                    <h1 className="text-5xl font-bold text-gray-900 mb-6">How It Works</h1>
                    <p className="text-xl text-gray-600 max-w-2xl">
                        Booking your perfect venue is simple and straightforward. Here's how:
                    </p>
                </div>
            </div>

            {/* Steps Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="space-y-16">
                    {/* Step 1 */}
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="order-2 md:order-1">
                            <div className="bg-rose-100 text-rose-600 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-6">
                                1
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Search for Properties</h2>
                            <p className="text-gray-600 text-lg leading-relaxed mb-4">
                                Browse through our extensive collection of farmhouses, villas, and event venues. Use filters to narrow down by location, capacity, amenities, and price range.
                            </p>
                            <ul className="space-y-3 text-gray-600">
                                <li className="flex items-start">
                                    <CheckCircle className="h-5 w-5 text-rose-600 mr-3 mt-0.5 flex-shrink-0" />
                                    <span>Filter by location, date, and guest capacity</span>
                                </li>
                                <li className="flex items-start">
                                    <CheckCircle className="h-5 w-5 text-rose-600 mr-3 mt-0.5 flex-shrink-0" />
                                    <span>View detailed photos and amenities</span>
                                </li>
                                <li className="flex items-start">
                                    <CheckCircle className="h-5 w-5 text-rose-600 mr-3 mt-0.5 flex-shrink-0" />
                                    <span>Read authentic reviews from previous guests</span>
                                </li>
                            </ul>
                        </div>
                        <div className="order-1 md:order-2 bg-gradient-to-br from-rose-100 to-pink-100 rounded-2xl p-12 flex items-center justify-center h-80">
                            <Search className="h-32 w-32 text-rose-600" />
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="bg-gradient-to-br from-pink-100 to-rose-100 rounded-2xl p-12 flex items-center justify-center h-80">
                            <Home className="h-32 w-32 text-rose-600" />
                        </div>
                        <div>
                            <div className="bg-rose-100 text-rose-600 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-6">
                                2
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Venue</h2>
                            <p className="text-gray-600 text-lg leading-relaxed mb-4">
                                Found the perfect place? Review all the details, check availability, and explore the property through photos and virtual tours.
                            </p>
                            <ul className="space-y-3 text-gray-600">
                                <li className="flex items-start">
                                    <CheckCircle className="h-5 w-5 text-rose-600 mr-3 mt-0.5 flex-shrink-0" />
                                    <span>Check real-time availability calendar</span>
                                </li>
                                <li className="flex items-start">
                                    <CheckCircle className="h-5 w-5 text-rose-600 mr-3 mt-0.5 flex-shrink-0" />
                                    <span>View pricing breakdown and policies</span>
                                </li>
                                <li className="flex items-start">
                                    <CheckCircle className="h-5 w-5 text-rose-600 mr-3 mt-0.5 flex-shrink-0" />
                                    <span>Contact host for questions</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="order-2 md:order-1">
                            <div className="bg-rose-100 text-rose-600 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-6">
                                3
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Book & Pay Securely</h2>
                            <p className="text-gray-600 text-lg leading-relaxed mb-4">
                                Complete your booking with our secure payment gateway. Pay only a portion upfront and rest during checkout.
                            </p>
                            <ul className="space-y-3 text-gray-600">
                                <li className="flex items-start">
                                    <CheckCircle className="h-5 w-5 text-rose-600 mr-3 mt-0.5 flex-shrink-0" />
                                    <span>Secure payment through Razorpay</span>
                                </li>
                                <li className="flex items-start">
                                    <CheckCircle className="h-5 w-5 text-rose-600 mr-3 mt-0.5 flex-shrink-0" />
                                    <span>Instant booking confirmation</span>
                                </li>
                                <li className="flex items-start">
                                    <CheckCircle className="h-5 w-5 text-rose-600 mr-3 mt-0.5 flex-shrink-0" />
                                    <span>Flexible cancellation options</span>
                                </li>
                            </ul>
                        </div>
                        <div className="order-1 md:order-2 bg-gradient-to-br from-rose-100 to-pink-100 rounded-2xl p-12 flex items-center justify-center h-80">
                            <CreditCard className="h-32 w-32 text-rose-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold mb-4">Ready to Find Your Perfect Venue?</h2>
                    <p className="text-gray-300 text-lg mb-8">
                        Start exploring our collection of unique properties today!
                    </p>
                    <Link
                        to="/search"
                        className="inline-block bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold py-3.5 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                        Browse Properties
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default HowItWorks;
