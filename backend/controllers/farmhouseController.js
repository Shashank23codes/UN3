const Farmhouse = require('../models/Farmhouse');
const Vendor = require('../models/Vendor');
const jwt = require('jsonwebtoken');

// @desc    Create a new farmhouse
// @route   POST /api/farmhouses
// @access  Private (Vendor only)
const createFarmhouse = async (req, res) => {
    try {
        const {
            name,
            description,
            type,
            location,
            amenities,
            pricing,
            capacity,
            rules,
            bookingPolicy,
            caretaker
        } = req.body;

        let images = [];
        if (req.files && req.files.length > 0) {
            images = req.files.map(file => file.path);
        } else if (req.body.images) {
            images = req.body.images;
        }

        if (images.length === 0) {
            return res.status(400).json({ message: 'Please upload at least one image' });
        }

        const farmhouse = await Farmhouse.create({
            vendor: req.vendor.id,
            name,
            description,
            type,
            location: typeof location === 'string' ? JSON.parse(location) : location,
            amenities: typeof amenities === 'string' ? JSON.parse(amenities) : amenities,
            images,
            pricing: typeof pricing === 'string' ? JSON.parse(pricing) : pricing,
            capacity: typeof capacity === 'string' ? JSON.parse(capacity) : capacity,
            rules: typeof rules === 'string' ? JSON.parse(rules) : rules,
            bookingPolicy: typeof bookingPolicy === 'string' ? JSON.parse(bookingPolicy) : bookingPolicy,
            caretaker: typeof caretaker === 'string' ? JSON.parse(caretaker) : caretaker
        });

        res.status(201).json(farmhouse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all farmhouses for logged in vendor
// @route   GET /api/farmhouses/my-farmhouses
// @access  Private (Vendor only)
const getMyFarmhouses = async (req, res) => {
    try {
        const farmhouses = await Farmhouse.find({ vendor: req.vendor.id }).sort({ createdAt: -1 });
        res.json(farmhouses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get single farmhouse
// @route   GET /api/farmhouses/:id
// @access  Public
const getFarmhouse = async (req, res) => {
    try {
        const farmhouse = await Farmhouse.findById(req.params.id).populate('vendor', 'name email profileImage phone about isVerified razorpayLinkedAccount');

        if (!farmhouse) {
            return res.status(404).json({ message: 'Farmhouse not found' });
        }

        // Check if vendor is verified by admin
        if (!farmhouse.vendor.isVerified) {
            let isOwner = false;
            // Check if the requester is the owner (Vendor)
            if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
                try {
                    const token = req.headers.authorization.split(' ')[1];
                    const decoded = jwt.verify(token, process.env.JWT_SECRET);
                    // farmhouse.vendor is populated, so check _id
                    if (decoded.id && decoded.id === farmhouse.vendor._id.toString()) {
                        isOwner = true;
                    }
                } catch (err) {
                    // Ignore token errors here, just treat as not owner
                }
            }

            if (!isOwner) {
                return res.status(404).json({ message: 'Farmhouse not available' });
            }
        }

        res.json(farmhouse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update farmhouse
// @route   PUT /api/farmhouses/:id
// @access  Private (Vendor only)
const updateFarmhouse = async (req, res) => {
    try {
        let farmhouse = await Farmhouse.findById(req.params.id);

        if (!farmhouse) {
            return res.status(404).json({ message: 'Farmhouse not found' });
        }

        if (farmhouse.vendor.toString() !== req.vendor.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const {
            name, description, type, location, amenities, pricing, capacity, rules, isActive, unavailableDates, existingImages, bookingPolicy, caretaker
        } = req.body;

        farmhouse.name = name || farmhouse.name;
        farmhouse.description = description || farmhouse.description;
        farmhouse.type = type || farmhouse.type;
        farmhouse.location = location ? (typeof location === 'string' ? JSON.parse(location) : location) : farmhouse.location;
        farmhouse.amenities = amenities ? (typeof amenities === 'string' ? JSON.parse(amenities) : amenities) : farmhouse.amenities;
        farmhouse.pricing = pricing ? (typeof pricing === 'string' ? JSON.parse(pricing) : pricing) : farmhouse.pricing;
        farmhouse.capacity = capacity ? (typeof capacity === 'string' ? JSON.parse(capacity) : capacity) : farmhouse.capacity;
        farmhouse.rules = rules ? (typeof rules === 'string' ? JSON.parse(rules) : rules) : farmhouse.rules;
        farmhouse.bookingPolicy = bookingPolicy ? (typeof bookingPolicy === 'string' ? JSON.parse(bookingPolicy) : bookingPolicy) : farmhouse.bookingPolicy;
        farmhouse.caretaker = caretaker ? (typeof caretaker === 'string' ? JSON.parse(caretaker) : caretaker) : farmhouse.caretaker;

        if (isActive !== undefined) farmhouse.isActive = isActive;
        if (unavailableDates) {
            farmhouse.unavailableDates = typeof unavailableDates === 'string' ? JSON.parse(unavailableDates) : unavailableDates;
        }

        // Handle Images
        let finalImages = [];
        if (existingImages) {
            finalImages = typeof existingImages === 'string' ? JSON.parse(existingImages) : existingImages;
        } else {
            finalImages = farmhouse.images;
        }

        if (req.files && req.files.length > 0) {
            const newImagePaths = req.files.map(file => file.path);
            finalImages = [...finalImages, ...newImagePaths];
        }

        farmhouse.images = finalImages;

        const updatedFarmhouse = await farmhouse.save();
        res.json(updatedFarmhouse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete farmhouse
// @route   DELETE /api/farmhouses/:id
// @access  Private (Vendor only)
const deleteFarmhouse = async (req, res) => {
    try {
        const farmhouse = await Farmhouse.findById(req.params.id);

        if (!farmhouse) {
            return res.status(404).json({ message: 'Farmhouse not found' });
        }

        if (farmhouse.vendor.toString() !== req.vendor.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await farmhouse.deleteOne();
        res.json({ message: 'Farmhouse removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Search farmhouses
// @route   GET /api/farmhouses/search
// @access  Public
const searchFarmhouses = async (req, res) => {
    try {
        const { location, checkIn, checkOut, guests, minPrice, maxPrice, amenities, sortBy } = req.query;

        let query = { isActive: true, verificationStatus: 'approved' };

        // Location Search
        if (location) {
            query.$or = [
                { 'location.city': { $regex: location, $options: 'i' } },
                { 'location.state': { $regex: location, $options: 'i' } },
                { 'location.address': { $regex: location, $options: 'i' } },
                { name: { $regex: location, $options: 'i' } }
            ];
        }

        // Guest Capacity
        if (guests) {
            query['capacity.maxGuests'] = { $gte: parseInt(guests) };
        }

        // Price Range
        if (minPrice || maxPrice) {
            query['pricing.basePrice'] = {};
            if (minPrice) query['pricing.basePrice'].$gte = parseInt(minPrice);
            if (maxPrice) query['pricing.basePrice'].$lte = parseInt(maxPrice);
        }

        // Amenities Filter
        if (amenities) {
            const amenitiesList = amenities.split(',');
            query.amenities = { $all: amenitiesList };
        }

        // Date Availability Check
        if (checkIn && checkOut) {
            const requestedCheckIn = new Date(checkIn);
            const requestedCheckOut = new Date(checkOut);

            // Find bookings that overlap with requested dates
            // We'll filter out farmhouses that have conflicting bookings
            // Note: This is a simplified check. Ideally, we'd query bookings separately or use aggregation.
            // For now, let's assume unavailableDates in Farmhouse model is used for manual blocks
            // and we might need to look up Bookings collection for real-time availability.

            // Checking manual blocks
            query.unavailableDates = {
                $not: {
                    $elemMatch: {
                        $or: [
                            { date: { $gte: requestedCheckIn, $lte: requestedCheckOut } }
                        ]
                    }
                }
            };
        }

        let sortOption = {};
        switch (sortBy) {
            case 'price_low':
                sortOption = { 'pricing.basePrice': 1 };
                break;
            case 'price_high':
                sortOption = { 'pricing.basePrice': -1 };
                break;
            case 'rating':
                sortOption = { averageRating: -1 };
                break;
            case 'newest':
                sortOption = { createdAt: -1 };
                break;
            default:
                sortOption = { averageRating: -1, createdAt: -1 }; // Relevance/Popularity
        }

        // Filter by Admin Verified Vendors only
        const verifiedVendors = await Vendor.find({
            isVerified: true
        }).select('_id');
        const verifiedVendorIds = verifiedVendors.map(v => v._id);
        query.vendor = { $in: verifiedVendorIds };

        const farmhouses = await Farmhouse.find(query).sort(sortOption);

        // If dates are provided, we should also filter by actual Bookings
        // This requires a secondary check against the Booking collection
        if (checkIn && checkOut) {
            const Booking = require('../models/Booking');
            const requestedCheckIn = new Date(checkIn);
            const requestedCheckOut = new Date(checkOut);

            const conflictingBookings = await Booking.find({
                status: { $in: ['confirmed', 'pending_confirmation'] },
                $or: [
                    { checkIn: { $lt: requestedCheckOut }, checkOut: { $gt: requestedCheckIn } }
                ]
            }).select('farmhouse');

            const conflictingFarmhouseIds = conflictingBookings.map(b => b.farmhouse.toString());

            const availableFarmhouses = farmhouses.filter(f => !conflictingFarmhouseIds.includes(f._id.toString()));
            return res.json(availableFarmhouses);
        }

        res.json(farmhouses);
    } catch (error) {
        console.error('Search Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all active farmhouses (Public)
// @route   GET /api/farmhouses
// @access  Public
const getAllFarmhouses = async (req, res) => {
    try {
        // Get admin-verified vendors only
        const verifiedVendors = await Vendor.find({
            isVerified: true
        }).select('_id');
        const verifiedVendorIds = verifiedVendors.map(v => v._id);

        const farmhouses = await Farmhouse.find({
            isActive: true,
            verificationStatus: 'approved',
            vendor: { $in: verifiedVendorIds }
        }).sort({ createdAt: -1 });

        res.json(farmhouses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    createFarmhouse,
    getMyFarmhouses,
    getFarmhouse,
    updateFarmhouse,
    deleteFarmhouse,
    getAllFarmhouses,
    searchFarmhouses
};
