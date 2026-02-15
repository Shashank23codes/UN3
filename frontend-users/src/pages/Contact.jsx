import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, MapPin, Send, Clock } from 'lucide-react';
import { toast } from 'react-toastify';

const Contact = () => {
    const [formData, setFormData] = React.useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Add API call here
        toast.success('Thank you! We\'ll get back to you soon.');
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-rose-50 to-pink-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <Link to="/" className="inline-flex items-center text-gray-600 hover:text-rose-600 mb-8 transition-colors">
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Back to Home
                    </Link>
                    <h1 className="text-5xl font-bold text-gray-900 mb-6">Get in Touch</h1>
                    <p className="text-xl text-gray-600 max-w-2xl">
                        Have questions? We're here to help. Reach out to us anytime!
                    </p>
                </div>
            </div>

            {/* Contact Form & Info */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid md:grid-cols-5 gap-12">
                    {/* Contact Info */}
                    <div className="md:col-span-2 space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
                            <div className="space-y-6">
                                <div className="flex items-start space-x-4">
                                    <div className="bg-rose-100 p-3 rounded-lg">
                                        <MapPin className="h-6 w-6 text-rose-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1">Address</h3>
                                        <p className="text-gray-600">123 Event Avenue<br />Mumbai, Maharashtra 400001<br />India</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-4">
                                    <div className="bg-rose-100 p-3 rounded-lg">
                                        <Phone className="h-6 w-6 text-rose-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1">Phone</h3>
                                        <p className="text-gray-600">+91 123 456 7890<br />Mon-Sat, 9AM - 6PM</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-4">
                                    <div className="bg-rose-100 p-3 rounded-lg">
                                        <Mail className="h-6 w-6 text-rose-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                                        <p className="text-gray-600">support@utsavnest.com<br />help@utsavnest.com</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-4">
                                    <div className="bg-rose-100 p-3 rounded-lg">
                                        <Clock className="h-6 w-6 text-rose-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1">Business Hours</h3>
                                        <p className="text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM<br />Saturday: 10:00 AM - 4:00 PM<br />Sunday: Closed</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="md:col-span-3">
                        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Your Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
                                            placeholder="you@example.com"
                                        />
                                    </div>
                                </div>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
                                            placeholder="+91 123 456 7890"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                                        <input
                                            type="text"
                                            name="subject"
                                            required
                                            value={formData.subject}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
                                            placeholder="How can we help?"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                                    <textarea
                                        name="message"
                                        required
                                        rows="5"
                                        value={formData.message}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all resize-none"
                                        placeholder="Tell us more about your inquiry..."
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
                                >
                                    <Send className="h-5 w-5 mr-2" />
                                    Send Message
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
