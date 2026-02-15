import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Building2, Shield, TrendingUp, Users } from 'lucide-react';

const About = () => {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-rose-50 to-pink-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <Link to="/" className="inline-flex items-center text-gray-600 hover:text-rose-600 mb-8 transition-colors">
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Back to Home
                    </Link>
                    <h1 className="text-5xl font-bold text-gray-900 mb-6">About UtsavNest</h1>
                    <p className="text-xl text-gray-600 max-w-3xl">
                        Your trusted platform for discovering and booking unique farmhouses, villas, and venues for unforgettable celebrations.
                    </p>
                </div>
            </div>

            {/* Story Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
                        <p className="text-gray-600 mb-4 leading-relaxed">
                            UtsavNest was born from a simple idea: every celebration deserves the perfect venue. We understand that finding the right space for your special moments can be challenging, time-consuming, and often overwhelming.
                        </p>
                        <p className="text-gray-600 mb-4 leading-relaxed">
                            Founded in 2024, we've created a platform that connects property owners with people looking for unique spaces to celebrate life's most important moments. From intimate family gatherings to grand weddings, we're here to make venue booking simple, transparent, and delightful.
                        </p>
                        <p className="text-gray-600 leading-relaxed">
                            Today, we're proud to serve thousands of happy customers across India, offering a diverse range of properties that cater to every budget and requirement.
                        </p>
                    </div>
                    <div className="bg-gradient-to-br from-rose-100 to-pink-100 rounded-2xl p-8 h-96 flex items-center justify-center">
                        <div className="text-center">
                            <Building2 className="h-24 w-24 text-rose-600 mx-auto mb-4" />
                            <p className="text-gray-700 font-semibold">Making Every Celebration Memorable</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="text-4xl font-bold text-rose-400 mb-2">500+</div>
                            <div className="text-gray-300">Properties Listed</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-rose-400 mb-2">10k+</div>
                            <div className="text-gray-300">Happy Customers</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-rose-400 mb-2">50+</div>
                            <div className="text-gray-300">Cities Covered</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-rose-400 mb-2">98%</div>
                            <div className="text-gray-300">Satisfaction Rate</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Values Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Core Values</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-xl transition-shadow">
                        <Shield className="h-12 w-12 text-rose-600 mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Trust & Safety</h3>
                        <p className="text-gray-600">
                            We verify all properties and hosts to ensure your safety and peace of mind. Your security is our top priority.
                        </p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-xl transition-shadow">
                        <TrendingUp className="h-12 w-12 text-rose-600 mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Quality Service</h3>
                        <p className="text-gray-600">
                            From booking to checkout, we provide exceptional support to make your experience seamless and memorable.
                        </p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-xl transition-shadow">
                        <Users className="h-12 w-12 text-rose-600 mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Community First</h3>
                        <p className="text-gray-600">
                            We build strong relationships between hosts and guests, fostering a community of celebrations and joy.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
