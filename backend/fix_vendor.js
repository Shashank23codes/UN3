const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

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

const vendorSchema = new mongoose.Schema({
    isVerified: Boolean
}, { strict: false });
const Vendor = mongoose.model('Vendor', vendorSchema);

const fix = async () => {
    await connectDB();

    // Find the farmhouse with ID starting with 693a801...
    // Since we don't know the full ID, we iterate
    const farmhouses = await Farmhouse.find({});
    let targetFarmhouse = null;

    for (const f of farmhouses) {
        if (f._id.toString().startsWith('693a801')) {
            targetFarmhouse = f;
            break;
        }
    }

    if (!targetFarmhouse) {
        console.log('Farmhouse not found matching 693a801...');
        process.exit(1);
    }

    console.log(`Found Farmhouse: ${targetFarmhouse.name} (${targetFarmhouse._id})`);

    if (targetFarmhouse.vendor) {
        const vendor = await Vendor.findById(targetFarmhouse.vendor);
        if (vendor) {
            console.log(`Vendor: ${vendor.name} (${vendor._id}). Verified: ${vendor.isVerified}`);
            if (!vendor.isVerified) {
                console.log('Verifying vendor now...');
                vendor.isVerified = true;
                await vendor.save();
                console.log('Vendor verified successfully!');
            } else {
                console.log('Vendor is already verified.');
            }
        } else {
            console.log('Vendor not found!');
        }
    } else {
        console.log('Farmhouse has no vendor!');
    }

    process.exit();
};

fix();
