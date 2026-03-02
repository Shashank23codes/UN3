import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, Instagram, Twitter, Facebook, Mail, Phone, MapPin, Linkedin, Youtube } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white print:hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
                    {/* Company Info */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="flex items-center space-x-2 mb-4">
                            <div className="bg-gradient-to-br from-rose-500 to-pink-600 p-2 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                                    <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
                                    <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
                                </svg>
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">UtsavNest</span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Discover unique farmhouses, villas, and event venues for your perfect celebration.
                        </p>
                        <div className="flex space-x-4 pt-4">
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="bg-gray-800 hover:bg-rose-600 p-2.5 rounded-lg transition-all transform hover:scale-110">
                                <Facebook className="h-5 w-5" />
                            </a>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="bg-gray-800 hover:bg-rose-600 p-2.5 rounded-lg transition-all transform hover:scale-110">
                                <Instagram className="h-5 w-5" />
                            </a>
                            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="bg-gray-800 hover:bg-rose-600 p-2.5 rounded-lg transition-all transform hover:scale-110">
                                <Linkedin className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-white text-lg border-b border-gray-700 pb-2">Quick Links</h3>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link to="/" className="text-gray-400 hover:text-rose-400 transition-colors flex items-center group">
                                    <span className="w-0 group-hover:w-2 h-0.5 bg-rose-400 mr-0 group-hover:mr-2 transition-all"></span>
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link to="/about" className="text-gray-400 hover:text-rose-400 transition-colors flex items-center group">
                                    <span className="w-0 group-hover:w-2 h-0.5 bg-rose-400 mr-0 group-hover:mr-2 transition-all"></span>
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link to="/how-it-works" className="text-gray-400 hover:text-rose-400 transition-colors flex items-center group">
                                    <span className="w-0 group-hover:w-2 h-0.5 bg-rose-400 mr-0 group-hover:mr-2 transition-all"></span>
                                    How It Works
                                </Link>
                            </li>
                            <li>
                                <Link to="/contact" className="text-gray-400 hover:text-rose-400 transition-colors flex items-center group">
                                    <span className="w-0 group-hover:w-2 h-0.5 bg-rose-400 mr-0 group-hover:mr-2 transition-all"></span>
                                    Contact Us
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* For Hosts */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-white text-lg border-b border-gray-700 pb-2">For Hosts</h3>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <a href={`${import.meta.env.VITE_VENDOR_URL || 'https://utsavnest-vendor.netlify.app'}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-rose-400 transition-colors flex items-center group">
                                    <span className="w-0 group-hover:w-2 h-0.5 bg-rose-400 mr-0 group-hover:mr-2 transition-all"></span>
                                    List Your Property
                                </a>
                            </li>
                            <li>
                                <Link to="/host-guide" className="text-gray-400 hover:text-rose-400 transition-colors flex items-center group">
                                    <span className="w-0 group-hover:w-2 h-0.5 bg-rose-400 mr-0 group-hover:mr-2 transition-all"></span>
                                    Host Guide
                                </Link>
                            </li>
                            <li>
                                <Link to="/host-resources" className="text-gray-400 hover:text-rose-400 transition-colors flex items-center group">
                                    <span className="w-0 group-hover:w-2 h-0.5 bg-rose-400 mr-0 group-hover:mr-2 transition-all"></span>
                                    Resources
                                </Link>
                            </li>
                            <li>
                                <Link to="/safety-tips" className="text-gray-400 hover:text-rose-400 transition-colors flex items-center group">
                                    <span className="w-0 group-hover:w-2 h-0.5 bg-rose-400 mr-0 group-hover:mr-2 transition-all"></span>
                                    Safety Tips
                                </Link>
                            </li>
                            <li>
                                <Link to="/cancellation-policy" className="text-gray-400 hover:text-rose-400 transition-colors flex items-center group">
                                    <span className="w-0 group-hover:w-2 h-0.5 bg-rose-400 mr-0 group-hover:mr-2 transition-all"></span>
                                    Cancellation Policy
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-white text-lg border-b border-gray-700 pb-2">Support</h3>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link to="/help" className="text-gray-400 hover:text-rose-400 transition-colors flex items-center group">
                                    <span className="w-0 group-hover:w-2 h-0.5 bg-rose-400 mr-0 group-hover:mr-2 transition-all"></span>
                                    Help Center
                                </Link>
                            </li>
                            <li>
                                <Link to="/faq" className="text-gray-400 hover:text-rose-400 transition-colors flex items-center group">
                                    <span className="w-0 group-hover:w-2 h-0.5 bg-rose-400 mr-0 group-hover:mr-2 transition-all"></span>
                                    FAQs
                                </Link>
                            </li>
                            <li>
                                <Link to="/trust-safety" className="text-gray-400 hover:text-rose-400 transition-colors flex items-center group">
                                    <span className="w-0 group-hover:w-2 h-0.5 bg-rose-400 mr-0 group-hover:mr-2 transition-all"></span>
                                    Trust & Safety
                                </Link>
                            </li>
                            <li>
                                <Link to="/refund-policy" className="text-gray-400 hover:text-rose-400 transition-colors flex items-center group">
                                    <span className="w-0 group-hover:w-2 h-0.5 bg-rose-400 mr-0 group-hover:mr-2 transition-all"></span>
                                    Refund Policy
                                </Link>
                            </li>
                            <li>
                                <Link to="/report-issue" className="text-gray-400 hover:text-rose-400 transition-colors flex items-center group">
                                    <span className="w-0 group-hover:w-2 h-0.5 bg-rose-400 mr-0 group-hover:mr-2 transition-all"></span>
                                    Report Issue
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-white text-lg border-b border-gray-700 pb-2">Contact</h3>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-start space-x-3 text-gray-400">
                                <MapPin className="h-5 w-5 text-rose-400 flex-shrink-0 mt-0.5" />
                                <span className="leading-relaxed">123 Event Avenue,<br />Mumbai, Maharashtra 400001</span>
                            </li>
                            <li className="flex items-center space-x-3 text-gray-400 hover:text-rose-400 transition-colors">
                                <Phone className="h-5 w-5 text-rose-400 flex-shrink-0" />
                                <a href="tel:+911234567890">+91 123 456 7890</a>
                            </li>
                            <li className="flex items-center space-x-3 text-gray-400 hover:text-rose-400 transition-colors">
                                <Mail className="h-5 w-5 text-rose-400 flex-shrink-0" />
                                <a href="mailto:support@utsavnest.com">support@utsavnest.com</a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-700 pt-8 mt-8">
                    <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-2 text-sm text-gray-400">
                            <span>© 2024 UtsavNest, Inc.</span>
                            <span className="hidden lg:inline">·</span>
                            <Link to="/privacy-policy" className="hover:text-rose-400 transition-colors">Privacy</Link>
                            <span className="hidden lg:inline">·</span>
                            <Link to="/terms-and-conditions" className="hover:text-rose-400 transition-colors">Terms</Link>
                            <span className="hidden lg:inline">·</span>
                            <Link to="/sitemap" className="hover:text-rose-400 transition-colors">Sitemap</Link>
                            <span className="hidden lg:inline">·</span>
                            <Link to="/cookie-policy" className="hover:text-rose-400 transition-colors">Cookie Policy</Link>
                        </div>

                        <div className="flex items-center space-x-6">
                            <button className="flex items-center space-x-2 text-sm font-medium text-gray-400 hover:text-rose-400 transition-colors">
                                <span>₹ INR</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
