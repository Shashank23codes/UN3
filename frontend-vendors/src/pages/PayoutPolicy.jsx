import React, { useState } from 'react';
import {
    DollarSign, Info, CheckCircle, XCircle, Clock,
    Building, CreditCard, HelpCircle, ChevronDown, ChevronUp,
    AlertTriangle, Wallet, TrendingUp
} from 'lucide-react';

const PayoutPolicy = () => {
    const [expandedSections, setExpandedSections] = useState({
        commission: true,
        schedule: false,
        example: false,
        requirements: false,
        cancellation: false,
        methods: false,
        faq: false
    });

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const Section = ({ id, title, icon: Icon, children }) => {
        const isExpanded = expandedSections[id];

        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-4">
                <button
                    onClick={() => toggleSection(id)}
                    className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                            <Icon className="h-5 w-5 text-emerald-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                    </div>
                    {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                </button>
                {isExpanded && (
                    <div className="px-6 pb-6 border-t border-gray-100">
                        {children}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Vendor Payout Policy</h1>
                <p className="text-gray-600">Understand how and when you receive your earn ings</p>
            </div>

            {/* Quick Stats Banner */}
            <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl p-6 mb-8 text-white">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="h-5 w-5" />
                            <span className="text-sm font-medium opacity-90">Platform Fee</span>
                        </div>
                        <p className="text-3xl font-bold">5%</p>
                        <p className="text-xs opacity-75 mt-1">On total booking value</p>
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-5 w-5" />
                            <span className="text-sm font-medium opacity-90">Payout Timing</span>
                        </div>
                        <p className="text-3xl font-bold">3 Days</p>
                        <p className="text-xs opacity-75 mt-1">Before check-in</p>
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-5 w-5" />
                            <span className="text-sm font-medium opacity-90">You Earn</span>
                        </div>
                        <p className="text-3xl font-bold">95%</p>
                        <p className="text-xs opacity-75 mt-1">Of total booking value</p>
                    </div>
                </div>
            </div>

            {/* Commission Structure */}
            <Section id="commission" title="Commission Structure" icon={DollarSign}>
                <div className="mt-4 space-y-4">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                        <p className="text-sm text-emerald-900">
                            <strong>Platform Commission: 5%</strong>
                        </p>
                        <p className="text-xs text-emerald-700 mt-2">
                            This covers platform operations, marketing, payment processing, customer support, and technology infrastructure.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="border border-gray-200 rounded-lg p-4">
                            <p className="text-xs text-gray-600 mb-1">Advance Payment</p>
                            <p className="text-2xl font-bold text-gray-900">30%</p>
                            <p className="text-xs text-gray-500 mt-1">Paid during booking</p>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-4">
                            <p className="text-xs text-gray-600 mb-1">Balance Payment</p>
                            <p className="text-2xl font-bold text-gray-900">70%</p>
                            <p className="text-xs text-gray-500 mt-1">At check-in</p>
                        </div>
                    </div>
                </div>
            </Section>

            {/* Payout Schedule */}
            <Section id="schedule" title="Payout Schedule" icon={Clock}>
                <div className="mt-4 space-y-6">
                    <div className="border-l-4 border-emerald-500 pl-4">
                        <h4 className="font-bold text-gray-900 mb-2">Advance Payout (30%)</h4>
                        <div className="space-y-2 text-sm">
                            <p className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                                <span><strong>When:</strong> 3 days before guest check-in</span>
                            </p>
                            <p className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                                <span><strong>Amount:</strong> Advance payment minus 5% commission</span>
                            </p>
                            <p className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                                <span><strong>Method:</strong> Admin-managed transfer to your bank</span>
                            </p>
                            <p className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                                <span><strong>Why:</strong> Aligns with cancellation policy for fair protection</span>
                            </p>
                        </div>
                    </div>

                    <div className="border-l-4 border-blue-500 pl-4">
                        <h4 className="font-bold text-gray-900 mb-2">Balance Collection (70%)</h4>
                        <div className="space-y-2 text-sm">
                            <p className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                <span><strong>When:</strong> At guest check-in</span>
                            </p>
                            <p className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                <span><strong>Amount:</strong> Full 70% (no platform deduction!)</span>
                            </p>
                            <p className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                <span><strong>Method:</strong> Cash/UPI - Collect directly from guest</span>
                            </p>
                        </div>
                    </div>
                </div>
            </Section>

            {/* Example Calculation */}
            <Section id="example" title="Example Calculation" icon={Wallet}>
                <div className="mt-4 bg-gray-50 rounded-lg p-6">
                    <p className="text-sm font-semibold text-gray-900 mb-4">For a booking of ₹10,000:</p>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Guest pays advance (30%)</span>
                            <span className="font-semibold text-gray-900 ">₹3,000</span>
                        </div>
                        <div className="flex justify-between items-center text-red-600">
                            <span className="text-sm">Platform commission (5%)</span>
                            <span className="font-semibold">-₹500</span>
                        </div>
                        <div className="border-t border-gray-300 pt-2 flex justify-between items-center">
                            <span className="text-sm font-bold text-emerald-600">Your advance payout</span>
                            <span className="font-bold text-emerald-600">₹2,500</span>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                            <p className="text-xs text-blue-800"><strong>Timing:</strong> Received 3 days before guest check-in</p>
                        </div>
                        <div className="flex justify-between items-center mt-4">
                            <span className="text-sm text-gray-600">Guest pays at venue (70%)</span>
                            <span className="font-semibold text-gray-900">₹7,000</span>
                        </div>
                        <div className="border-t-2 border-gray-400 pt-3 flex justify-between items-center">
                            <span className="font-bold text-gray-900 text-lg">Your Total Earning</span>
                            <span className="font-bold text-emerald-600 text-2xl">₹9,500</span>
                        </div>
                    </div>
                </div>
            </Section>

            {/* Cancellation Impact */}
            <Section id="cancellation" title="Cancellation Policy (Aligned with Payout)" icon={AlertTriangle}>
                <div className="mt-4">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                        <p className="text-sm font-semibold text-amber-900 mb-2">Why 3 Days Before Check-in?</p>
                        <p className="text-xs text-amber-800">Payout timing aligns perfectly with the cancellation policy to protect both you and your guests fairly.</p>
                    </div>

                    <div className="space-y-3">
                        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                                <XCircle className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium text-blue-900">{'>'}3 days before check-in ({'>'}72h)</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="bg-white bg-opacity-50 p-2 rounded">
                                    <p className="font-semibold text-gray-700">Guest gets:</p>
                                    <p className="text-blue-800">100% refund</p>
                                </div>
                                <div className="bg-white bg-opacity-50 p-2 rounded">
                                    <p className="font-semibold text-gray-700">You get:</p>
                                    <p className="text-blue-800">₹0 (no payout yet)</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                <span className="text-sm font-medium text-yellow-900">24-48 hours before</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="bg-white bg-opacity-50 p-2 rounded">
                                    <p className="font-semibold text-gray-700">Guest gets:</p>
                                    <p className="text-yellow-800">50% refund</p>
                                </div>
                                <div className="bg-white bg-opacity-50 p-2 rounded">
                                    <p className="font-semibold text-gray-700">You keep:</p>
                                    <p className="text-yellow-800">50% of advance</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium text-green-900">{'<'}24 hours before</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="bg-white bg-opacity-50 p-2 rounded">
                                    <p className="font-semibold text-gray-700">Guest gets:</p>
                                    <p className="text-green-800">30% refund</p>
                                </div>
                                <div className="bg-white bg-opacity-50 p-2 rounded">
                                    <p className="font-semibold text-gray-700">You keep:</p>
                                    <p className="text-green-800">70% of advance</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                                <XCircle className="h-4 w-4 text-red-600" />
                                <span className="text-sm font-medium text-red-900">You reject booking</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="bg-white bg-opacity-50 p-2 rounded">
                                    <p className="font-semibold text-gray-700">Guest gets:</p>
                                    <p className="text-red-800">100% refund</p>
                                </div>
                                <div className="bg-white bg-opacity-50 p-2 rounded">
                                    <p className="font-semibold text-gray-700">You get:</p>
                                    <p className="text-red-800">No payout</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Section>

            {/* Footer */}
            <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-semibold text-gray-900 mb-1">Need Help?</p>
                        <p className="text-xs text-gray-600">
                            Contact our vendor support team at <a href="mailto:vendor-support@utsavnest.com" className="text-emerald-600 hover:underline">vendor-support@utsavnest.com</a> or check the Help Center for more information.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PayoutPolicy;
