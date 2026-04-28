const express = require('express');
const router = express.Router();
const { register, login, getMe, debugCheck } = require('../controllers/theatreAuthController');
const { theatreAuth } = require('../middleware/theatreAuthMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', theatreAuth, getMe);
router.get('/debug-check', debugCheck);   // TEMPORARY — remove after debugging

module.exports = router;
