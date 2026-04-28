const express = require('express');
const router = express.Router();
const {
  createRequest, getMyRequests,
  getAgentResponses, getAdminResponses,
  respondToRequest, getAllTheatreRequests
} = require('../controllers/theatreRequestController');
const { theatreAuth } = require('../middleware/theatreAuthMiddleware');
const { auth, checkRole } = require('../middleware/authMiddleware');

// Theatre user routes (use x-theatre-token)
router.post('/', theatreAuth, createRequest);
router.get('/my', theatreAuth, getMyRequests);
router.get('/my/agent-responses', theatreAuth, getAgentResponses);
router.get('/my/admin-responses', theatreAuth, getAdminResponses);

// Admin / Agent routes (use x-auth-token — existing auth)
router.get('/all', auth, checkRole(['Admin', 'Super Admin', 'Agent']), getAllTheatreRequests);
router.put('/:id/respond', auth, checkRole(['Admin', 'Super Admin', 'Agent']), respondToRequest);

module.exports = router;
