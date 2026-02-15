import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Home, MapPin, List, Image as ImageIcon, DollarSign,
    Save, Loader2, Calendar as CalendarIcon, Plus, X, Upload,
    Shield, User
} from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const EditFarmhouse = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('basic');
    const [customAmenity, setCustomAmenity] = useState('');
    const [newRule, setNewRule] = useState('');

    // Separate state for new image files to upload
    const [newImageFiles, setNewImageFiles] = useState([]);
    const [newImagePreviews, setNewImagePreviews] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        type: 'Farmhouse',
        location: { address: '', city: '', state: '', zip: '' },
        capacity: { guests: 0, bedrooms: 0, bathrooms: 0 },
        amenities: [],
        images: [],
        pricing: { pricePerNight: 0, cleaningFee: 0, securityDeposit: 0 },
        bookingPolicy: { minDuration: 1, maxDuration: 30 },
        caretaker: { name: '', phone: '' },
        rules: [],
        isActive: true,
        unavailableDates: []
    });

    useEffect(() => {
        fetchFarmhouse();
    }, [id]);

    const fetchFarmhouse = async () => {
        try {
            const token = localStorage.getItem('vendorToken');
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/farmhouses/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = res.data;
            if (data.unavailableDates) {
                data.unavailableDates = data.unavailableDates.map(date => new Date(date));
            } else {
                data.unavailableDates = [];
            }

            // Ensure new fields exist if fetching old records
            if (!data.bookingPolicy) data.bookingPolicy = { minDuration: 1, maxDuration: 30 };
            if (!data.caretaker) data.caretaker = { name: '', phone: '' };
            if (!data.rules) data.rules = [];

            setFormData(data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch farmhouse details');
            navigate('/dashboard/farmhouses');
        } finally {
            setLoading(false);
        }
    };

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

    // --- Date Logic ---
    const toggleDate = (date) => {
        const dateStr = date.toDateString();
        const exists = formData.unavailableDates.some(d => d.toDateString() === dateStr);

        let newDates;
        if (exists) {
            newDates = formData.unavailableDates.filter(d => d.toDateString() !== dateStr);
        } else {
            newDates = [...formData.unavailableDates, date];
        }
        setFormData(prev => ({ ...prev, unavailableDates: newDates }));
    };

    // --- Image Logic ---
    const handleNewImageChange = (e) => {
        const files = Array.from(e.target.files);
        const totalImages = formData.images.length + newImageFiles.length + files.length;

        if (totalImages > 10) {
            toast.error('You can have a maximum of 10 images total.');
            return;
        }

        const newFiles = [...newImageFiles, ...files];
        setNewImageFiles(newFiles);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setNewImagePreviews(prev => [...prev, ...newPreviews]);
    };

    const removeExistingImage = (indexToRemove) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, index) => index !== indexToRemove)
        }));
    };

    const removeNewImage = (indexToRemove) => {
        setNewImageFiles(prev => prev.filter((_, index) => index !== indexToRemove));
        setNewImagePreviews(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    // --- Submit Logic ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const token = localStorage.getItem('vendorToken');
            const submitData = new FormData();

            submitData.append('name', formData.name);
            submitData.append('description', formData.description);
            submitData.append('type', formData.type);
            submitData.append('isActive', formData.isActive);

            submitData.append('location', JSON.stringify(formData.location));
            submitData.append('capacity', JSON.stringify(formData.capacity));
            submitData.append('amenities', JSON.stringify(formData.amenities));
            submitData.append('pricing', JSON.stringify(formData.pricing));
            submitData.append('bookingPolicy', JSON.stringify(formData.bookingPolicy));
            submitData.append('caretaker', JSON.stringify(formData.caretaker));
            submitData.append('rules', JSON.stringify(formData.rules));
            submitData.append('unavailableDates', JSON.stringify(formData.unavailableDates));
            submitData.append('existingImages', JSON.stringify(formData.images));

            newImageFiles.forEach(file => {
                submitData.append('images', file);
            });

            await axios.put(`${import.meta.env.VITE_API_URL}/api/farmhouses/${id}`, submitData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            toast.success('Farmhouse updated successfully!');
            setNewImageFiles([]);
            setNewImagePreviews([]);
            fetchFarmhouse();
        } catch (error) {
            console.error(error);
            toast.error('Failed to update farmhouse');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-96"><Loader2 className="animate-spin h-8 w-8 text-emerald-600" /></div>;

    const tabs = [
        { id: 'basic', label: 'Basic Info', icon: Home },
        { id: 'location', label: 'Location', icon: MapPin },
        { id: 'details', label: 'Details', icon: List },
        { id: 'photos', label: 'Photos', icon: ImageIcon },
        { id: 'pricing', label: 'Pricing & Policy', icon: DollarSign },
        { id: 'rules', label: 'Rules & Caretaker', icon: Shield },
        { id: 'availability', label: 'Availability', icon: CalendarIcon },
    ];

    const predefinedAmenities = [
        'Swimming Pool', 'WiFi', 'Air Conditioning', 'Kitchen', 'BBQ Grill',
        'Parking', 'Garden', 'Pet Friendly', 'TV', 'Sound System',
        'Power Backup', 'Caretaker', 'Bonfire', 'Gazebo'
    ];

    return (
        <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Edit Farmhouse</h1>
                    <p className="text-gray-500 mt-1">{formData.name}</p>
                </div>
                <div className="flex space-x-3">
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard/farmhouses')}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="btn-primary flex items-center"
                    >
                        {saving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                        Save Changes
                    </button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Tabs */}
                <div className="w-full lg:w-64 flex-shrink-0">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <nav className="flex flex-col p-2">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <tab.icon className={`h-5 w-5 mr-3 ${activeTab === tab.id ? 'text-emerald-600' : 'text-gray-400'}`} />
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Status Toggle */}
                    <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">Listing Status</h3>
                        <div className="flex items-center justify-between">
                            <span className={`text-sm ${formData.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                                {formData.isActive ? 'Active' : 'Paused'}
                            </span>
                            <button
                                onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${formData.isActive ? 'bg-emerald-600' : 'bg-gray-200'
                                    }`}
                            >
                                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData.isActive ? 'translate-x-5' : 'translate-x-0'
                                    }`} />
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Paused listings won't appear in search results.
                        </p>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    {activeTab === 'basic' && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Property Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="input-field"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    name="description"
                                    rows="5"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="input-field"
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'location' && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.location.address}
                                    onChange={(e) => handleChange(e, 'location')}
                                    className="input-field"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.location.city}
                                        onChange={(e) => handleChange(e, 'location')}
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={formData.location.state}
                                        onChange={(e) => handleChange(e, 'location')}
                                        className="input-field"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                                <input
                                    type="text"
                                    name="zip"
                                    value={formData.location.zip}
                                    onChange={(e) => handleChange(e, 'location')}
                                    className="input-field"
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'details' && (
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Capacity</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Guests</label>
                                        <input
                                            type="number"
                                            name="guests"
                                            value={formData.capacity.guests}
                                            onChange={(e) => handleChange(e, 'capacity')}
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                                        <input
                                            type="number"
                                            name="bedrooms"
                                            value={formData.capacity.bedrooms}
                                            onChange={(e) => handleChange(e, 'capacity')}
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                                        <input
                                            type="number"
                                            name="bathrooms"
                                            value={formData.capacity.bathrooms}
                                            onChange={(e) => handleChange(e, 'capacity')}
                                            className="input-field"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Amenities</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                                    {predefinedAmenities.map(amenity => (
                                        <label key={amenity} className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${formData.amenities.includes(amenity)
                                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                            : 'border-gray-200 hover:bg-gray-50'
                                            }`}>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={formData.amenities.includes(amenity)}
                                                onChange={() => handleAmenityToggle(amenity)}
                                            />
                                            <div className={`w-4 h-4 rounded border flex items-center justify-center mr-3 ${formData.amenities.includes(amenity) ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'
                                                }`}>
                                                {formData.amenities.includes(amenity) && <div className="h-2 w-2 bg-white rounded-sm" />}
                                            </div>
                                            <span className="text-sm font-medium">{amenity}</span>
                                        </label>
                                    ))}
                                    {formData.amenities.filter(a => !predefinedAmenities.includes(a)).map(amenity => (
                                        <label key={amenity} className="flex items-center p-3 rounded-lg border border-emerald-500 bg-emerald-50 text-emerald-700 cursor-pointer transition-all">
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={true}
                                                onChange={() => handleAmenityToggle(amenity)}
                                            />
                                            <div className="w-4 h-4 rounded border bg-emerald-500 border-emerald-500 flex items-center justify-center mr-3">
                                                <div className="h-2 w-2 bg-white rounded-sm" />
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
                                        className="input-field py-2"
                                    />
                                    <button
                                        type="button"
                                        onClick={addCustomAmenity}
                                        className="btn-primary py-2 px-4"
                                    >
                                        <Plus className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'photos' && (
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Existing Photos</h3>
                                {formData.images.length === 0 ? (
                                    <p className="text-gray-500 text-sm italic">No photos uploaded.</p>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {formData.images.map((img, idx) => (
                                            <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                                                <img src={img} alt={`Existing ${idx}`} className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeExistingImage(idx)}
                                                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                                    title="Delete Image"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Photos</h3>
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleNewImageChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div className="flex flex-col items-center">
                                        <div className="bg-emerald-100 p-4 rounded-full mb-4">
                                            <Upload className="h-8 w-8 text-emerald-600" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900">Click to upload new photos</h3>
                                        <p className="text-gray-500 mt-1">SVG, PNG, JPG or GIF (max. 10 total)</p>
                                    </div>
                                </div>

                                {newImagePreviews.length > 0 && (
                                    <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {newImagePreviews.map((preview, index) => (
                                            <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                                                <img src={preview} alt={`New Preview ${index}`} className="w-full h-full object-cover" />
                                                <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-md shadow-sm">New</div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeNewImage(index)}
                                                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'pricing' && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price per 24 Hours (₹)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-400 font-semibold">₹</span>
                                    </div>
                                    <input
                                        type="number"
                                        name="pricePerNight"
                                        value={formData.pricing.pricePerNight}
                                        onChange={(e) => handleChange(e, 'pricing')}
                                        className="input-field !pl-10"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Customers book for a minimum of 24 hours.</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cleaning Fee (₹)</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-400 font-semibold">₹</span>
                                        </div>
                                        <input
                                            type="number"
                                            name="cleaningFee"
                                            value={formData.pricing.cleaningFee}
                                            onChange={(e) => handleChange(e, 'pricing')}
                                            className="input-field !pl-10"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Security Deposit (₹)</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-400 font-semibold">₹</span>
                                        </div>
                                        <input
                                            type="number"
                                            name="securityDeposit"
                                            value={formData.pricing.securityDeposit}
                                            onChange={(e) => handleChange(e, 'pricing')}
                                            className="input-field !pl-10"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-6 mt-2">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Booking Policy</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Min Duration (Days)</label>
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
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Duration (Days)</label>
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
                    )}

                    {activeTab === 'rules' && (
                        <div className="space-y-8">
                            {/* Caretaker Info */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                    <User className="h-5 w-5 mr-2 text-emerald-600" />
                                    Caretaker Information
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Caretaker Name</label>
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
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
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

                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                    <Shield className="h-5 w-5 mr-2 text-emerald-600" />
                                    House Rules
                                </h3>

                                <div className="flex gap-2 mb-4">
                                    <input
                                        type="text"
                                        value={newRule}
                                        onChange={(e) => setNewRule(e.target.value)}
                                        placeholder="Add a rule (e.g. No smoking inside)"
                                        className="input-field py-2"
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRule())}
                                    />
                                    <button
                                        type="button"
                                        onClick={addRule}
                                        className="btn-primary py-2 px-4"
                                    >
                                        <Plus className="h-5 w-5" />
                                    </button>
                                </div>

                                {formData.rules.length === 0 ? (
                                    <p className="text-gray-500 text-sm italic">No rules added yet.</p>
                                ) : (
                                    <ul className="space-y-2">
                                        {formData.rules.map((rule, index) => (
                                            <li key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                                                <span className="text-gray-700">{rule}</span>
                                                <button
                                                    onClick={() => removeRule(index)}
                                                    className="text-red-500 hover:text-red-700 p-1"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'availability' && (
                        <div className="space-y-6">
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                                <h4 className="text-sm font-bold text-blue-800 mb-1">Manage Availability</h4>
                                <p className="text-sm text-blue-600">
                                    Select dates to mark them as unavailable for booking. Click a date to toggle its status.
                                </p>
                            </div>

                            <div className="flex justify-center">
                                <DatePicker
                                    inline
                                    selected={null}
                                    onChange={toggleDate}
                                    dayClassName={(date) =>
                                        formData.unavailableDates.some(d => d.toDateString() === date.toDateString())
                                            ? "react-datepicker__day--highlighted-custom"
                                            : undefined
                                    }
                                    minDate={new Date()}
                                    monthsShown={2}
                                />
                                <style>{`
                                    .react-datepicker__day--highlighted-custom {
                                        background-color: #ef4444 !important;
                                        color: white !important;
                                        border-radius: 50% !important;
                                    }
                                    .react-datepicker__day--highlighted-custom:hover {
                                        background-color: #dc2626 !important;
                                    }
                                `}</style>
                            </div>

                            <div className="mt-4">
                                <h4 className="font-medium text-gray-900 mb-2">Unavailable Dates:</h4>
                                {formData.unavailableDates.length === 0 ? (
                                    <p className="text-sm text-gray-500">No dates marked as unavailable.</p>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {formData.unavailableDates.sort((a, b) => a - b).map((date, idx) => (
                                            <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                {date.toLocaleDateString()}
                                                <button
                                                    onClick={() => toggleDate(date)}
                                                    className="ml-1.5 text-red-600 hover:text-red-800 focus:outline-none"
                                                >
                                                    &times;
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EditFarmhouse;
