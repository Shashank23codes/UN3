import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

const PrivacyPolicy = () => {
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
                        <Shield className="h-8 w-8 text-emerald-600" />
                        <h1 className="text-4xl font-bold text-gray-900">Privacy Policy</h1>
                    </div>

                    <p className="text-gray-500 mb-8">Last updated: January 29, 2025</p>

                    <div className="prose prose-emerald max-w-none">
                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
                            <p className="text-gray-700 mb-4">
                                UtsavNest ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Platform.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>

                            <h3 className="text-xl font-semibold text-gray-800 mb-3">2.1 Information You Provide</h3>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                                <li><strong>Account Information:</strong> Name, email address, phone number, password</li>
                                <li><strong>Profile Information:</strong> Profile picture, bio, preferences</li>
                                <li><strong>Booking Information:</strong> Guest details, special requests, payment information</li>
                                <li><strong>Vendor Information:</strong> Business details, KYC documents, bank account information</li>
                                <li><strong>Communications:</strong> Messages, reviews, support tickets</li>
                            </ul>

                            <h3 className="text-xl font-semibold text-gray-800 mb-3">2.2 Information Collected Automatically</h3>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                                <li><strong>Device Information:</strong> IP address, browser type, operating system</li>
                                <li><strong>Usage Data:</strong> Pages visited, time spent, click patterns</li>
                                <li><strong>Location Data:</strong> Approximate location based on IP address</li>
                                <li><strong>Cookies:</strong> Session cookies, preference cookies, analytics cookies</li>
                            </ul>

                            <h3 className="text-xl font-semibold text-gray-800 mb-3">2.3 Information from Third Parties</h3>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                <li>Google OAuth login information</li>
                                <li>Payment processor (Razorpay) transaction data</li>
                                <li>Analytics providers</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
                            <p className="text-gray-700 mb-4">We use your information to:</p>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                <li>Provide, maintain, and improve our services</li>
                                <li>Process bookings and payments</li>
                                <li>Communicate with you about your account and bookings</li>
                                <li>Send notifications, updates, and marketing communications</li>
                                <li>Verify identity and prevent fraud</li>
                                <li>Comply with legal obligations</li>
                                <li>Analyze usage patterns and improve user experience</li>
                                <li>Resolve disputes and enforce our Terms</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Information Sharing and Disclosure</h2>

                            <h3 className="text-xl font-semibold text-gray-800 mb-3">4.1 With Other Users</h3>
                            <p className="text-gray-700 mb-4">
                                When you make a booking, we share necessary information (name, phone number, email) with the Vendor to facilitate your stay.
                            </p>

                            <h3 className="text-xl font-semibold text-gray-800 mb-3">4.2 With Service Providers</h3>
                            <p className="text-gray-700 mb-4">We share information with:</p>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                                <li>Payment processors (Razorpay)</li>
                                <li>Cloud storage providers (Cloudinary)</li>
                                <li>Email service providers</li>
                                <li>Analytics providers</li>
                                <li>Customer support tools</li>
                            </ul>

                            <h3 className="text-xl font-semibold text-gray-800 mb-3">4.3 For Legal Reasons</h3>
                            <p className="text-gray-700 mb-4">
                                We may disclose your information if required by law, court order, or government request, or to protect our rights, property, or safety.
                            </p>

                            <h3 className="text-xl font-semibold text-gray-800 mb-3">4.4 Business Transfers</h3>
                            <p className="text-gray-700 mb-4">
                                In the event of a merger, acquisition, or sale of assets, your information may be transferred to the new entity.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Security</h2>
                            <p className="text-gray-700 mb-4">
                                We implement appropriate technical and organizational measures to protect your information:
                            </p>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                <li>Encryption of data in transit (HTTPS/TLS)</li>
                                <li>Secure password hashing (bcrypt)</li>
                                <li>Regular security audits</li>
                                <li>Access controls and authentication</li>
                                <li>Secure payment processing through PCI-compliant providers</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Your Rights and Choices</h2>

                            <h3 className="text-xl font-semibold text-gray-800 mb-3">6.1 Access and Update</h3>
                            <p className="text-gray-700 mb-4">
                                You can access and update your account information at any time through your profile settings.
                            </p>

                            <h3 className="text-xl font-semibold text-gray-800 mb-3">6.2 Delete Account</h3>
                            <p className="text-gray-700 mb-4">
                                You can request account deletion by contacting our support team. Some information may be retained for legal or legitimate business purposes.
                            </p>

                            <h3 className="text-xl font-semibold text-gray-800 mb-3">6.3 Marketing Communications</h3>
                            <p className="text-gray-700 mb-4">
                                You can opt out of marketing emails by clicking the unsubscribe link or updating your notification preferences.
                            </p>

                            <h3 className="text-xl font-semibold text-gray-800 mb-3">6.4 Cookies</h3>
                            <p className="text-gray-700 mb-4">
                                You can control cookies through your browser settings. Note that disabling cookies may affect Platform functionality.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Data Retention</h2>
                            <p className="text-gray-700 mb-4">
                                We retain your information for as long as necessary to:
                            </p>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                <li>Provide our services</li>
                                <li>Comply with legal obligations</li>
                                <li>Resolve disputes</li>
                                <li>Enforce our agreements</li>
                            </ul>
                            <p className="text-gray-700 mt-4">
                                After account deletion, we may retain certain information for up to 7 years for tax and accounting purposes.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Children's Privacy</h2>
                            <p className="text-gray-700 mb-4">
                                Our Platform is not intended for users under 18 years of age. We do not knowingly collect information from children. If you believe we have collected information from a child, please contact us immediately.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. International Data Transfers</h2>
                            <p className="text-gray-700 mb-4">
                                Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place for such transfers.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Third-Party Links</h2>
                            <p className="text-gray-700 mb-4">
                                Our Platform may contain links to third-party websites. We are not responsible for the privacy practices of these websites. We encourage you to read their privacy policies.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Changes to Privacy Policy</h2>
                            <p className="text-gray-700 mb-4">
                                We may update this Privacy Policy from time to time. We will notify you of significant changes via email or Platform notification. The "Last updated" date at the top indicates when the policy was last revised.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contact Us</h2>
                            <p className="text-gray-700 mb-2">
                                If you have questions about this Privacy Policy or our data practices, please contact us at:
                            </p>
                            <ul className="list-none text-gray-700 space-y-1">
                                <li>Email: privacy@utsavnest.com</li>
                                <li>Phone: +91-XXXXXXXXXX</li>
                                <li>Address: [Your Company Address]</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Compliance</h2>
                            <p className="text-gray-700 mb-4">
                                We comply with applicable data protection laws, including the Information Technology Act, 2000 and the Personal Data Protection Bill (when enacted).
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
