import React from 'react';
import { useNotification } from '../context/NotificationContext';
import { Bell, CheckCircle, X, Shield } from 'lucide-react';

const NotificationPermissionModal = () => {
    const { showPermissionModal, requestPermission, declinePermission } = useNotification();

    if (!showPermissionModal) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden transform transition-all animate-slideUp">
                {/* Header with gradient */}
                <div className="bg-gradient-to-br from-red-500 via-orange-500 to-amber-500 p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"></div>

                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                                <Bell className="w-10 h-10 text-white animate-bounce" />
                            </div>
                            <button
                                onClick={declinePermission}
                                className="text-white/80 hover:text-white transition-colors"
                                aria-label="Close"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <h2 className="text-3xl font-bold mb-2">
                            Stay Alert, Admin! 🚨
                        </h2>
                        <p className="text-white/90 text-lg">
                            Get instant notifications for critical platform events
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8">
                    {/* Feature List */}
                    <div className="space-y-4 mb-6">
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mt-0.5">
                                <CheckCircle className="w-4 h-4 text-red-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">New Vendor & User Registrations</h3>
                                <p className="text-sm text-gray-600">Be notified instantly when new users join the platform</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mt-0.5">
                                <CheckCircle className="w-4 h-4 text-orange-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">KYC Submissions & Verifications</h3>
                                <p className="text-sm text-gray-600">Review and approve KYC documents promptly</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center mt-0.5">
                                <CheckCircle className="w-4 h-4 text-amber-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Booking & Payment Activities</h3>
                                <p className="text-sm text-gray-600">Monitor all platform transactions in real-time</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mt-0.5">
                                <CheckCircle className="w-4 h-4 text-yellow-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Critical System Alerts</h3>
                                <p className="text-sm text-gray-600">Get alerted about disputes and urgent issues</p>
                            </div>
                        </div>
                    </div>

                    {/* Admin Notice */}
                    <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-4 mb-6 border border-red-100">
                        <div className="flex items-center space-x-3">
                            <Shield className="w-6 h-6 text-red-600" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">Admin Priority Access</p>
                                <p className="text-xs text-gray-600">Stay on top of platform operations 24/7</p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <button
                            onClick={requestPermission}
                            className="w-full bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 text-white font-bold py-4 px-6 rounded-xl hover:shadow-lg hover:scale-[1.02] transform transition-all duration-200 flex items-center justify-center space-x-2"
                        >
                            <Bell className="w-5 h-5" />
                            <span>Enable Admin Notifications</span>
                        </button>

                        <button
                            onClick={declinePermission}
                            className="w-full bg-gray-100 text-gray-700 font-medium py-4 px-6 rounded-xl hover:bg-gray-200 transition-all duration-200"
                        >
                            I'll do this later
                        </button>
                    </div>

                    {/* Privacy Note */}
                    <p className="text-xs text-center text-gray-500 mt-6">
                        🔒 Secure admin alerts only. Manage notification preferences in settings.
                        Only critical platform events will trigger notifications.
                    </p>
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
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
        </div>
    );
};

export default NotificationPermissionModal;
