const express = require('express');
const router = express.Router();
const { createRequest, getRequests, updateStatus, getApprovedAds } = require('../controllers/requestController');
const { auth, checkRole } = require('../middleware/authMiddleware');

router.post('/', auth, checkRole(['Agent']), createRequest);
router.get('/', auth, checkRole(['Admin', 'Super Admin']), getRequests);
router.put('/:id', auth, checkRole(['Admin', 'Super Admin']), updateStatus);
router.get('/approved', auth, checkRole(['Agent']), getApprovedAds);

module.exports = router;
