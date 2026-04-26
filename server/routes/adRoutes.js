const express = require('express');
const router = express.Router();
const { createAd, getAds, getAdById, trackActivity, deleteAd } = require('../controllers/adController');
const { auth, checkRole } = require('../middleware/authMiddleware');

router.post('/', auth, checkRole(['Admin', 'Super Admin']), createAd);
router.get('/', auth, getAds);
router.get('/:id', auth, getAdById);
router.post('/:id/track', auth, trackActivity);
router.delete('/:id', auth, checkRole(['Admin', 'Super Admin']), deleteAd);

module.exports = router;
