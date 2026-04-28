const express = require('express');
const router = express.Router();
const { getDashboardStats, getChartData, getReport, getAnalyticsGraph, getSpendAnalytics } = require('../controllers/analyticsController');
const { auth } = require('../middleware/authMiddleware');

router.get('/summary', auth, getDashboardStats);
router.get('/charts', auth, getChartData);
router.get('/report', auth, getReport);
router.get('/spend', auth, getSpendAnalytics);
router.get('/', getAnalyticsGraph);

module.exports = router;
