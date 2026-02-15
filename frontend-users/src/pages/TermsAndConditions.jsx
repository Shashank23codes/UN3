import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

const TermsAndConditions = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4">
                <Link
                    to="/"
                    className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-medium mb-8"
                >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Back to Home
                </Link>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 md:p-12">
                    <div className="flex items-center gap-3 mb-6">
                        <FileText className="h-8 w-8 text-emerald-600" />
                        <h1 className="text-4xl font-bold text-gray-900">Terms and Conditions</h1>
                    </div>

                    <p className="text-gray-500 mb-8">Last updated: January 29, 2025</p>

                    <div className="prose prose-emerald max-w-none">
                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
                            <p className="text-gray-700 mb-4">
                                Welcome to UtsavNest ("we," "our," or "us"). These Terms and Conditions govern your use of our website and services. By accessing or using UtsavNest, you agree to be bound by these terms.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Definitions</h2>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                <li><strong>"Platform"</strong> refers to the UtsavNest website and mobile applications</li>
                                <li><strong>"User"</strong> refers to anyone who accesses or uses our Platform</li>
                                <li><strong>"Vendor"</strong> refers to property owners listing their farmhouses</li>
                                <li><strong>"Guest"</strong> refers to users booking accommodations</li>
                                <li><strong>"Booking"</strong> refers to a reservation made through our Platform</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">3.1 Registration</h3>
                            <p className="text-gray-700 mb-4">
                                To use certain features, you must create an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.
                            </p>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">3.2 Account Security</h3>
                            <p className="text-gray-700 mb-4">
                                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Bookings and Payments</h2>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">4.1 Booking Process</h3>
                            <p className="text-gray-700 mb-4">
                                When you make a booking, you enter into a contract with the Vendor. UtsavNest acts as a facilitator and is not a party to the rental agreement between you and the Vendor.
                            </p>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">4.2 Payment Terms</h3>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                                <li>30% advance payment is required at the time of booking</li>
                                <li>Remaining 70% is payable directly to the Vendor at the property</li>
                                <li>All payments are processed securely through Razorpay</li>
                                <li>Prices are in Indian Rupees (INR) unless otherwise stated</li>
                            </ul>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">4.3 Service Fees</h3>
                            <p className="text-gray-700 mb-4">
                                UtsavNest charges a service fee for facilitating bookings. This fee is included in the total booking price and is non-refundable.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Cancellation and Refunds</h2>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">5.1 Cancellation Policy</h3>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                                <li>Cancellations made 48+ hours before check-in: 100% refund of advance payment</li>
                                <li>Cancellations made between 24-48 hours of check-in: 30% refund of advance payment</li>
                                <li>Cancellations made less than 24 hours before check-in: No refund</li>
                                <li>No-shows: No refund</li>
                            </ul>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">5.2 Refund Processing</h3>
                            <p className="text-gray-700 mb-4">
                                Approved refunds will be processed within 7-10 business days to the original payment method.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Vendor Responsibilities</h2>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                <li>Provide accurate and up-to-date property information</li>
                                <li>Maintain property standards as advertised</li>
                                <li>Honor confirmed bookings</li>
                                <li>Comply with all applicable laws and regulations</li>
                                <li>Complete KYC verification process</li>
                                <li>Respond to booking requests within 24 hours</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Guest Responsibilities</h2>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                <li>Provide accurate booking information</li>
                                <li>Respect property rules and local regulations</li>
                                <li>Leave the property in good condition</li>
                                <li>Report any issues or damages immediately</li>
                                <li>Adhere to maximum guest capacity</li>
                                <li>Complete payment as per agreed terms</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Prohibited Activities</h2>
                            <p className="text-gray-700 mb-4">You agree not to:</p>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                <li>Use the Platform for any illegal purpose</li>
                                <li>Post false, misleading, or fraudulent content</li>
                                <li>Harass, abuse, or harm other users</li>
                                <li>Attempt to circumvent the Platform to avoid fees</li>
                                <li>Scrape or copy content without permission</li>
                                <li>Interfere with the Platform's operation</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Intellectual Property</h2>
                            <p className="text-gray-700 mb-4">
                                All content on the Platform, including text, graphics, logos, and software, is the property of UtsavNest or its licensors and is protected by copyright, trademark, and other intellectual property laws.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Limitation of Liability</h2>
                            <p className="text-gray-700 mb-4">
                                UtsavNest acts as an intermediary platform. We are not responsible for:
                            </p>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                <li>The condition, safety, or legality of properties listed</li>
                                <li>The accuracy of property descriptions</li>
                                <li>The performance or conduct of Vendors or Guests</li>
                                <li>Any disputes between Vendors and Guests</li>
                                <li>Loss or damage to personal property</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Dispute Resolution</h2>
                            <p className="text-gray-700 mb-4">
                                Any disputes arising from these Terms shall be resolved through binding arbitration in accordance with Indian law. The venue for arbitration shall be Mumbai, India.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Changes to Terms</h2>
                            <p className="text-gray-700 mb-4">
                                We reserve the right to modify these Terms at any time. We will notify users of significant changes via email or Platform notification. Continued use of the Platform after changes constitutes acceptance of the new Terms.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contact Information</h2>
                            <p className="text-gray-700 mb-2">
                                For questions about these Terms, please contact us at:
                            </p>
                            <ul className="list-none text-gray-700 space-y-1">
                                <li>Email: legal@utsavnest.com</li>
                                <li>Phone: +91-XXXXXXXXXX</li>
                                <li>Address: [Your Company Address]</li>
                            </ul>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsAndConditions;
