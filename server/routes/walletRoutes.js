const express = require('express');
const router = express.Router();
const { getWallet, getTransactions } = require('../controllers/walletController');
const { auth } = require('../middleware/authMiddleware');

router.get('/', auth, getWallet);
router.get('/transactions', auth, getTransactions);

module.exports = router;
