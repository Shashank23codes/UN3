import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, HelpCircle } from 'lucide-react';

const FAQ = () => {
    const faqs = [
        {
            category: "Booking & Payments",
            questions: [
                {
                    q: "How do I book a property?",
                    a: "Simply browse our properties, select your dates, and click 'Book Now'. You'll need to create an account and pay the advance amount to confirm your booking."
                },
                {
                    q: "What payment methods do you accept?",
                    a: "We accept all major credit/debit cards, UPI, net banking, and digital wallets through our secure Razorpay payment gateway."
                },
                {
                    q: "When do I pay the remaining amount?",
                    a: "The remaining balance is typically paid directly to the property owner during check-in or as per the property's payment policy."
                },
                {
                    q: "Is my payment information secure?",
                    a: "Yes, all payments are processed through Razorpay, which uses industry-standard encryption to protect your financial information."
                }
            ]
        },
        {
            category: "Cancellations & Refunds",
            questions: [
                {
                    q: "What is your cancellation policy?",
                    a: "Cancellation policies vary by property. Please review the specific cancellation policy on the property listing page before booking."
                },
                {
                    q: "How do I cancel my booking?",
                    a: "Go to 'My Trips', select the booking you want to cancel, and click 'Cancel Booking'. Follow the prompts to complete the cancellation."
                },
                {
                    q: "When will I receive my refund?",
                    a: "Refunds are processed within 5-7 business days according to the property's cancellation policy. The amount depends on when you cancel."
                },
                {
                    q: "Can I modify my booking dates?",
                    a: "Yes, subject to availability. Contact the property owner through our messaging system to request date changes."
                }
            ]
        },
        {
            category: "Property & Amenities",
            questions: [
                {
                    q: "Are the photos on the listing accurate?",
                    a: "All property owners are required to upload genuine photos. If you find any discrepancy, please report it immediately."
                },
                {
                    q: "Can I visit the property before booking?",
                    a: "Most properties allow site visits. Contact the owner through our platform to schedule a visit."
                },
                {
                    q: "What if the property doesn't match the listing?",
                    a: "Contact us immediately if the property doesn't match the listing. We'll work to resolve the issue or help you find an alternative."
                },
                {
                    q: "Are pets allowed?",
                    a: "Pet policies vary by property. Check the property details or contact the owner to confirm pet-friendliness."
                }
            ]
        },
        {
            category: "For Hosts",
            questions: [
                {
                    q: "How do I list my property?",
                    a: "Visit our vendor portal, create an account, complete KYC verification, and fill in your property details with photos."
                },
                {
                    q: "What commission does UtsavNest charge?",
                    a: "We charge a small commission on each booking. The exact percentage is discussed during the onboarding process."
                },
                {
                    q: "When do I receive payment from bookings?",
                    a: "Payments are transferred to your account after the guest checks in, minus our service fee."
                },
                {
                    q: "Can I set my own pricing?",
                    a: "Yes, you have full control over your property's pricing, including seasonal rates and special offers."
                }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-rose-50 to-pink-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <Link to="/" className="inline-flex items-center text-gray-600 hover:text-rose-600 mb-8 transition-colors">
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Back to Home
                    </Link>
                    <div className="flex items-center mb-6">
                        <HelpCircle className="h-12 w-12 text-rose-600 mr-4" />
                        <h1 className="text-5xl font-bold text-gray-900">Frequently Asked Questions</h1>
                    </div>
                    <p className="text-xl text-gray-600 max-w-2xl">
                        Find answers to common questions about booking, payments, and more.
                    </p>
                </div>
            </div>

            {/* FAQ Content */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {faqs.map((category, idx) => (
                    <div key={idx} className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-rose-200">
                            {category.category}
                        </h2>
                        <div className="space-y-6">
                            {category.questions.map((item, qIdx) => (
                                <div key={qIdx} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">{item.q}</h3>
                                    <p className="text-gray-600 leading-relaxed">{item.a}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Still Have Questions */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold mb-4">Still Have Questions?</h2>
                    <p className="text-gray-300 text-lg mb-8">
                        Our support team is here to help you 24/7
                    </p>
                    <Link
                        to="/contact"
                        className="inline-block bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold py-3.5 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                        Contact Support
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default FAQ;
