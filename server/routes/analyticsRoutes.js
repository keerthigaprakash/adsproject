const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/analyticsController');
const { auth } = require('../middleware/authMiddleware');

router.get('/summary', auth, getDashboardStats);

module.exports = router;
