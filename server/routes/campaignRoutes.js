const express = require('express');
const router = express.Router();
const { createCampaign, getCampaigns, getCampaignById, updateCampaign } = require('../controllers/campaignController');
const { auth, checkRole } = require('../middleware/authMiddleware');

router.post('/', auth, checkRole(['Admin', 'Super Admin']), createCampaign);
router.get('/', auth, getCampaigns);
router.get('/:id', auth, getCampaignById);
router.put('/:id', auth, checkRole(['Admin', 'Super Admin']), updateCampaign);

module.exports = router;
