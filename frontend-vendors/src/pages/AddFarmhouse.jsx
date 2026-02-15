import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Home, MapPin, List, Image as ImageIcon, DollarSign,
    ChevronRight, ChevronLeft, Upload, X, CheckCircle, Loader2,
    Shield, User, Plus, Calendar, Info, Phone
} from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

const AddFarmhouse = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [showMobileAlert, setShowMobileAlert] = useState(false);

    useEffect(() => {
        const vendorInfo = localStorage.getItem('vendorInfo');
        if (vendorInfo) {
            try {
                const vendor = JSON.parse(vendorInfo);
                if (!vendor.phone) {
                    setShowMobileAlert(true);
                }
            } catch (e) {
                console.error(e);
            }
        }
    }, []);
    const [loading, setLoading] = useState(false);
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [customAmenity, setCustomAmenity] = useState('');
    const [newRule, setNewRule] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        type: 'Farmhouse',
        location: {
            address: '',
            city: '',
            state: '',
            zip: ''
        },
        capacity: {
            guests: 10,
            bedrooms: 3,
            bathrooms: 2
        },
        amenities: [],
        pricing: {
            pricePerNight: '',
            cleaningFee: '',
            securityDeposit: ''
        },
        bookingPolicy: {
            minDuration: 1,
            maxDuration: 30
        },
        caretaker: {
            name: '',
            phone: ''
        },
        rules: []
    });

    const steps = [
        { id: 1, title: 'Basic Info', icon: Home, description: 'Name & Description' },
        { id: 2, title: 'Location', icon: MapPin, description: 'Address & City' },
        { id: 3, title: 'Details', icon: List, description: 'Capacity & Amenities' },
        { id: 4, title: 'Photos', icon: ImageIcon, description: 'Upload Images' },
        { id: 5, title: 'Pricing', icon: DollarSign, description: 'Costs & Policies' },
        { id: 6, title: 'Rules', icon: Shield, description: 'Caretaker & Rules' },
    ];

    const predefinedAmenities = [
        'Swimming Pool', 'WiFi', 'Air Conditioning', 'Kitchen', 'BBQ Grill',
        'Parking', 'Garden', 'Pet Friendly', 'TV', 'Sound System',
        'Power Backup', 'Caretaker', 'Bonfire', 'Gazebo'
    ];

    const handleChange = (e, section = null) => {
        const { name, value } = e.target;
        if (section) {
            setFormData(prev => ({
                ...prev,
                [section]: { ...prev[section], [name]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // --- Amenities Logic ---
    const handleAmenityToggle = (amenity) => {
        setFormData(prev => {
            const newAmenities = prev.amenities.includes(amenity)
                ? prev.amenities.filter(a => a !== amenity)
                : [...prev.amenities, amenity];
            return { ...prev, amenities: newAmenities };
        });
    };

    const addCustomAmenity = () => {
        if (customAmenity.trim() && !formData.amenities.includes(customAmenity.trim())) {
            setFormData(prev => ({
                ...prev,
                amenities: [...prev.amenities, customAmenity.trim()]
            }));
            setCustomAmenity('');
        }
    };

    // --- Rules Logic ---
    const addRule = () => {
        if (newRule.trim()) {
            setFormData(prev => ({
                ...prev,
                rules: [...prev.rules, newRule.trim()]
            }));
            setNewRule('');
        }
    };

    const removeRule = (index) => {
        setFormData(prev => ({
            ...prev,
            rules: prev.rules.filter((_, i) => i !== index)
        }));
    };

    // --- Image Logic ---
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + imageFiles.length > 10) {
            toast.error('You can upload a maximum of 10 images');
            return;
        }

        const newFiles = [...imageFiles, ...files];
        setImageFiles(newFiles);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(prev => [...prev, ...newPreviews]);
    };

    const removeImage = (index) => {
        setImageFiles(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (imageFiles.length === 0) {
            toast.error('Please upload at least one image');
            return;
        }

        setLoading(true);
        const data = new FormData();

        // Append basic fields
        data.append('name', formData.name);
        data.append('description', formData.description);
        data.append('type', formData.type);

        // Append JSON fields
        data.append('location', JSON.stringify(formData.location));
        data.append('capacity', JSON.stringify(formData.capacity));
        data.append('amenities', JSON.stringify(formData.amenities));
        data.append('pricing', JSON.stringify(formData.pricing));
        data.append('bookingPolicy', JSON.stringify(formData.bookingPolicy));
        data.append('caretaker', JSON.stringify(formData.caretaker));
        data.append('rules', JSON.stringify(formData.rules));

        // Append images
        imageFiles.forEach(file => {
            data.append('images', file);
        });

        try {
            const token = localStorage.getItem('vendorToken');
            await axios.post(`${import.meta.env.VITE_API_URL}/api/farmhouses`, data, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            toast.success('Farmhouse listed successfully!');
            navigate('/dashboard/farmhouses');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to create listing');
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 mb-6 flex items-start gap-3">
                            <Info className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-emerald-800">
                                Start by providing the basic details of your property. A catchy name and detailed description help attract more guests.
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Property Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="e.g. Sunset Villa Farmhouse"
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Property Type</label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="input-field"
                            >
                                {['Farmhouse', 'Villa', 'Cottage', 'Bungalow', 'Resort'].map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                            <textarea
                                name="description"
                                rows="6"
                                value={formData.description}
                                onChange={handleChange}
                                className="input-field resize-none"
                                placeholder="Describe your property, its unique features, and what guests can expect..."
                            />
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-6 animate-fadeIn">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Street Address</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.location.address}
                                onChange={(e) => handleChange(e, 'location')}
                                className="input-field"
                                placeholder="e.g. 123 Green Valley Road"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">City</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.location.city}
                                    onChange={(e) => handleChange(e, 'location')}
                                    className="input-field"
                                    placeholder="e.g. Lonavala"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">State</label>
                                <input
                                    type="text"
                                    name="state"
                                    value={formData.location.state}
                                    onChange={(e) => handleChange(e, 'location')}
                                    className="input-field"
                                    placeholder="e.g. Maharashtra"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">ZIP Code</label>
                            <input
                                type="text"
                                name="zip"
                                value={formData.location.zip}
                                onChange={(e) => handleChange(e, 'location')}
                                className="input-field"
                                placeholder="e.g. 410401"
                            />
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-8 animate-fadeIn">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <User className="h-5 w-5 text-emerald-600" />
                                Capacity
                            </h3>
                            <div className="grid grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Max Guests</label>
                                    <input
                                        type="number"
                                        name="guests"
                                        value={formData.capacity.guests}
                                        onChange={(e) => handleChange(e, 'capacity')}
                                        className="input-field"
                                        min="1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Bedrooms</label>
                                    <input
                                        type="number"
                                        name="bedrooms"
                                        value={formData.capacity.bedrooms}
                                        onChange={(e) => handleChange(e, 'capacity')}
                                        className="input-field"
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Bathrooms</label>
                                    <input
                                        type="number"
                                        name="bathrooms"
                                        value={formData.capacity.bathrooms}
                                        onChange={(e) => handleChange(e, 'capacity')}
                                        className="input-field"
                                        min="0"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="border-t border-gray-100 pt-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <List className="h-5 w-5 text-emerald-600" />
                                Amenities
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                                {predefinedAmenities.map(amenity => (
                                    <label key={amenity} className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all ${formData.amenities.includes(amenity)
                                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
                                        : 'border-gray-200 hover:bg-gray-50'
                                        }`}>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={formData.amenities.includes(amenity)}
                                            onChange={() => handleAmenityToggle(amenity)}
                                        />
                                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center mr-3 transition-colors ${formData.amenities.includes(amenity) ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 bg-white'
                                            }`}>
                                            {formData.amenities.includes(amenity) && <CheckCircle className="h-3.5 w-3.5 text-white" />}
                                        </div>
                                        <span className="text-sm font-medium">{amenity}</span>
                                    </label>
                                ))}
                                {formData.amenities.filter(a => !predefinedAmenities.includes(a)).map(amenity => (
                                    <label key={amenity} className="flex items-center p-3 rounded-xl border border-emerald-500 bg-emerald-50 text-emerald-700 cursor-pointer transition-all shadow-sm">
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={true}
                                            onChange={() => handleAmenityToggle(amenity)}
                                        />
                                        <div className="w-5 h-5 rounded-md border bg-emerald-500 border-emerald-500 flex items-center justify-center mr-3">
                                            <CheckCircle className="h-3.5 w-3.5 text-white" />
                                        </div>
                                        <span className="text-sm font-medium">{amenity}</span>
                                    </label>
                                ))}
                            </div>

                            <div className="flex gap-2 max-w-md">
                                <input
                                    type="text"
                                    value={customAmenity}
                                    onChange={(e) => setCustomAmenity(e.target.value)}
                                    placeholder="Add other amenity..."
                                    className="input-field py-2.5"
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomAmenity())}
                                />
                                <button
                                    type="button"
                                    onClick={addCustomAmenity}
                                    className="btn-primary py-2.5 px-4 rounded-xl"
                                >
                                    <Plus className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center hover:bg-gray-50 transition-colors cursor-pointer relative group">
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="flex flex-col items-center pointer-events-none">
                                <div className="bg-emerald-100 p-5 rounded-full mb-4 group-hover:scale-110 transition-transform">
                                    <Upload className="h-8 w-8 text-emerald-600" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Click to upload photos</h3>
                                <p className="text-gray-500 mt-2">SVG, PNG, JPG or GIF (max. 10 photos)</p>
                                <p className="text-xs text-gray-400 mt-1">High quality images increase booking rates!</p>
                            </div>
                        </div>

                        {imagePreviews.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {imagePreviews.map((preview, index) => (
                                    <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                                        <img src={preview} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => removeImage(index)}
                                            className="absolute top-2 right-2 bg-red-500/90 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 transform hover:scale-110 shadow-sm backdrop-blur-sm"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            case 5:
                return (
                    <div className="space-y-8 animate-fadeIn">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-emerald-600" />
                                Pricing
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Price per 24 Hours (₹)</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-400 font-semibold">₹</span>
                                        </div>
                                        <input
                                            type="number"
                                            name="pricePerNight"
                                            value={formData.pricing.pricePerNight}
                                            onChange={(e) => handleChange(e, 'pricing')}
                                            className="input-field !pl-7"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Base price for a full day booking.</p>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Cleaning Fee (₹)</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span className="text-gray-400 font-semibold">₹</span>
                                            </div>
                                            <input
                                                type="number"
                                                name="cleaningFee"
                                                value={formData.pricing.cleaningFee}
                                                onChange={(e) => handleChange(e, 'pricing')}
                                                className="input-field !pl-7"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Security Deposit (₹)</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span className="text-gray-400 font-semibold">₹</span>
                                            </div>
                                            <input
                                                type="number"
                                                name="securityDeposit"
                                                value={formData.pricing.securityDeposit}
                                                onChange={(e) => handleChange(e, 'pricing')}
                                                className="input-field !pl-7"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-emerald-600" />
                                Booking Policy
                            </h3>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Min Duration (Days)</label>
                                    <input
                                        type="number"
                                        name="minDuration"
                                        value={formData.bookingPolicy.minDuration}
                                        onChange={(e) => handleChange(e, 'bookingPolicy')}
                                        className="input-field"
                                        min="1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Max Duration (Days)</label>
                                    <input
                                        type="number"
                                        name="maxDuration"
                                        value={formData.bookingPolicy.maxDuration}
                                        onChange={(e) => handleChange(e, 'bookingPolicy')}
                                        className="input-field"
                                        min="1"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 6:
                return (
                    <div className="space-y-8 animate-fadeIn">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <User className="h-5 w-5 text-emerald-600" />
                                Caretaker Information
                            </h3>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Caretaker Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.caretaker.name}
                                        onChange={(e) => handleChange(e, 'caretaker')}
                                        className="input-field"
                                        placeholder="e.g. Ramu Kaka"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Number</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.caretaker.phone}
                                        onChange={(e) => handleChange(e, 'caretaker')}
                                        className="input-field"
                                        placeholder="+91 98765 43210"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Shield className="h-5 w-5 text-emerald-600" />
                                House Rules
                            </h3>

                            <div className="flex gap-2 mb-4">
                                <input
                                    type="text"
                                    value={newRule}
                                    onChange={(e) => setNewRule(e.target.value)}
                                    placeholder="Add a rule (e.g. No smoking inside)"
                                    className="input-field py-2.5"
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRule())}
                                />
                                <button
                                    type="button"
                                    onClick={addRule}
                                    className="btn-primary py-2.5 px-4 rounded-xl"
                                >
                                    <Plus className="h-5 w-5" />
                                </button>
                            </div>

                            {formData.rules.length === 0 ? (
                                <div className="bg-gray-50 rounded-xl p-6 text-center border border-dashed border-gray-200">
                                    <p className="text-gray-500 text-sm italic">No rules added yet. Add clear rules to set expectations.</p>
                                </div>
                            ) : (
                                <ul className="space-y-3">
                                    {formData.rules.map((rule, index) => (
                                        <li key={index} className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-gray-100 shadow-sm hover:border-emerald-100 transition-colors">
                                            <span className="text-gray-700 font-medium flex items-center gap-2">
                                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                                                {rule}
                                            </span>
                                            <button
                                                onClick={() => removeRule(index)}
                                                className="text-red-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">List Your Property</h1>
                <p className="text-gray-500 mt-2 text-lg">Share your farmhouse with guests and start earning.</p>
            </div>

            {/* Progress Bar */}
            <div className="mb-12">
                <div className="flex items-center justify-between relative max-w-4xl mx-auto">
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-100 -z-10 rounded-full"></div>
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-emerald-500 -z-10 transition-all duration-500 ease-out rounded-full"
                        style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}></div>

                    {steps.map((step) => (
                        <div key={step.id} className="flex flex-col items-center group cursor-default">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 shadow-sm ${step.id <= currentStep
                                ? 'bg-emerald-500 border-emerald-500 text-white shadow-emerald-200'
                                : 'bg-white border-gray-200 text-gray-300'
                                }`}>
                                <step.icon className="h-5 w-5" />
                            </div>
                            <span className={`text-xs font-bold mt-3 uppercase tracking-wider transition-colors duration-300 ${step.id <= currentStep ? 'text-emerald-600' : 'text-gray-400'
                                }`}>
                                {step.title}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Form Content */}
            <div className="bg-white rounded-3xl shadow-xl shadow-gray-100/50 border border-gray-100 p-6 md:p-10 min-h-[500px] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
                {renderStepContent()}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 max-w-5xl mx-auto">
                <button
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className={`flex items-center px-6 py-3.5 rounded-xl font-semibold transition-all ${currentStep === 1
                        ? 'text-gray-300 cursor-not-allowed opacity-0'
                        : 'text-gray-600 hover:bg-white hover:shadow-md hover:text-gray-900 bg-gray-50 border border-transparent hover:border-gray-100'
                        }`}
                >
                    <ChevronLeft className="h-5 w-5 mr-2" />
                    Back
                </button>

                {currentStep < steps.length ? (
                    <button
                        onClick={nextStep}
                        className="bg-gray-900 text-white hover:bg-gray-800 px-8 py-3.5 rounded-xl font-semibold shadow-lg shadow-gray-200 flex items-center transition-all transform hover:-translate-y-0.5"
                    >
                        Next Step
                        <ChevronRight className="h-5 w-5 ml-2" />
                    </button>
                ) : (
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-emerald-600 text-white hover:bg-emerald-700 px-10 py-3.5 rounded-xl font-semibold shadow-lg shadow-emerald-200 flex items-center transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <CheckCircle className="h-5 w-5 mr-2" />}
                        Submit Listing
                    </button>
                )}
            </div>

            {showMobileAlert && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center animate-fadeIn">
                        <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Phone className="h-8 w-8 text-rose-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Mobile Number Required</h2>
                        <p className="text-gray-600 mb-8">
                            To ensure secure communication and verify your identity, please add a mobile number to your profile before listing a property.
                        </p>
                        <button
                            onClick={() => navigate('/dashboard/profile')}
                            className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
                        >
                            Go to Profile Settings
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddFarmhouse;
