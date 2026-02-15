import React from 'react';
import { Link } from 'react-router-dom';
import {
    Search,
    MessageCircle,
    BookOpen,
    ShieldCheck,
    CreditCard,
    Calendar,
    User,
    Home,
    ArrowRight,
    HelpCircle,
    Mail,
    PhoneCall
} from 'lucide-react';

const HelpCenter = () => {
    const categories = [
        {
            title: "Booking & Reservations",
            icon: <Calendar className="w-6 h-6 text-rose-600" />,
            description: "Learn how to find and book your perfect farmhouse stay.",
            links: ["How to book", "Cancellation policies", "Modifying a trip", "Check-in instructions"]
        },
        {
            title: "Payments & Refunds",
            icon: <CreditCard className="w-6 h-6 text-rose-600" />,
            description: "Everything you need to know about payments, taxes, and refunds.",
            links: ["Advance payments", "Refund timelines", "Payment methods", "Invoices"]
        },
        {
            title: "Your Account",
            icon: <User className="w-6 h-6 text-rose-600" />,
            description: "Manage your profile, security settings, and notifications.",
            links: ["Updating profile", "Resetting password", "Wishlists", "Reviewing hosts"]
        },
        {
            title: "Safety & Quality",
            icon: <ShieldCheck className="w-6 h-6 text-rose-600" />,
            description: "Our standards, verified properties, and reporting issues.",
            links: ["Verified listings", "Reporting an issue", "Guest guidelines", "House rules"]
        },
        {
            title: "Hosting on UtsavNest",
            icon: <Home className="w-6 h-6 text-rose-600" />,
            description: "Information for partners about listing and managing properties.",
            links: ["Getting started", "Host commission", "Owner payout", "Hosting standards"]
        },
        {
            title: "Terms & Policies",
            icon: <BookOpen className="w-6 h-6 text-rose-600" />,
            description: "Review our community standards and legal documentation.",
            links: ["Privacy Policy", "Terms of Service", "Guest policy", "Host policy"]
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Hero Header */}
            <section className="bg-white border-b border-gray-100 py-16 px-4">
                <div className="max-w-4xl mx-auto text-center space-y-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-full text-sm font-bold animate-fadeIn">
                        <HelpCircle className="w-4 h-4" />
                        <span>Support Center</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">
                        How can we help you today?
                    </h1>
                    <div className="relative max-w-2xl mx-auto mt-8">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                            <Search className="h-6 w-6 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search for articles, guides, or keywords..."
                            className="block w-full pl-14 pr-4 py-5 bg-gray-50 border-none rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 shadow-sm text-lg font-medium"
                        />
                    </div>
                </div>
            </section>

            {/* Quick Link Cards */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 mb-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow group cursor-pointer">
                        <div className="p-4 bg-rose-50 rounded-2xl group-hover:bg-rose-100 transition-colors">
                            <MessageCircle className="w-6 h-6 text-rose-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Live Chat</h3>
                            <p className="text-sm text-gray-500 font-medium">Chat with our team 24/7</p>
                        </div>
                    </div>
                    <Link to="/faq" className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow group">
                        <div className="p-4 bg-blue-50 rounded-2xl group-hover:bg-blue-100 transition-colors">
                            <BookOpen className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Browse FAQs</h3>
                            <p className="text-sm text-gray-500 font-medium">Commonly asked questions</p>
                        </div>
                    </Link>
                    <Link to="/contact" className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow group">
                        <div className="p-4 bg-emerald-50 rounded-2xl group-hover:bg-emerald-100 transition-colors">
                            <Mail className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Email Support</h3>
                            <p className="text-sm text-gray-500 font-medium">Get a response within 2 hours</p>
                        </div>
                    </Link>
                </div>
            </section>

            {/* Help Categories */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {categories.map((cat, idx) => (
                        <div key={idx} className="space-y-4">
                            <div className="flex items-center gap-3">
                                {cat.icon}
                                <h2 className="text-xl font-black text-gray-900">{cat.title}</h2>
                            </div>
                            <p className="text-sm text-gray-500 font-medium leading-relaxed">
                                {cat.description}
                            </p>
                            <ul className="space-y-3 pt-2">
                                {cat.links.map((link, lIdx) => (
                                    <li key={lIdx}>
                                        <a href="#" className="text-gray-900 hover:text-rose-600 font-bold text-sm flex items-center group">
                                            {link}
                                            <ArrowRight className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>

            {/* Need More Assistance */}
            <section className="bg-white border-t border-gray-100 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-10 bg-gradient-to-r from-gray-900 to-gray-800 rounded-[32px] p-10 text-white overflow-hidden relative">
                    <div className="absolute right-0 top-0 w-64 h-64 bg-rose-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>

                    <div className="relative z-10 space-y-4 text-center md:text-left">
                        <h2 className="text-3xl font-black">Still can't find what you need?</h2>
                        <p className="text-gray-300 font-medium max-w-lg">
                            Our team of reservation specialists is available 24/7 to help you with your booking, cancellation, or any other questions.
                        </p>
                    </div>

                    <div className="relative z-10 flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <Link
                            to="/contact"
                            className="bg-rose-600 hover:bg-rose-700 text-white font-black py-4 px-8 rounded-2xl flex items-center justify-center gap-3 transition-all"
                        >
                            <PhoneCall className="w-5 h-5" />
                            Call Support
                        </Link>
                        <Link
                            to="/contact"
                            className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-black py-4 px-8 rounded-2xl flex items-center justify-center transition-all border border-white/10"
                        >
                            Contact Us
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HelpCenter;
