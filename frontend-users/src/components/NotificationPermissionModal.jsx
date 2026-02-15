import React from 'react';
import { useNotification } from '../context/NotificationContext';
import { Bell, CheckCircle, X, Smartphone, ShieldCheck, Mail, Zap, Star } from 'lucide-react';

const NotificationPermissionModal = () => {
    const { showPermissionModal, requestPermission, declinePermission, notificationPermission } = useNotification();

    if (!showPermissionModal) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-[32px] shadow-2xl max-w-3xl w-full overflow-hidden transform transition-all animate-slideUp flex flex-col md:flex-row min-h-[500px]">
                {/* Left Side: Visual Branding */}
                <div className="md:w-[40%] bg-gradient-to-br from-rose-600 to-rose-900 p-10 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-rose-400/20 rounded-full -ml-24 -mb-24 blur-2xl"></div>

                    <div className="relative z-10">
                        <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-4 w-fit border border-white/30 shadow-xl mb-8">
                            <Bell className="w-10 h-10 text-white animate-pulse" />
                        </div>
                        <h2 className="text-4xl font-black mb-4 leading-tight tracking-tight">
                            Stay in the Loop!
                        </h2>
                        <p className="text-rose-100/90 text-lg font-medium leading-relaxed">
                            Never miss important updates about your bookings and exclusive deals.
                        </p>
                    </div>

                    <div className="relative z-10 space-y-4">
                        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10">
                            <ShieldCheck className="w-5 h-5 text-rose-200" />
                            <span className="text-xs font-semibold text-rose-100">Privacy Guaranteed</span>
                        </div>
                    </div>
                </div>

                {/* Right Side: Detailed Features & Actions */}
                <div className="md:w-[60%] p-10 flex flex-col relative">
                    <button
                        onClick={declinePermission}
                        className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all duration-200"
                        aria-label="Close"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <div className="flex-1 space-y-8">
                        <div>
                            <span className="text-rose-600 font-bold text-xs uppercase tracking-widest mb-1 block">Notifications</span>
                            <h3 className="text-2xl font-extrabold text-gray-900">What you'll receive</h3>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <div className="flex items-start gap-4 group">
                                <div className="p-3 bg-green-50 rounded-2xl group-hover:bg-green-100 transition-colors">
                                    <Zap className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-base">Real-time Updates</h4>
                                    <p className="text-sm text-gray-500 font-medium">Instant confirmation and status changes for your bookings.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 group">
                                <div className="p-3 bg-blue-50 rounded-2xl group-hover:bg-blue-100 transition-colors">
                                    <Mail className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-base">Smart Reminders</h4>
                                    <p className="text-sm text-gray-500 font-medium">Timely alerts before your trip so you never miss a thing.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 group">
                                <div className="p-3 bg-purple-50 rounded-2xl group-hover:bg-purple-100 transition-colors">
                                    <Star className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-base">Exclusive Offers</h4>
                                    <p className="text-sm text-gray-500 font-medium">Be the first to know about flash sales and seasonal deals.</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex items-center gap-4">
                            <div className="p-2 bg-white rounded-xl shadow-sm">
                                <Smartphone className="w-6 h-6 text-gray-700" />
                            </div>
                            <p className="text-xs text-gray-600 font-semibold leading-relaxed">
                                High compatibility: Works on desktop and mobile, even when your browser is closed.
                            </p>
                        </div>
                    </div>

                    <div className="mt-10 space-y-3">
                        <button
                            onClick={requestPermission}
                            className="w-full bg-gradient-to-r from-rose-600 to-rose-700 text-white font-black py-4.5 px-6 rounded-2xl hover:shadow-xl hover:shadow-rose-500/30 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3 text-base"
                        >
                            <Bell className="w-5 h-5" />
                            Enable Notifications
                        </button>

                        <button
                            onClick={declinePermission}
                            className="w-full py-4 text-gray-500 font-bold hover:text-gray-900 transition-colors text-sm"
                        >
                            Not now, maybe later
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(40px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .animate-slideUp {
                    animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .py-4\\.5 {
                    padding-top: 1.125rem;
                    padding-bottom: 1.125rem;
                }
            `}</style>
        </div>
    );
};

export default NotificationPermissionModal;
