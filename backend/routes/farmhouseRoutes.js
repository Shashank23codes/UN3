const express = require('express');
const router = express.Router();
const {
    createFarmhouse,
    getMyFarmhouses,
    getFarmhouse,
    updateFarmhouse,
    deleteFarmhouse,
    getAllFarmhouses,
    searchFarmhouses
} = require('../controllers/farmhouseController');
const { protect } = require('../middleware/vendorAuthMiddleware');
const upload = require('../config/cloudinary');

// Specific routes MUST come before parameterized routes (/:id)

// Public: Search Farmhouses
router.get('/search', searchFarmhouses);

// Protected: Get Vendor's Farmhouses
router.get('/my-farmhouses', protect, getMyFarmhouses);

// Public: Get All Active Farmhouses
router.get('/', getAllFarmhouses);

// Public: Get Single Farmhouse
router.get('/:id', getFarmhouse);

// Protected: Create Farmhouse
router.post('/', protect, upload.array('images', 10), createFarmhouse);

// Protected: Update/Delete Farmhouse
router.put('/:id', protect, upload.array('images', 10), updateFarmhouse);
router.delete('/:id', protect, deleteFarmhouse);

module.exports = router;
