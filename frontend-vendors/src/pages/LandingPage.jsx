import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Building2,
    TrendingUp,
    ShieldCheck,
    Users,
    CheckCircle,
    ArrowRight,
    Menu,
    X,
    DollarSign,
    Calendar,
    Star,
    HelpCircle,
    ChevronDown,
    ChevronUp
} from 'lucide-react';

const LandingPage = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [openFaq, setOpenFaq] = useState(null);

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const faqs = [
        {
            question: "How much does it cost to list my property?",
            answer: "Listing your property on UtsavNest is completely free. We only charge a small service fee when you receive a confirmed booking."
        },
        {
            question: "How do I get paid?",
            answer: "We transfer your earnings directly to your bank account 24 hours after the guest checks in. You can track all your payouts in the dashboard."
        },
        {
            question: "Is my property insured?",
            answer: "Yes, every booking on UtsavNest is covered by our Host Protection program, which includes liability coverage and property damage protection."
        },
        {
            question: "Can I choose who stays at my place?",
            answer: "Absolutely. You can set your own house rules and requirements. You also have the option to review guest profiles before accepting bookings."
        }
    ];

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900">
            {/* Navigation */}
            <nav className="fixed w-full bg-white/90 backdrop-blur-md z-50 border-b border-gray-100 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20 items-center">
                        <div className="flex items-center">
                            <div className="bg-emerald-600 p-2 rounded-lg mr-2">
                                <Building2 className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold tracking-tight text-gray-900">UtsavNest <span className="text-emerald-600">Partner</span></span>
                        </div>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center space-x-8">
                            <a href="#features" className="text-gray-600 hover:text-emerald-600 font-medium transition-colors">Features</a>
                            <a href="#how-it-works" className="text-gray-600 hover:text-emerald-600 font-medium transition-colors">How it Works</a>
                            <a href="#testimonials" className="text-gray-600 hover:text-emerald-600 font-medium transition-colors">Stories</a>
                            <div className="flex items-center space-x-4 ml-4">
                                <Link to="/login" className="text-gray-900 hover:text-emerald-600 font-bold transition-colors">Log in</Link>
                                <Link to="/register" className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-full font-bold transition-all shadow-lg hover:shadow-emerald-200 transform hover:-translate-y-0.5">
                                    List Your Property
                                </Link>
                            </div>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden flex items-center">
                            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-600 hover:text-gray-900 p-2">
                                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-xl">
                        <div className="px-4 pt-2 pb-6 space-y-2">
                            <a href="#features" className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-emerald-600 hover:bg-gray-50" onClick={() => setIsMobileMenuOpen(false)}>Features</a>
                            <a href="#how-it-works" className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-emerald-600 hover:bg-gray-50" onClick={() => setIsMobileMenuOpen(false)}>How it Works</a>
                            <a href="#testimonials" className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-emerald-600 hover:bg-gray-50" onClick={() => setIsMobileMenuOpen(false)}>Stories</a>
                            <div className="pt-4 flex flex-col space-y-3 px-3">
                                <Link to="/login" className="w-full text-center px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-bold hover:bg-gray-50">Log in</Link>
                                <Link to="/register" className="w-full text-center px-4 py-3 bg-emerald-600 rounded-lg text-white font-bold hover:bg-emerald-700 shadow-md">List Your Property</Link>
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <div className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-white opacity-70"></div>
                    <div className="absolute right-0 top-0 -mr-20 -mt-20 w-96 h-96 bg-emerald-100 rounded-full blur-3xl opacity-30"></div>
                    <div className="absolute left-0 bottom-0 -ml-20 -mb-20 w-80 h-80 bg-blue-100 rounded-full blur-3xl opacity-30"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
                        <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
                            <div className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 font-semibold text-sm mb-6">
                                <Star className="h-4 w-4 mr-2 fill-emerald-700" />
                                Trusted by 5,000+ Farmhouse Owners
                            </div>
                            <h1 className="text-5xl tracking-tight font-extrabold text-gray-900 sm:text-6xl md:text-7xl mb-6 leading-tight">
                                Turn your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Farmhouse</span> into income.
                            </h1>
                            <p className="mt-4 text-lg text-gray-600 sm:mt-5 sm:text-xl md:mt-5 md:text-2xl lg:mx-0 leading-relaxed">
                                Join India's fastest-growing network of premium farmhouses. We handle the marketing, bookings, and payments while you focus on hosting.
                            </p>
                            <div className="mt-10 sm:flex sm:justify-center lg:justify-start gap-4">
                                <Link to="/register" className="w-full sm:w-auto flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 md:py-4 md:text-xl md:px-10 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-200">
                                    Start Hosting Now
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                                <a href="#how-it-works" className="mt-3 w-full sm:mt-0 sm:w-auto flex items-center justify-center px-8 py-4 border border-gray-200 text-lg font-bold rounded-xl text-gray-700 bg-white hover:bg-gray-50 md:py-4 md:text-xl md:px-10 shadow-sm transition-all duration-200">
                                    Learn More
                                </a>
                            </div>
                            <div className="mt-8 flex items-center justify-center lg:justify-start space-x-8 text-gray-500 text-sm font-medium">
                                <div className="flex items-center"><CheckCircle className="h-5 w-5 text-emerald-500 mr-2" /> Free Listing</div>
                                <div className="flex items-center"><CheckCircle className="h-5 w-5 text-emerald-500 mr-2" /> Verified Guests</div>
                                <div className="flex items-center"><CheckCircle className="h-5 w-5 text-emerald-500 mr-2" /> 24/7 Support</div>
                            </div>
                        </div>
                        <div className="mt-16 lg:mt-0 lg:col-span-6 relative">
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-500">
                                <img
                                    className="w-full h-full object-cover"
                                    src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                                    alt="Luxury Farmhouse"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                                    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl max-w-xs">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Host" className="h-10 w-10 rounded-full border-2 border-white" />
                                            <div>
                                                <p className="text-white font-bold">Rajesh's Estate</p>
                                                <div className="flex items-center text-yellow-400 text-xs">
                                                    <Star className="h-3 w-3 fill-current" />
                                                    <Star className="h-3 w-3 fill-current" />
                                                    <Star className="h-3 w-3 fill-current" />
                                                    <Star className="h-3 w-3 fill-current" />
                                                    <Star className="h-3 w-3 fill-current" />
                                                    <span className="ml-1 text-white">(48 reviews)</span>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-emerald-300 font-bold text-lg">₹1.5 Lakhs <span className="text-gray-300 text-sm font-normal">earned this month</span></p>
                                    </div>
                                </div>
                            </div>
                            {/* Floating Stats Card */}
                            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-xl border border-gray-100 hidden md:block animate-bounce-slow">
                                <div className="flex items-center space-x-4">
                                    <div className="bg-green-100 p-3 rounded-full">
                                        <TrendingUp className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Avg. Annual Income</p>
                                        <p className="text-2xl font-bold text-gray-900">₹12 Lakhs+</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="bg-emerald-900 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 gap-8 md:grid-cols-4 text-center">
                        <div>
                            <div className="text-4xl font-bold text-white mb-2">5000+</div>
                            <div className="text-emerald-200 font-medium">Active Hosts</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-white mb-2">₹50Cr+</div>
                            <div className="text-emerald-200 font-medium">Paid to Hosts</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-white mb-2">100k+</div>
                            <div className="text-emerald-200 font-medium">Happy Guests</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-white mb-2">4.8/5</div>
                            <div className="text-emerald-200 font-medium">Average Rating</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div id="features" className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-emerald-600 font-bold tracking-wide uppercase text-sm mb-2">Why Choose UtsavNest</h2>
                        <p className="text-4xl font-extrabold text-gray-900 mb-4">
                            Everything you need to run a successful rental business
                        </p>
                        <p className="text-xl text-gray-500">
                            We provide the tools, support, and exposure you need to maximize your property's potential.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
                        {[
                            {
                                icon: Users,
                                title: "Verified Guests",
                                desc: "Every guest must verify their identity before booking. You can also review guest ratings from other hosts."
                            },
                            {
                                icon: TrendingUp,
                                title: "Smart Pricing",
                                desc: "Our AI-driven pricing tool helps you adjust rates based on demand, seasonality, and local events to maximize revenue."
                            },
                            {
                                icon: ShieldCheck,
                                title: "Host Protection",
                                desc: "Rest easy with our comprehensive property protection plan covering damages up to ₹1 Crore for every booking."
                            },
                            {
                                icon: Calendar,
                                title: "Easy Scheduling",
                                desc: "Sync your calendar with other platforms like Airbnb and Booking.com to avoid double bookings automatically."
                            },
                            {
                                icon: DollarSign,
                                title: "Fast Payouts",
                                desc: "Get paid directly to your bank account within 24 hours of guest check-in. No waiting for monthly cycles."
                            },
                            {
                                icon: Building2,
                                title: "Property Management",
                                desc: "Access a network of trusted cleaners, maintenance staff, and photographers to keep your property in top shape."
                            }
                        ].map((feature, idx) => (
                            <div key={idx} className="flex flex-col items-start p-8 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group">
                                <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors mb-6">
                                    <feature.icon className="h-7 w-7" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                <p className="text-gray-500 leading-relaxed">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* How It Works */}
            <div id="how-it-works" className="py-24 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:grid lg:grid-cols-2 lg:gap-24 items-center">
                        <div>
                            <h2 className="text-4xl font-extrabold text-gray-900 mb-6">
                                Hosting made simple.
                            </h2>
                            <p className="text-lg text-gray-500 mb-12">
                                Getting started is easy. Our team will guide you through every step of the process to ensure your listing stands out.
                            </p>

                            <div className="space-y-10">
                                {[
                                    {
                                        step: "01",
                                        title: "Create your listing",
                                        desc: "Sign up for free, upload high-quality photos, and describe what makes your farmhouse unique."
                                    },
                                    {
                                        step: "02",
                                        title: "Set your rules & price",
                                        desc: "You have full control. Choose your availability, house rules, and nightly rates."
                                    },
                                    {
                                        step: "03",
                                        title: "Welcome your guests",
                                        desc: "Receive booking requests, chat with guests, and welcome them to your beautiful property."
                                    }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex">
                                        <div className="flex-shrink-0 mr-6">
                                            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 font-bold text-xl border-4 border-white shadow-md">
                                                {item.step}
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                                            <p className="text-gray-500">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-12">
                                <Link to="/register" className="btn-primary px-8 py-3 inline-flex items-center shadow-lg">
                                    Get Started
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </div>
                        </div>
                        <div className="mt-16 lg:mt-0 relative">
                            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-yellow-100 rounded-full blur-3xl opacity-50"></div>
                            <img
                                src="https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                                alt="Happy Host"
                                className="relative rounded-2xl shadow-2xl z-10"
                            />
                            <div className="absolute -bottom-10 -left-10 bg-white p-6 rounded-xl shadow-xl z-20 max-w-xs border border-gray-100">
                                <p className="text-gray-600 italic mb-4">"Listing on UtsavNest was the best decision for my property. The support team is amazing and the guests are respectful."</p>
                                <div className="flex items-center">
                                    <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="User" className="h-10 w-10 rounded-full mr-3" />
                                    <div>
                                        <p className="font-bold text-gray-900">Priya Sharma</p>
                                        <p className="text-xs text-gray-500">Host since 2021</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* FAQ Section */}
            <div className="py-24 bg-gray-50">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-12">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <button
                                    className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none"
                                    onClick={() => toggleFaq(index)}
                                >
                                    <span className="font-bold text-gray-900">{faq.question}</span>
                                    {openFaq === index ? <ChevronUp className="h-5 w-5 text-emerald-600" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                                </button>
                                {openFaq === index && (
                                    <div className="px-6 pb-4 text-gray-600 animate-fadeIn">
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-emerald-900 py-20 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                    <h2 className="text-4xl font-extrabold text-white mb-6">Ready to start earning?</h2>
                    <p className="text-xl text-emerald-100 mb-10 max-w-2xl mx-auto">
                        Join thousands of hosts who are turning their passion for hospitality into a profitable business.
                    </p>
                    <Link to="/register" className="inline-flex items-center justify-center px-10 py-4 border border-transparent text-lg font-bold rounded-full text-emerald-900 bg-white hover:bg-gray-100 shadow-xl transition-transform hover:scale-105">
                        Create Your Listing Now
                    </Link>
                    <p className="mt-6 text-sm text-emerald-300">No setup fees • Cancel anytime</p>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 text-white pt-16 pb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                        <div className="col-span-1 md:col-span-1">
                            <div className="flex items-center mb-4">
                                <Building2 className="h-8 w-8 text-emerald-500 mr-2" />
                                <span className="text-xl font-bold">UtsavNest</span>
                            </div>
                            <p className="text-gray-400 text-sm">
                                Empowering property owners to share their unique spaces with the world.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold mb-4">Company</h3>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li><a href="#" className="hover:text-white">About Us</a></li>
                                <li><a href="#" className="hover:text-white">Careers</a></li>
                                <li><a href="#" className="hover:text-white">Press</a></li>
                                <li><a href="#" className="hover:text-white">Blog</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold mb-4">Support</h3>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li><a href="#" className="hover:text-white">Help Center</a></li>
                                <li><a href="#" className="hover:text-white">Safety Information</a></li>
                                <li><a href="#" className="hover:text-white">Cancellation Options</a></li>
                                <li><a href="#" className="hover:text-white">Report a Concern</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold mb-4">Legal</h3>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-white">Cookie Policy</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
                        <p className="text-gray-500 text-sm">© 2024 UtsavNest. All rights reserved.</p>
                        <div className="flex space-x-6 mt-4 md:mt-0">
                            {/* Social Icons would go here */}
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
