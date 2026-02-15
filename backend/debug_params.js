const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URL);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const farmhouseSchema = new mongoose.Schema({}, { strict: false });
const Farmhouse = mongoose.model('Farmhouse', farmhouseSchema);

const debug = async () => {
    await connectDB();

    console.log('Searching for farmhouses...');
    const farmhouses = await Farmhouse.find({});

    console.log(`Found ${farmhouses.length} farmhouses.`);

    farmhouses.forEach(f => {
        const idStr = f._id.toString();
        // Check if it matches the prefix from user report '693a801' (assuming this is part of the hex)
        // Actually, user said 693a801... let's just print all IDs and their vendor verification status.
        // We need to populate vendor to check verification
        console.log(`ID: ${idStr}, Name: ${f.name}, VendorID: ${f.vendor}`);
    });

    // We can also try to find the specific one if we knew the full ID.
    // Let's also check Vendors content if we can.

    const vendorSchema = new mongoose.Schema({}, { strict: false });
    const Vendor = mongoose.model('Vendor', vendorSchema);

    // Check vendors for the farmhouses
    for (const f of farmhouses) {
        if (f.vendor) {
            const v = await Vendor.findById(f.vendor);
            if (v) {
                console.log(`Farmhouse ${f._id} -> Vendor ${v._id} (${v.name}): isVerified=${v.isVerified}`);
            } else {
                console.log(`Farmhouse ${f._id} -> Vendor ${f.vendor} NOT FOUND`);
            }
        } else {
            console.log(`Farmhouse ${f._id} -> No Vendor`);
        }
    }

    process.exit();
};

debug();
