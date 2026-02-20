import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, User, LogOut, Heart, MapPin, X, Search, Bell, Home as HomeIcon, HelpCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SearchBar from './SearchBar';
import NotificationDropdown from './NotificationDropdown';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Only show search bar on homepage
    const isHomePage = location.pathname === '/';

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen || isMobileSearchOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobileMenuOpen, isMobileSearchOpen]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (isMenuOpen && !e.target.closest('.user-menu')) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMenuOpen]);

    const handleLogout = () => {
        logout();
        setIsMenuOpen(false);
        setIsMobileMenuOpen(false);
        navigate('/');
    };

    return (
        <>
            {/* Main Navbar */}
            <nav className={`fixed w-full z-50 transition-all duration-300 print:hidden ${scrolled
                ? 'bg-white shadow-md py-4'
                : 'bg-white/95 backdrop-blur-md py-4 border-b border-gray-100'
                }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between gap-4">
                        {/* 1. Logo Section */}
                        <Link to="/" className="flex items-center gap-2 group flex-shrink-0 z-20">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl blur-sm opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="relative bg-gradient-to-br from-rose-500 to-pink-600 p-2 rounded-xl shadow-sm">
                                    <HomeIcon className="w-5 h-5 text-white" strokeWidth={2.5} />
                                </div>
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent tracking-tight">
                                UtsavNest
                            </span>
                        </Link>

                        {/* 2. Center Search Bar - Desktop Only & Homepage Only */}
                        {isHomePage ? (
                            <div className="hidden md:flex flex-1 justify-center max-w-2xl mx-auto absolute left-0 right-0 pointer-events-none">
                                <div className="pointer-events-auto w-full max-w-xl">
                                    <SearchBar scrolled={scrolled} />
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1"></div> /* Spacer for alignment */
                        )}

                        {/* 3. Right Side Actions */}
                        <div className="flex items-center gap-1 sm:gap-2 z-20">
                            {/* Mobile Search Trigger */}
                            {isHomePage && (
                                <button
                                    onClick={() => setIsMobileSearchOpen(true)}
                                    className="md:hidden p-2.5 hover:bg-gray-100 rounded-full transition-all active:scale-95"
                                    aria-label="Search"
                                >
                                    <Search className="h-5 w-5 text-gray-700" />
                                </button>
                            )}

                            {/* Notifications - Desktop */}
                            {user && (
                                <div className="hidden md:block">
                                    <NotificationDropdown />
                                </div>
                            )}

                            {/* User Menu - Desktop */}
                            <div className="hidden md:block relative user-menu ml-2">
                                <button
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className="flex items-center gap-2 pl-3 pr-1 py-1 border border-gray-200 rounded-full hover:shadow-md transition-all duration-200 bg-white"
                                >
                                    <Menu className="h-4 w-4 text-gray-600 ml-1" />
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-100">
                                        {user?.picture ? (
                                            <img src={user.picture} alt="User" className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="h-4 w-4 text-gray-500" />
                                        )}
                                    </div>
                                </button>

                                {/* Dropdown Menu */}
                                {isMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-xl border border-gray-100 py-2 overflow-hidden animate-fadeIn origin-top-right">
                                        {user ? (
                                            <>
                                                <div className="px-4 py-3 border-b border-gray-50">
                                                    <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                                                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                                </div>
                                                <div className="py-1">
                                                    <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                                        <User className="h-4 w-4" /> Profile
                                                    </Link>
                                                    <Link to="/trips" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                                        <MapPin className="h-4 w-4" /> My Trips
                                                    </Link>
                                                    <Link to="/wishlists" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                                        <Heart className="h-4 w-4" /> Wishlists
                                                    </Link>
                                                    <div className="border-t border-gray-50 my-1"></div>
                                                    <Link to="/help" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                                        <HelpCircle className="h-4 w-4" /> Help Center
                                                    </Link>
                                                </div>
                                                <div className="border-t border-gray-50 my-1"></div>
                                                <div className="py-1">
                                                    <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50">
                                                        <LogOut className="h-4 w-4" /> Log out
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="py-1">
                                                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50">Log in</Link>
                                                <Link to="/register" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Sign up</Link>
                                                <div className="border-t border-gray-50 my-1"></div>
                                                <Link to="/help" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Help Center</Link>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="md:hidden p-2.5 hover:bg-gray-100 rounded-full transition-all active:scale-95 ml-1"
                                aria-label="Menu"
                            >
                                <Menu className="h-6 w-6 text-gray-700" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Sidebar */}
            <div className={`md:hidden fixed inset-0 z-50 transform transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
                }`}>
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
                <div className="absolute right-0 top-0 bottom-0 w-[80%] max-w-sm bg-white shadow-2xl overflow-y-auto">
                    <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between z-10">
                        <h2 className="text-lg font-bold text-gray-900">Menu</h2>
                        <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                            <X className="h-5 w-5 text-gray-500" />
                        </button>
                    </div>

                    <div className="p-5">
                        {user ? (
                            <>
                                <div className="flex items-center gap-3 mb-6 p-3 bg-gray-50 rounded-xl">
                                    <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold">
                                        {user.name[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-900 truncate">{user.name}</p>
                                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium">
                                        <User className="h-5 w-5" /> Profile
                                    </Link>
                                    <Link to="/trips" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium">
                                        <MapPin className="h-5 w-5" /> My Trips
                                    </Link>
                                    <Link to="/wishlists" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium">
                                        <Heart className="h-5 w-5" /> Wishlists
                                    </Link>
                                    <Link to="/notifications" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium">
                                        <Bell className="h-5 w-5" /> Notifications
                                    </Link>
                                    <Link to="/help" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium">
                                        <HelpCircle className="h-5 w-5" /> Help Center
                                    </Link>
                                </div>
                                <div className="border-t border-gray-100 my-4"></div>
                                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-rose-50 text-rose-600 font-medium">
                                    <LogOut className="h-5 w-5" /> Log out
                                </button>
                            </>
                        ) : (
                            <div className="space-y-3">
                                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="block w-full py-3 px-4 bg-rose-600 text-white text-center font-bold rounded-xl shadow-md shadow-rose-200">Log in</Link>
                                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="block w-full py-3 px-4 bg-gray-100 text-gray-900 text-center font-bold rounded-xl">Sign up</Link>
                                <div className="border-t border-gray-100 my-4"></div>
                                <Link to="/help" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-2 text-gray-600 font-medium">Help Center</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Search Modal */}
            {isMobileSearchOpen && (
                <div className="md:hidden fixed inset-0 z-50 bg-white animate-fadeIn">
                    <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900">Search</h2>
                            <button onClick={() => setIsMobileSearchOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                <X className="h-6 w-6 text-gray-500" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                            <SearchBar scrolled={scrolled} isMobile={true} onClose={() => setIsMobileSearchOpen(false)} />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;
