const express = require('express');
const router = express.Router();
const { createQuotation, getAgentQuotations } = require('../controllers/quotationController');
const { auth } = require('../middleware/authMiddleware');

router.post('/', auth, createQuotation);
router.get('/', auth, getAgentQuotations);

module.exports = router;
