const express = require('express');
const router = express.Router();
const { registerBusiness } = require('../controllers/businessController');

// @route   POST /api/businesses/register
// @desc    Register a new business
// @access  Public
router.post('/register', registerBusiness);

module.exports = router;
