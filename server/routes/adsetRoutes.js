const express = require('express');
const router = express.Router();
const { createAdSet, getAdSets, getAdSetById, updateAdSet } = require('../controllers/adsetController');
const { auth, checkRole } = require('../middleware/authMiddleware');

router.post('/', auth, checkRole(['Admin', 'Super Admin']), createAdSet);
router.get('/', auth, getAdSets);
router.get('/:id', auth, getAdSetById);
router.put('/:id', auth, checkRole(['Admin', 'Super Admin']), updateAdSet);

module.exports = router;
