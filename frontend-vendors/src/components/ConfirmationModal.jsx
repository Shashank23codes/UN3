import React from 'react';
import { X, HelpCircle, AlertTriangle, Loader2, MessageSquare } from 'lucide-react';

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'default', // 'default', 'danger'
    showInput = false,
    inputValue = '',
    onInputChange = () => { },
    inputPlaceholder = 'Write your reason here...',
    loading = false
}) => {
    if (!isOpen) return null;

    const isDanger = type === 'danger';

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-modalSlideUp border border-gray-100">
                {/* Header Decoration */}
                <div className={`h-2 w-full ${isDanger ? 'bg-red-500' : 'bg-emerald-500'}`} />

                <div className="p-8">
                    {/* Icon Container */}
                    <div className="flex justify-center mb-6">
                        <div className={`p-4 rounded-2xl ${isDanger ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                            {showInput ? (
                                <MessageSquare className="w-8 h-8" />
                            ) : isDanger ? (
                                <AlertTriangle className="w-8 h-8" />
                            ) : (
                                <HelpCircle className="w-8 h-8" />
                            )}
                        </div>
                    </div>

                    <div className="text-center mb-8">
                        <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">
                            {title}
                        </h3>
                        <p className="text-gray-500 font-medium leading-relaxed">
                            {message}
                        </p>
                    </div>

                    {showInput && (
                        <div className="mb-8">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">
                                Reason for {title.toLowerCase()}
                            </label>
                            <textarea
                                value={inputValue}
                                onChange={(e) => onInputChange(e.target.value)}
                                placeholder={inputPlaceholder}
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all resize-none h-32 font-medium"
                                autoFocus
                            />
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 px-6 py-4 rounded-2xl text-gray-500 font-bold hover:bg-gray-50 hover:text-gray-900 transition-all active:scale-95 text-center"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={loading || (showInput && !inputValue.trim())}
                            className={`flex-1 px-6 py-4 rounded-2xl font-black text-white shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${isDanger
                                ? 'bg-red-500 hover:bg-red-600 shadow-red-200'
                                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : confirmText}
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes modalSlideUp {
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
                    animation: fadeIn 0.2s ease-out forwards;
                }
                .animate-modalSlideUp {
                    animation: modalSlideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                }
            `}</style>
        </div>
    );
};

export default ConfirmationModal;
