const express = require('express');
const router = express.Router();
const { getEarningsStats } = require('../controllers/earningsController');
const { protect } = require('../middleware/vendorAuthMiddleware');

router.use(protect);

router.get('/stats', getEarningsStats);

module.exports = router;
